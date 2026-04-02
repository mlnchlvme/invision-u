import { useState, useEffect } from 'react';
import '../../styles/components/Video.css';
import StatusBadge from '../shared/StatusBadge';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { IconCamera, IconVideo, IconStop, IconCheck, IconCelebrate } from '../icons';

export default function CandidateVideo() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('liveness');
  const [countdown, setCountdown] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.appId) {
      applicationsApi.getVideoQs(user.appId)
        .then(data => {
          if (data?.questions?.length) setQuestionId(data.questions[0]);
        })
        .catch(() => {});
    }
  }, [user?.appId]);

  useEffect(() => {
    let t;
    if (recording) t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const startCountdown = () => {
    setCountdown(3);
    const go = n => {
      if (n === 0) { setPhase('record'); setRecording(true); setCountdown(null); return; }
      setTimeout(() => { setCountdown(n - 1); go(n - 1); }, 1000);
    };
    go(3);
  };

  const stopRec = async () => {
    setRecording(false);
    setPhase('upload');
    const mockUrl = `https://cdn.invisionu.kz/videos/${Date.now()}.mp4`;
    setVideoUrl(mockUrl);

    if (user?.appId) {
      setSaving(true);
      try {
        await applicationsApi.updateVideo(user.appId, {
          question_id: questionId || 'default',
          video_url: mockUrl,
        });
      } catch {}
      setSaving(false);
    }

    setTimeout(() => setPhase('done'), 2200);
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const TIPS = [
    'Говорите чётко и уверенно, смотрите в камеру',
    'Расскажите о вашей мотивации и целях поступления',
    'Упомяните ключевые достижения из школьного опыта',
    'Ответьте: почему именно inVision U? Что вас вдохновляет?',
    'Длительность: 2–3 минуты. Краткость ценится.',
  ];

  const livenessSteps = [
    { label: 'Смотрите прямо в камеру',          done: true  },
    { label: 'Медленно поверните голову влево',   done: true  },
    { label: 'Медленно поверните голову вправо',  done: false },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Видео-представление</h1>
        <p>Расскажите о себе за 2–3 минуты на русском или английском языке</p>
      </div>

      <div className="content fade-in">
        {phase === 'liveness' && (
          <div className="video-stage">
            <h3>Проверка личности (Liveness)</h3>
            <p className="text-muted" style={{ marginBottom: 18, fontSize: 13, fontWeight: 500 }}>
              Перед записью убедитесь, что вы — это вы. Следуйте инструкциям на экране.
            </p>
            <div className="video-preview">
              <IconCamera size={36} style={{ opacity: 0.35 }} />
            </div>
            <div style={{ marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
              {livenessSteps.map((step, i) => (
                <div key={i} className={`liveness-step ${step.done ? 'liveness-step--done' : 'liveness-step--wait'}`}>
                  <span style={{ width: 20, flexShrink: 0, display: 'flex', color: step.done ? 'var(--green)' : 'var(--muted-light)' }}>
                    {step.done ? <IconCheck size={16} /> : <span style={{ fontSize: 14 }}>○</span>}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setPhase('pre-record')}>
              Liveness пройден — Начать запись
            </button>
          </div>
        )}

        {phase === 'pre-record' && (
          <div className="video-stage">
            <h3>Готовы к записи?</h3>
            <div className="video-preview">
              {countdown !== null
                ? <span style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--accent)' }}>{countdown}</span>
                : <IconVideo size={36} style={{ opacity: 0.35 }} />}
            </div>
            <p className="text-muted" style={{ marginBottom: 18, fontSize: 13, fontWeight: 500 }}>
              Убедитесь: фон нейтральный, освещение хорошее, микрофон работает.
            </p>
            <button className="btn btn-dark" onClick={startCountdown}>
              Начать запись (обратный отсчёт 3с)
            </button>
          </div>
        )}

        {phase === 'record' && (
          <div className="video-stage">
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div className="rec-indicator">
                <div className="rec-dot" /> REC {fmt(elapsed)}
              </div>
              <span className="text-muted text-sm" style={{ fontWeight: 600 }}>макс. 3:00</span>
            </div>
            <div className="video-preview video-preview--recording">
              <IconVideo size={36} style={{ opacity: 0.5 }} />
            </div>
            <div className="progress-bar" style={{ maxWidth: 480, margin: '0 auto 18px' }}>
              <div className="fill" style={{ width: `${Math.min((elapsed / 180) * 100, 100)}%`, background: elapsed > 150 ? 'var(--red)' : 'var(--accent)' }} />
            </div>
            <button className="btn btn-red" onClick={stopRec}>
              <IconStop size={14} />
              Остановить и сохранить
            </button>
          </div>
        )}

        {phase === 'upload' && (
          <div className="processing">
            <div className="spinner" />
            <h2>Загрузка видео...</h2>
            <p className="text-muted" style={{ fontWeight: 500 }}>Это займёт несколько секунд</p>
            <div className="progress-bar" style={{ width: 240 }}>
              <div className="fill" style={{ width: '65%' }} />
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="processing slide-up">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCheck size={32} />
            </div>
            <h2>Видео загружено!</h2>
            <p className="text-muted" style={{ fontWeight: 500 }}>
              Ваша заявка передана на рассмотрение комиссии inVision U
            </p>
            <StatusBadge status="review" />
          </div>
        )}

        {phase !== 'upload' && phase !== 'done' && (
          <div className="card mt-16">
            <h3>Советы для записи</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIPS.map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
