import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/components/Questions.css';
import { questionsApi } from '../../api/questions';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { QUESTIONS as FALLBACK_QUESTIONS } from '../../data/mockData';
import { IconCheck } from '../icons';
import { toast } from '../shared/Toast';
import { NetworkErrorBanner } from '../shared/ErrorBoundary';

const WORDS_MIN = 300;
const WORDS_MAX = 800;

function wordCount(text) {
  return text?.split(/\s+/).filter(Boolean).length || 0;
}

function WordCounter({ text }) {
  const { t } = useTranslation();
  const count = wordCount(text);
  const tooShort = count > 0 && count < WORDS_MIN;
  const tooLong  = count > WORDS_MAX;
  const ok       = count >= WORDS_MIN && count <= WORDS_MAX;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        className="text-sm"
        style={{
          fontWeight: 700,
          color: ok ? 'var(--green)' : tooLong ? 'var(--red)' : 'var(--text)',
        }}
      >
        {count}
      </span>
      <span className="text-muted text-sm" style={{ fontWeight: 600 }}>
        {t('candidate.words_counter', { min: WORDS_MIN, max: WORDS_MAX })}
      </span>
      {tooShort && (
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
          {t('candidate.words_warn_low')}
        </span>
      )}
      {tooLong && (
        <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
          {t('candidate.words_warn_high')}
        </span>
      )}
    </div>
  );
}

export default function CandidateQuestions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const appId = user?.appId;

  const [questions, setQuestions]   = useState([]);
  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState([]);
  const [submitted, setSubmitted]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [networkError, setNetworkError] = useState(false);

  const draftKey = appId ? `answers_draft_${appId}` : null;

  const loadDraft = useCallback((qs) => {
    if (!draftKey) return Array(qs.length).fill('');
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey));
      if (Array.isArray(saved) && saved.length === qs.length) return saved;
    } catch {}
    return Array(qs.length).fill('');
  }, [draftKey]);

  const saveDraftToStorage = useCallback((ans) => {
    if (!draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(ans));
    } catch {}
  }, [draftKey]);

  const loadQuestions = useCallback(() => {
    setLoading(true);
    setNetworkError(false);
    questionsApi.list('foundation')
      .then(data => {
        const qs = (data && data.length) ? data : FALLBACK_QUESTIONS;
        setQuestions(qs);
        setAnswers(loadDraft(qs));
      })
      .catch((err) => {
        const qs = FALLBACK_QUESTIONS;
        setQuestions(qs);
        setAnswers(loadDraft(qs));
        if (err?.message === 'NETWORK_ERROR') setNetworkError(true);
      })
      .finally(() => setLoading(false));
  }, [loadDraft]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const autoSaveTimer = useRef(null);
  const handleAnswerChange = (idx, value) => {
    const updated = [...answers];
    updated[idx] = value;
    setAnswers(updated);

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveDraftToStorage(updated), 500);
  };

  const saveToApi = async (ans = answers) => {
    if (!appId) return;
    setSaving(true);
    try {
      const payload = questions.map((q, i) => ({
        question_id: String(q.id),
        text: ans[i] || '',
      }));
      await applicationsApi.updateAnswers(appId, { answers: payload });
      toast(t('candidate.toast_saved'), 'success');
    } catch (err) {
      if (err?.message === 'NETWORK_ERROR') {
        toast(t('candidate.toast_offline'), 'error');
      } else {
        toast(t('candidate.toast_save_error'), 'error');
      }
    }
    setSaving(false);
  };

  const submit = async () => {
    await saveToApi();
    if (draftKey) localStorage.removeItem(draftKey);
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
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconCheck size={28} />
        </div>
        <h2>{t('candidate.submitted_title')}</h2>
        <p className="text-muted" style={{ fontWeight: 500 }}>
          {t('candidate.submitted_desc')}
        </p>
      </div>
    );
  }

  const q = questions[current];
  const currentAnswer = answers[current] || '';
  const allFilled = answers.every((a, i) => wordCount(a) >= WORDS_MIN || questions[i]?.optional);
  const count = wordCount(currentAnswer);
  const charCount = currentAnswer.length;

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('candidate.essays_title')}</h1>
            <p>
              {draftKey
                ? t('candidate.essays_subtitle', { current: current + 1, total: questions.length })
                : t('candidate.essays_subtitle_no_draft', { current: current + 1, total: questions.length })
              }
            </p>
          </div>
          <div className="progress-bar" style={{ width: 100 }}>
            <div
              className="fill"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="content fade-in">
        {networkError && (
          <NetworkErrorBanner onRetry={loadQuestions} />
        )}

        <div className="q-nav-tabs">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`q-nav-tab ${i === current ? 'active' : ''} ${wordCount(answers[i]) >= WORDS_MIN ? 'done' : ''}`}
              onClick={() => { saveToApi(); setCurrent(i); }}
              title={`${t('candidate.question_label', { num: i + 1 })}${wordCount(answers[i]) > 0 ? ` · ${wordCount(answers[i])} ${t('candidate.words')}` : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="question-card">
          <div className="q-num">{t('candidate.question_label', { num: current + 1 })}</div>
          <div className="q-text">{q?.text}</div>

          <textarea
            className="answer-area w-full"
            placeholder={t('candidate.answer_placeholder')}
            value={currentAnswer}
            onChange={e => handleAnswerChange(current, e.target.value)}
            style={{
              borderColor: count > 0 && count < WORDS_MIN
                ? 'rgba(234,84,85,.4)'
                : count > WORDS_MAX
                  ? 'rgba(234,84,85,.6)'
                  : undefined,
            }}
          />

          <div className="flex justify-between items-center mt-8">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <WordCounter text={currentAnswer} />
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                {charCount} {t('candidate.chars_counter')}
              </span>
            </div>

            <div className="flex gap-8">
              {current > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { saveToApi(); setCurrent(c => c - 1); }}
                >
                  {t('candidate.prev')}
                </button>
              )}
              {current < questions.length - 1 ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { saveToApi(); setCurrent(c => c + 1); }}
                >
                  {t('candidate.next')}
                </button>
              ) : (
                <button
                  className="btn btn-dark"
                  onClick={submit}
                  disabled={saving}
                  title={!allFilled ? t('candidate.words_hint') : undefined}
                >
                  {saving ? t('candidate.saving') : t('candidate.submit_all')}
                </button>
              )}
            </div>
          </div>

          {current === questions.length - 1 && !allFilled && (
            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: 'rgba(234,84,85,.08)',
              border: '1.5px solid rgba(234,84,85,.2)',
              borderRadius: 'var(--r)',
              fontSize: 12, color: 'var(--red)', fontWeight: 600,
            }}>
              {answers.map((a, i) => wordCount(a) < WORDS_MIN
                ? t('candidate.fill_warning_item', { num: i + 1, count: wordCount(a), min: WORDS_MIN })
                : null
              ).filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}