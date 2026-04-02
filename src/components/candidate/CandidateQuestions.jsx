import { useState, useEffect } from 'react';
import '../../styles/components/Questions.css';
import { questionsApi } from '../../api/questions';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { QUESTIONS as FALLBACK_QUESTIONS } from '../../data/mockData';
import { IconCheck } from '../icons';
import { toast } from '../shared/Toast';

export default function CandidateQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionsApi.list('foundation')
      .then(data => {
        if (data && data.length) {
          setQuestions(data);
          setAnswers(Array(data.length).fill(''));
        } else {
          setQuestions(FALLBACK_QUESTIONS);
          setAnswers(Array(FALLBACK_QUESTIONS.length).fill(''));
        }
      })
      .catch(() => {
        setQuestions(FALLBACK_QUESTIONS);
        setAnswers(Array(FALLBACK_QUESTIONS.length).fill(''));
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!user?.appId) return;
    setSaving(true);
    try {
      const payload = questions.map((q, i) => ({ question_id: String(q.id), text: answers[i] }));
      await applicationsApi.updateAnswers(user.appId, { answers: payload });
      toast('Ответы сохранены', 'success');
    } catch {
      toast('Не удалось сохранить', 'error');
    }
    setSaving(false);
  };

  const submit = async () => {
    await save();
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="content fade-in">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 40, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="processing slide-up">
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCheck size={28} />
        </div>
        <h2>Ответы отправлены</h2>
        <p className="text-muted" style={{ fontWeight: 500 }}>Перейдите к следующему этапу — AI-интервью</p>
      </div>
    );
  }

  const q = questions[current];
  const wordCount = answers[current]?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Письменные ответы</h1>
            <p>Вопрос {current + 1} из {questions.length} · ответы сохраняются автоматически</p>
          </div>
          <div className="progress-bar" style={{ width: 100 }}>
            <div className="fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="content fade-in">
        <div className="q-nav-tabs">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`q-nav-tab ${i === current ? 'active' : ''} ${answers[i] ? 'done' : ''}`}
              onClick={() => setCurrent(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="question-card">
          <div className="q-num">Вопрос {current + 1}</div>
          <div className="q-text">{q?.text}</div>
          <textarea
            className="answer-area w-full"
            placeholder="Введите ваш ответ (300–500 слов рекомендуется)..."
            value={answers[current] || ''}
            onChange={e => {
              const a = [...answers];
              a[current] = e.target.value;
              setAnswers(a);
            }}
          />
          <div className="flex justify-between items-center mt-8">
            <span className="text-muted text-sm" style={{ fontWeight: 600 }}>
              <span style={{ color: wordCount >= 300 ? 'var(--green)' : 'var(--text)', fontWeight: 700 }}>
                {wordCount}
              </span>
              {' '}/ 300–500 слов
            </span>
            <div className="flex gap-8">
              {current > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => { save(); setCurrent(c => c - 1); }}>
                  ← Назад
                </button>
              )}
              {current < questions.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={() => { save(); setCurrent(c => c + 1); }}>
                  Далее →
                </button>
              ) : (
                <button className="btn btn-dark" onClick={submit} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Отправить все ответы'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
