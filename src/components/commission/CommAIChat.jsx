import { useState, useEffect, useRef } from 'react';
import '../../styles/components/Chat.css';
import { COMM_AI_INIT, AI_REPLIES } from '../../data/mockData';
import { IconBot, IconSend, IconZap } from '../icons';

const QUICK_PROMPTS = [
  'Сводка по кандидатам',
  'Топ-5 по AI Score',
  'Статистика по городам',
  'Средний балл UNT',
];

export default function CommAIChat() {
  const [msgs, setMsgs]     = useState(COMM_AI_INIT);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { role: 'ai', text: AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)] }]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="chat-layout" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>AI-ассистент комиссии</h1>
            <p>Анализ данных, сводки по кандидатам, помощь в принятии решений</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', border: '1.5px solid rgba(192,241,28,.35)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800, letterSpacing: '.04em', color: 'var(--accent-dark)' }}>
            <IconZap size={11} />
            AI онлайн
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 32px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="btn btn-ghost btn-sm" onClick={() => send(p)} style={{ fontSize: 11 }}>
            {p}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`} style={{ animation: 'fadeIn .25s ease both' }}>
            <div className="chat-bubble">{m.text}</div>
            <div className="chat-meta">{m.role === 'ai' ? 'AI-ассистент · inVision U' : 'Вы'}</div>
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
          placeholder="Спроси что-нибудь о кандидатах или статистике..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="btn btn-primary" onClick={() => send()}>
          <IconSend size={14} />
          Отправить
        </button>
      </div>
    </div>
  );
}
