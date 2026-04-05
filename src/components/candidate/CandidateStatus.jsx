import { useState, useEffect } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/applications';
import { IconInfo, IconCheck, IconWarn, IconUpload } from '../icons';
import { toast } from '../shared/Toast';

// 1.3 — маппинг данных API → шаги прогресса
function mapApiStepsToUI(apiDetail) {
  const status       = apiDetail?.status || 'draft';
  const hasAnswers   = !!apiDetail?.answers?.length;
  const hasVideo     = !!apiDetail?.video_url;
  const hasInterview = !!apiDetail?.interview_completed;

  return [
    { id: 1, label: 'Регистрация',        desc: 'Аккаунт создан на портале',          status: 'done' },
    { id: 2, label: 'Анкета и документы', desc: 'Аттестат, рекомендации',             status: apiDetail?.documents?.ent_score ? 'done' : 'active' },
    { id: 3, label: 'Письменные ответы',  desc: '3 мотивационных эссе',               status: hasAnswers ? 'done' : (apiDetail?.documents?.ent_score ? 'active' : 'wait') },
    { id: 4, label: 'AI-интервью',        desc: 'Адаптивные вопросы по D.R.I.V.E.',  status: hasInterview ? 'done' : (hasAnswers ? 'active' : 'wait') },
    { id: 5, label: 'Видеозапись',        desc: 'Самопрезентация 2–3 минуты',         status: hasVideo ? 'done' : (hasInterview ? 'active' : 'wait') },
    { id: 6, label: 'Обработка',          desc: 'AI-анализ + ревью комиссии',         status: ['review', 'approved', 'rejected'].includes(status) ? (status === 'review' ? 'active' : 'done') : 'wait' },
    { id: 7, label: 'Решение',            desc: 'Уведомление по email до 30 мая',     status: ['approved', 'rejected'].includes(status) ? 'done' : 'wait' },
  ];
}

const FIELDS = [
  { key: 'ent_score',       label: 'ЕНТ балл',       type: 'number', min: 0,   max: 140,  step: 1,    required: true,  hint: 'от 0 до 140',   placeholder: 'макс. 140' },
  { key: 'ielts_score',     label: 'IELTS',           type: 'number', min: 0,   max: 9,    step: 0.5,  required: false, hint: 'от 0.0 до 9.0', placeholder: 'необязательно' },
  { key: 'gpa',             label: 'GPA',             type: 'number', min: 0,   max: 4,    step: 0.01, required: false, hint: 'от 0 до 4.0',   placeholder: 'напр. 3.8' },
  { key: 'graduation_year', label: 'Год окончания',   type: 'number', min: 2020, max: 2027, step: 1,   required: true,  hint: '2020–2027',     placeholder: '2025' },
  { key: 'school_name',     label: 'Название школы',  type: 'text',   minLength: 5, maxLength: 200,     required: true,  hint: '5–200 символов', placeholder: 'Средняя школа №...' },
];

function validateField(fieldDef, value) {
  if (fieldDef.required && (value === '' || value == null)) return 'Обязательное поле';
  if (value === '' || value == null) return null;

  if (fieldDef.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return 'Введите число';
    if (fieldDef.min != null && n < fieldDef.min) return `Минимум: ${fieldDef.min}`;
    if (fieldDef.max != null && n > fieldDef.max) return `Максимум: ${fieldDef.max}`;
  }
  if (fieldDef.type === 'text') {
    if (fieldDef.minLength && value.length < fieldDef.minLength) return `Минимум ${fieldDef.minLength} символов`;
    if (fieldDef.maxLength && value.length > fieldDef.maxLength) return `Максимум ${fieldDef.maxLength} символов`;
  }
  return null;
}

function DocumentsForm({ appId, onSaved }) {
  const [form, setForm] = useState({ ent_score: '', ielts_score: '', gpa: '', graduation_year: '', school_name: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const touch = (k) => {
    setTouched(t => ({ ...t, [k]: true }));
    const field = FIELDS.find(f => f.key === k);
    const err = validateField(field, form[k]);
    setErrors(e => ({ ...e, [k]: err }));
  };

  const hasErrors = FIELDS.some(f => {
    const err = validateField(f, form[f.key]);
    return err !== null;
  });

  const save = async () => {
    const allTouched = {};
    const allErrors = {};
    FIELDS.forEach(f => {
      allTouched[f.key] = true;
      allErrors[f.key] = validateField(f, form[f.key]);
    });
    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const payload = {};
      if (form.ent_score)       payload.ent_score       = Number(form.ent_score);
      if (form.ielts_score)     payload.ielts_score     = Number(form.ielts_score);
      if (form.gpa)             payload.gpa             = Number(form.gpa);
      if (form.graduation_year) payload.graduation_year = Number(form.graduation_year);
      if (form.school_name)     payload.school_name     = form.school_name;
      await applicationsApi.updateDocs(appId, payload);
      setSaved(true);
      toast('Данные сохранены', 'success');
      setTimeout(() => setSaved(false), 3000);
      if (onSaved) onSaved();
    } catch {
      toast('Ошибка сохранения', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="card fade-in">
      <h3>Академические данные</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        {FIELDS.map(f => {
          const hasError = touched[f.key] && errors[f.key];
          return (
            <div key={f.key}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5 }}>
                {f.label}{f.required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
              </div>
              <input
                type={f.type}
                placeholder={f.hint || f.placeholder}
                value={form[f.key]}
                min={f.min}
                max={f.max}
                step={f.step}
                maxLength={f.maxLength}
                onChange={e => set(f.key, e.target.value)}
                onBlur={() => touch(f.key)}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: 'var(--r)',
                  padding: '9px 12px',
                  fontFamily: 'var(--font)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text)',
                  outline: 'none',
                  transition: '.15s',
                }}
                onFocus={e => e.target.style.borderColor = hasError ? 'var(--red)' : 'var(--accent)'}
              />
              {hasError && (
                <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, fontWeight: 600 }}>
                  {errors[f.key]}
                </div>
              )}
              {!hasError && f.hint && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {f.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || hasErrors}>
          {saved ? <><IconCheck size={13} /> Сохранено</> : saving ? 'Сохранение...' : <><IconUpload size={13} /> Сохранить данные</>}
        </button>
      </div>
    </div>
  );
}

export default function CandidateStatus() {
  const { user } = useAuth();
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [showDocs, setShowDocs]     = useState(false);

  const load = () => {
    if (!user?.appId) { setLoading(false); return; }
    applicationsApi.getDetail(user.appId)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user?.appId]);

  const submitApp = async () => {
    if (!user?.appId) return;
    setSubmitting(true);
    try {
      const res = await applicationsApi.submit(user.appId);
      setDetail(res);
      setSubmitted(true);
      toast('Заявка успешно отправлена!', 'success');
    } catch (e) {
      toast(e.message || 'Ошибка отправки', 'error');
    }
    setSubmitting(false);
  };

  const appId = detail?.id
    ? `#APP-${String(detail.id).slice(-8).toUpperCase()}`
    : '#APP-2026-0041';

  const status = detail?.status || 'review';
  const canSubmit = status === 'draft' && !submitted;

  const steps = mapApiStepsToUI(detail);

  const docs = [
    { name: 'Аттестат (ЕНТ)',           ok: !!detail?.documents?.ent_score },
    { name: 'Сертификат UNT',            ok: !!detail?.documents?.ent_score },
    { name: 'Рекомендательное письмо',   ok: false },
    { name: 'Видео-представление',       ok: false },
    { name: 'IELTS / TOEFL (если есть)', ok: !!detail?.documents?.ielts_score },
  ];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Моя заявка</h1>
            <p>ID заявки: <span className="mono text-accent">{appId}</span></p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="content fade-in">
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 48, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
          </>
        ) : (
          <>
            {submitted ? (
              <div className="alert-box">
                <IconCheck size={14} />
                Заявка успешно отправлена на рассмотрение!
              </div>
            ) : (
              <div className="alert-box">
                <IconInfo size={14} />
                AI-интервью открыто. Пожалуйста, пройдите его до 1 апреля 2026.
              </div>
            )}

            <div className="flex flex-wrap gap-12">
              <div className="card" style={{ flex: '1 1 280px' }}>
                <h3>Личные данные</h3>
                <div className="info-grid">
                  {[
                    ['Имя',       detail?.full_name || user?.fullName || '—'],
                    ['Программа', detail?.program   || 'Foundation Year'],
                    ['Страна',    detail?.country   || '—'],
                    ['Город',     detail?.city      || '—'],
                    ['Школа',     detail?.documents?.school_name || '—'],
                    ['ЕНТ',       detail?.documents?.ent_score   ? `${detail.documents.ent_score} / 140` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="info-row">
                      <span className="key">{k}</span>
                      <span className="val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ flex: '1 1 240px' }}>
                <h3>Загруженные документы</h3>
                {docs.map(d => (
                  <div key={d.name} className="flex items-center justify-between" style={{ marginBottom: 10, fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{d.name}</span>
                    <span style={{ color: d.ok ? 'var(--green)' : 'var(--amber)', display: 'flex' }}>
                      {d.ok ? <IconCheck size={15} /> : <IconWarn size={15} />}
                    </span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mt-8" onClick={() => setShowDocs(s => !s)}>
                  {showDocs ? '↑ Скрыть форму' : '+ Заполнить данные'}
                </button>
              </div>
            </div>

            {showDocs && (
              <DocumentsForm appId={user?.appId} onSaved={load} />
            )}

            <div className="card">
              <h3>Прогресс по этапам</h3>
              <div className="timeline">
                {steps.map(s => (
                  <div key={s.id} className="tl-item">
                    <div className="relative">
                      <div className={`tl-dot ${s.status}`}>
                        {s.status === 'done' ? <IconCheck size={12} /> : s.id}
                      </div>
                      <div className="tl-line" />
                    </div>
                    <div className="tl-content">
                      <h4 style={{ color: s.status === 'wait' ? 'var(--muted)' : 'var(--text)' }}>
                        {s.label}
                        {s.status === 'active' && (
                          <span style={{ marginLeft: 8, background: 'var(--accent)', color: 'var(--text)', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, letterSpacing: '.05em', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                            Сейчас
                          </span>
                        )}
                      </h4>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {canSubmit && (
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-dark" onClick={submitApp} disabled={submitting}>
                    {submitting ? 'Отправка...' : 'Отправить заявку на рассмотрение'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}