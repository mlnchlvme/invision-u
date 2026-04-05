import { useState, useEffect, useRef } from 'react';
import '../../styles/components/Chat.css';
import { COMM_AI_INIT } from '../../data/mockData';
import { adminApi } from '../../api/admin';
import { IconBot, IconSend, IconZap } from '../icons';

const QUICK_PROMPTS = [
  'Сводка по кандидатам',
  'Топ-5 по AI Score',
  'Статистика по городам',
  'Средний балл UNT',
];

// Формируем контекст из данных дашборда для системного промпта
function buildSystemPrompt(dashboardData) {
  const base = 'Ты AI-ассистент приёмной комиссии образовательной программы inVision U (Foundation Year 2026). Отвечай кратко и по делу на русском языке. Помогай анализировать данные кандидатов, формировать сводки, давать рекомендации по отбору.';
  if (!dashboardData) return base;
  return `${base}\n\nТекущие данные кампании: всего заявок — ${dashboardData.total ?? '?'}, на рассмотрении — ${dashboardData.pending_review ?? '?'}, зона A — ${dashboardData.zone_a ?? '?'}, зона C — ${dashboardData.zone_c ?? '?'}.`;
}

export default function CommAIChat() {
  const [msgs, setMsgs]         = useState(COMM_AI_INIT);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  // Загружаем данные дашборда для контекста AI
  useEffect(() => {
    adminApi.dashboard()
      .then(setDashboardData)
      .catch(() => {});
  }, []);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || typing) return;
    setInput('');

    const userMsg = { role: 'user', text: q };
    setMsgs(m => [...m, userMsg]);
    setTyping(true);

    // Формируем историю для API (без системного сообщения приветствия)
    const history = [...msgs.slice(1), userMsg].map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(dashboardData),
          messages: history,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const aiText = data.content?.find(b => b.type === 'text')?.text || 'Не удалось получить ответ.';
      setMsgs(m => [...m, { role: 'ai', text: aiText }]);
    } catch {
      setMsgs(m => [...m, {
        role: 'ai',
        text: 'Сейчас не могу обратиться к AI. Проверьте подключение или попробуйте позже.',
      }]);
    } finally {
      setTyping(false);
    }
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
        <button className="btn btn-primary" onClick={() => send()} disabled={typing || !input.trim()}>
          <IconSend size={14} />
          Отправить
        </button>
      </div>
    </div>
  );
}