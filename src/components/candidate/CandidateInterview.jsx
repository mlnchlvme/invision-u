import { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/components/Chat.css';
import { interviewApi } from '../../api/interview';
import { useAuth } from '../../context/AuthContext';
import { INTERVIEW_QS } from '../../data/mockData';
import { IconSend } from '../icons';

const FALLBACK_FOLLOW = [
  'Интересно! Можете привести конкретный пример из вашей жизни?',
  'Каков был измеримый результат ваших действий?',
  'Что бы вы сделали иначе, если бы оказались в этой ситуации снова?',
  'Как этот опыт изменил ваши взгляды или подход к жизни?',
];

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const hasSpeech = !!SpeechRecognition;

export default function CandidateInterview() {
  const { user } = useAuth();
  const [msgs, setMsgs]               = useState([]);
  const [input, setInput]             = useState('');
  const [typing, setTyping]           = useState(false);
  const [done, setDone]               = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [progress, setProgress]       = useState({ current: 1, total: 5 });
  const [qIndex, setQIndex]           = useState(0);

  const [voiceMode, setVoiceMode]     = useState(hasSpeech); // включён по умолчанию если доступен
  const [listening, setListening]     = useState(false);
  const [ttsPlaying, setTtsPlaying]   = useState(false);

  const bottomRef   = useRef(null);
  const recogRef    = useRef(null);
  const audioRef    = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const playAudio = useCallback((audioUrl) => {
    if (!audioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setTtsPlaying(true);
    audio.onended  = () => setTtsPlaying(false);
    audio.onerror  = () => setTtsPlaying(false);
    audio.play().catch(() => setTtsPlaying(false));
  }, []);

  const speakBrowser = useCallback((text) => {
    if (!voiceMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ru-RU';
    utt.rate = 0.95;
    setTtsPlaying(true);
    utt.onend = () => setTtsPlaying(false);
    utt.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(utt);
  }, [voiceMode]);

  useEffect(() => {
    if (!user?.appId) {
      setMsgs([{ role: 'ai', text: INTERVIEW_QS[0] }]);
      setProgress({ current: 1, total: INTERVIEW_QS.length });
      if (voiceMode) speakBrowser(INTERVIEW_QS[0]);
      return;
    }
    interviewApi.start(user.appId)
      .then(data => {
        setInterviewId(data.interview_id);
        setProgress({ current: data.question_number, total: data.total_questions });
        setMsgs([{ role: 'ai', text: data.question }]);
        if (voiceMode) {
          data.audio_url ? playAudio(data.audio_url) : speakBrowser(data.question);
        }
      })
      .catch(() => {
        setMsgs([{ role: 'ai', text: INTERVIEW_QS[0] }]);
        setProgress({ current: 1, total: INTERVIEW_QS.length });
        if (voiceMode) speakBrowser(INTERVIEW_QS[0]);
      });
  }, [user?.appId]);

  useEffect(() => () => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    recogRef.current?.stop();
  }, []);

  const sendReal = async (ans) => {
    setTyping(true);
    try {
      const data = await interviewApi.message(interviewId, ans);
      setTyping(false);
      if (data.is_complete) {
        setDone(true);
        const text = 'Спасибо! AI-интервью завершено. Ваши ответы переданы на анализ. Следующий шаг — запись видео-представления.';
        setMsgs(m => [...m, { role: 'ai', text }]);
        if (voiceMode) speakBrowser(text);
      } else {
        setProgress(p => ({ ...p, current: data.question_number }));
        setMsgs(m => [...m, { role: 'ai', text: data.next_question }]);
        if (voiceMode) {
          data.audio_url ? playAudio(data.audio_url) : speakBrowser(data.next_question);
        }
      }
    } catch {
      sendFallback();
    }
  };

  const sendFallback = () => {
    const nextQ = qIndex + 1;
    let aiText;
    if (nextQ < INTERVIEW_QS.length) {
      const follow = Math.random() > 0.4;
      if (follow) {
        aiText = FALLBACK_FOLLOW[Math.floor(Math.random() * FALLBACK_FOLLOW.length)];
      } else {
        setQIndex(nextQ);
        setProgress(p => ({ ...p, current: nextQ + 1 }));
        aiText = INTERVIEW_QS[nextQ];
      }
    } else {
      setDone(true);
      aiText = 'Спасибо! AI-интервью завершено. Ваши ответы переданы на анализ. Следующий шаг — запись видео-представления.';
    }
    setMsgs(m => [...m, { role: 'ai', text: aiText }]);
    if (voiceMode) speakBrowser(aiText);
    setTyping(false);
  };

  const send = (overrideText) => {
    const ans = (overrideText ?? input).trim();
    if (!ans || done) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: ans }]);
    setTyping(true);
    setTimeout(() => {
      interviewId ? sendReal(ans) : sendFallback();
    }, 600);
  };

  const startListening = useCallback(() => {
    if (!hasSpeech || listening) return;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setTtsPlaying(false);

    const recog = new SpeechRecognition();
    recog.lang           = 'ru-RU';
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recogRef.current = recog;

    recog.onstart = () => setListening(true);
    recog.onend   = () => {
      setListening(false);
      recogRef.current = null;
    };
    recog.onerror = () => {
      setListening(false);
      recogRef.current = null;
    };
    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        recog.stop();
        setTimeout(() => send(transcript), 200);
      }
    };
    recog.start();
  }, [listening, send]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
  }, []);

  const toggleVoice = () => {
    if (voiceMode) {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      recogRef.current?.stop();
      setTtsPlaying(false);
      setListening(false);
    }
    setVoiceMode(v => !v);
  };

  const pct = Math.round((progress.current / progress.total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div>
            <h1>AI-интервью</h1>
            <p>Адаптивные вопросы · {progress.current}/{progress.total}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="progress-bar" style={{ width: 120 }}>
              <div className="fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-muted text-sm" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{pct}%</span>
            {hasSpeech && (
              <button
                className={`btn btn-sm ${voiceMode ? 'btn-primary' : 'btn-ghost'}`}
                onClick={toggleVoice}
                title={voiceMode ? 'Выключить голос' : 'Включить голос'}
                style={{ gap: 6 }}
              >
                {voiceMode ? '🎙️ Голос вкл' : '🎙️ Голос выкл'}
              </button>
            )}
            {!hasSpeech && (
              <span className="text-muted text-sm" style={{ fontSize: 11 }}>Текстовый режим</span>
            )}
          </div>
        </div>
      </div>

      <div className="chat-messages" style={{ flex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`} style={{ animation: 'fadeIn .25s ease both' }}>
            <div className="chat-bubble">
              {m.text}
              {/* Индикатор воспроизведения TTS у последнего AI-сообщения */}
              {voiceMode && m.role === 'ai' && i === msgs.length - 1 && ttsPlaying && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
                  ♪ озвучивается...
                </span>
              )}
            </div>
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
          placeholder={
            done       ? 'Интервью завершено' :
            listening  ? '🎙️ Говорите...' :
            voiceMode  ? 'Нажмите 🎙️ или введите текст (Enter)' :
                         'Ваш ответ... (Enter для отправки)'
          }
          disabled={done}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !listening && send()}
        />

        {voiceMode && !done && (
          <button
            className={`btn btn-sm ${listening ? 'btn-red' : 'btn-ghost'}`}
            style={{ minWidth: 44, fontSize: 18, padding: '0 12px' }}
            onClick={listening ? stopListening : startListening}
            title={listening ? 'Остановить запись' : 'Начать говорить'}
            disabled={ttsPlaying}
          >
            {listening
              ? <span style={{ animation: 'pulse 1s infinite' }}>⏹</span>
              : '🎙️'}
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={() => send()}
          disabled={done || !input.trim() || listening}
        >
          <IconSend size={15} />
          Ответить
        </button>
      </div>
    </div>
  );
}