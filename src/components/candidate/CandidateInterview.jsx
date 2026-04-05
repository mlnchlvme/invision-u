import { useState, useEffect, useRef } from 'react';
import '../../styles/components/Chat.css';
import { interviewApi } from '../../api/interview';
import { useAuth } from '../../context/AuthContext';
import { INTERVIEW_QS } from '../../data/mockData';
import { IconSend } from '../icons';

// Fallback-уточняющие вопросы (локально, без mockData)
const FALLBACK_FOLLOW = [
  'Интересно! Можете привести конкретный пример из вашей жизни?',
  'Каков был измеримый результат ваших действий?',
  'Что бы вы сделали иначе, если бы оказались в этой ситуации снова?',
  'Как этот опыт изменил ваши взгляды или подход к жизни?',
];

export default function CandidateInterview() {
  const { user } = useAuth();
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [done, setDone]         = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [progress, setProgress] = useState({ current: 1, total: 5 });
  const [qIndex, setQIndex]     = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  useEffect(() => {
    if (user?.appId) {
      interviewApi.start(user.appId)
        .then(data => {
          setInterviewId(data.interview_id);
          setProgress({ current: data.question_number, total: data.total_questions });
          setMsgs([{ role: 'ai', text: data.question }]);
        })
        .catch(() => {
          setMsgs([{ role: 'ai', text: INTERVIEW_QS[0] }]);
          setProgress({ current: 1, total: INTERVIEW_QS.length });
        });
    } else {
      setMsgs([{ role: 'ai', text: INTERVIEW_QS[0] }]);
      setProgress({ current: 1, total: INTERVIEW_QS.length });
    }
  }, [user?.appId]);

  const sendReal = async (ans) => {
    setTyping(true);
    try {
      const data = await interviewApi.message(interviewId, ans);
      setTyping(false);
      if (data.is_complete) {
        setDone(true);
        setMsgs(m => [...m, { role: 'ai', text: 'Спасибо! AI-интервью завершено. Ваши ответы переданы на анализ. Следующий шаг — запись видео-представления.' }]);
      } else {
        setProgress(p => ({ ...p, current: data.question_number }));
        setMsgs(m => [...m, { role: 'ai', text: data.next_question }]);
      }
    } catch {
      sendFallback();
    }
  };

  const sendFallback = () => {
    const nextQ = qIndex + 1;
    if (nextQ < INTERVIEW_QS.length) {
      const follow = Math.random() > 0.4;
      if (follow) {
        const followUp = FALLBACK_FOLLOW[Math.floor(Math.random() * FALLBACK_FOLLOW.length)];
        setMsgs(m => [...m, { role: 'ai', text: followUp }]);
      } else {
        setQIndex(nextQ);
        setProgress(p => ({ ...p, current: nextQ + 1 }));
        setMsgs(m => [...m, { role: 'ai', text: INTERVIEW_QS[nextQ] }]);
      }
    } else {
      setDone(true);
      setMsgs(m => [...m, { role: 'ai', text: 'Спасибо! AI-интервью завершено. Ваши ответы переданы на анализ. Следующий шаг — запись видео-представления.' }]);
    }
    setTyping(false);
  };

  const send = () => {
    if (!input.trim() || done) return;
    const ans = input.trim();
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: ans }]);
    setTyping(true);
    setTimeout(() => {
      if (interviewId) {
        sendReal(ans);
      } else {
        sendFallback();
      }
    }, 600);
  };

  const pct = Math.round((progress.current / progress.total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>AI-интервью</h1>
            <p>Адаптивные вопросы · {progress.current}/{progress.total}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="progress-bar" style={{ width: 120 }}>
              <div className="fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-muted text-sm" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{pct}%</span>
          </div>
        </div>
      </div>

      <div className="chat-messages" style={{ flex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`} style={{ animation: 'fadeIn .25s ease both' }}>
            <div className="chat-bubble">{m.text}</div>
            <div className="chat-meta">{m.role === 'ai' ? 'AI-интервьюер · inVision U' : 'Вы'}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-msg ai">
            <div className="chat-bubble">
              <div className="chat-typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={done ? 'Интервью завершено' : 'Ваш ответ... (Enter для отправки)'}
          disabled={done}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" onClick={send} disabled={done || !input.trim()}>
          <IconSend size={15} />
          Ответить
        </button>
      </div>
    </div>
  );
}