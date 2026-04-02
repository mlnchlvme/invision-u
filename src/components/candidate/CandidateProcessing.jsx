import { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { IconCheck, IconLightbulb, IconZap } from '../icons';

export default function CandidateProcessing() {
  const { user } = useAuth();
  const [dots, setDots] = useState(0);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (user?.appId) {
      applicationsApi.getStatus(user.appId)
        .then(setStatus)
        .catch(() => {});
    }
  }, [user?.appId]);

  const steps = [
    { label: 'Транскрипция видео',         done: true  },
    { label: 'Анализ письменных ответов',   done: true  },
    { label: 'NLP оценка компетенций',      done: false },
    { label: 'Финальный скоринг',           done: false },
  ];

  return (
    <div className="processing fade-in" style={{ padding: '48px 24px' }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div className="spinner" style={{ width: 64, height: 64, borderWidth: 4 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-dark)' }}>
          <IconZap size={22} />
        </div>
      </div>

      <h2>
        Обработка заявки{'...'.slice(0, dots)}
      </h2>
      <p className="text-muted" style={{ fontWeight: 500, maxWidth: 360 }}>
        AI анализирует ваши ответы и видео. Обычно это занимает 24–48 часов.
        Вы получите уведомление на email.
      </p>

      {status && (
        <div className="card" style={{ width: '100%', maxWidth: 420, marginBottom: 0 }}>
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm" style={{ fontWeight: 600 }}>Статус заявки</span>
            <span className="mono" style={{ fontWeight: 800, fontSize: 12 }}>{status.status}</span>
          </div>
        </div>
      )}

      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <h3>Статус обработки</h3>
        {steps.map((s, i) => (
          <div key={i} className="flex items-center justify-between" style={{ marginBottom: i < steps.length - 1 ? 12 : 0, fontSize: 13 }}>
            <div className="flex items-center gap-8">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.done ? 'var(--green)' : 'var(--border)', flexShrink: 0 }} />
              <span style={{ fontWeight: 500, color: s.done ? 'var(--text)' : 'var(--muted)' }}>{s.label}</span>
            </div>
            {s.done ? (
              <span style={{ color: 'var(--green)', display: 'flex' }}><IconCheck size={15} /></span>
            ) : (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--accent-dim)', border: '1.5px solid rgba(192,241,28,.35)', borderRadius: 'var(--r)', padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--text)', maxWidth: 420, width: '100%', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--accent-dark)', flexShrink: 0, marginTop: 1 }}><IconLightbulb size={14} /></span>
        Используйте это время, чтобы изучить программы и преподавателей inVision U
      </div>
    </div>
  );
}
