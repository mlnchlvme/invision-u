import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/applications';
import { IconInfo, IconCheck, IconWarn, IconUpload } from '../icons';
import { toast } from '../shared/Toast';

function mapApiStepsToUI(apiDetail, t) {
  const status       = apiDetail?.status || 'draft';
  const hasAnswers   = !!apiDetail?.answers?.length;
  const hasVideo     = !!apiDetail?.video_url;
  const hasInterview = !!apiDetail?.interview_completed;

  return [
    { id: 1, label: t('candidate.step_register'),  desc: t('candidate.step_register_desc'),  status: 'done' },
    { id: 2, label: t('candidate.step_docs'),       desc: t('candidate.step_docs_desc'),       status: apiDetail?.documents?.ent_score ? 'done' : 'active' },
    { id: 3, label: t('candidate.step_essays'),     desc: t('candidate.step_essays_desc'),     status: hasAnswers ? 'done' : (apiDetail?.documents?.ent_score ? 'active' : 'wait') },
    { id: 4, label: t('candidate.step_interview'),  desc: t('candidate.step_interview_desc'),  status: hasInterview ? 'done' : (hasAnswers ? 'active' : 'wait') },
    { id: 5, label: t('candidate.step_video'),      desc: t('candidate.step_video_desc'),      status: hasVideo ? 'done' : (hasInterview ? 'active' : 'wait') },
    { id: 6, label: t('candidate.step_processing'), desc: t('candidate.step_processing_desc'), status: ['review', 'approved', 'rejected'].includes(status) ? (status === 'review' ? 'active' : 'done') : 'wait' },
    { id: 7, label: t('candidate.step_decision'),   desc: t('candidate.step_decision_desc'),   status: ['approved', 'rejected'].includes(status) ? 'done' : 'wait' },
  ];
}

function validateField(fieldDef, value, t) {
  if (fieldDef.required && (value === '' || value == null)) return t('candidate.validation_required');
  if (value === '' || value == null) return null;

  if (fieldDef.type === 'number') {
    const n = Number(value);
    if (isNaN(n)) return t('candidate.validation_number');
    if (fieldDef.min != null && n < fieldDef.min) return t('candidate.validation_min', { val: fieldDef.min });
    if (fieldDef.max != null && n > fieldDef.max) return t('candidate.validation_max', { val: fieldDef.max });
  }
  if (fieldDef.type === 'text') {
    if (fieldDef.minLength && value.length < fieldDef.minLength) return t('candidate.validation_minlen', { val: fieldDef.minLength });
    if (fieldDef.maxLength && value.length > fieldDef.maxLength) return t('candidate.validation_maxlen', { val: fieldDef.maxLength });
  }
  return null;
}

function DocumentsForm({ appId, onSaved }) {
  const { t } = useTranslation();

  const FIELDS = [
    { key: 'ent_score',       label: t('candidate.field_ent_label'),   type: 'number', min: 0,   max: 140,  step: 1,    required: true,  hint: t('candidate.field_ent_hint'),    placeholder: t('candidate.field_ent_placeholder') },
    { key: 'ielts_score',     label: t('candidate.field_ielts_label'), type: 'number', min: 0,   max: 9,    step: 0.5,  required: false, hint: t('candidate.field_ielts_hint'),  placeholder: t('candidate.field_ielts_placeholder') },
    { key: 'gpa',             label: t('candidate.field_gpa_label'),   type: 'number', min: 0,   max: 4,    step: 0.01, required: false, hint: t('candidate.field_gpa_hint'),    placeholder: t('candidate.field_gpa_placeholder') },
    { key: 'graduation_year', label: t('candidate.field_grad_label'),  type: 'number', min: 2020, max: 2027, step: 1,   required: true,  hint: t('candidate.field_grad_hint'),   placeholder: t('candidate.field_grad_placeholder') },
    { key: 'school_name',     label: t('candidate.field_school_label'), type: 'text',  minLength: 5, maxLength: 200,    required: true,  hint: t('candidate.field_school_hint'), placeholder: t('candidate.field_school_placeholder') },
  ];

  const [form, setForm] = useState({ ent_score: '', ielts_score: '', gpa: '', graduation_year: '', school_name: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const touch = (k) => {
    setTouched(th => ({ ...th, [k]: true }));
    const field = FIELDS.find(f => f.key === k);
    const err = validateField(field, form[k], t);
    setErrors(e => ({ ...e, [k]: err }));
  };

  const hasErrors = FIELDS.some(f => validateField(f, form[f.key], t) !== null);

  const save = async () => {
    const allTouched = {};
    const allErrors = {};
    FIELDS.forEach(f => {
      allTouched[f.key] = true;
      allErrors[f.key] = validateField(f, form[f.key], t);
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
      toast(t('candidate.docs_saved'), 'success');
      setTimeout(() => setSaved(false), 3000);
      if (onSaved) onSaved();
    } catch {
      toast(t('candidate.docs_save_error'), 'error');
    }
    setSaving(false);
  };

  return (
    <div className="card fade-in">
      <h3>{t('candidate.docs_form_title')}</h3>
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
          {saved
            ? <><IconCheck size={13} /> {t('candidate.docs_saved_btn')}</>
            : saving
              ? t('candidate.docs_saving')
              : <><IconUpload size={13} /> {t('candidate.docs_save_btn')}</>
          }
        </button>
      </div>
    </div>
  );
}

export default function CandidateStatus() {
  const { t } = useTranslation();
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
      toast(t('candidate.submitted_ok'), 'success');
    } catch (e) {
      toast(e.message || t('candidate.submit_error'), 'error');
    }
    setSubmitting(false);
  };

  const appId = detail?.id
    ? `#APP-${String(detail.id).slice(-8).toUpperCase()}`
    : '#APP-2026-0041';

  const status = detail?.status || 'review';
  const canSubmit = status === 'draft' && !submitted;

  const steps = mapApiStepsToUI(detail, t);

  const docs = [
    { name: t('candidate.doc_ent'),            ok: !!detail?.documents?.ent_score },
    { name: t('candidate.doc_unt'),            ok: !!detail?.documents?.ent_score },
    { name: t('candidate.doc_recommendation'), ok: false },
    { name: t('candidate.doc_video'),          ok: false },
    { name: t('candidate.doc_ielts'),          ok: !!detail?.documents?.ielts_score },
  ];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>{t('candidate.application_title')}</h1>
            <p>{t('candidate.app_id_label')} <span className="mono text-accent">{appId}</span></p>
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
                {t('candidate.alert_submitted')}
              </div>
            ) : (
              <div className="alert-box">
                <IconInfo size={14} />
                {t('candidate.alert_interview_open')}
              </div>
            )}

            <div className="flex flex-wrap gap-12">
              <div className="card" style={{ flex: '1 1 280px' }}>
                <h3>{t('candidate.personal_title')}</h3>
                <div className="info-grid">
                  {[
                    [t('candidate.field_name'),    detail?.full_name || user?.fullName || '—'],
                    [t('candidate.field_program'), detail?.program   || 'Foundation Year'],
                    [t('candidate.field_country'), detail?.country   || '—'],
                    [t('candidate.field_city'),    detail?.city      || '—'],
                    [t('candidate.field_school'),  detail?.documents?.school_name || '—'],
                    [t('candidate.field_ent'),     detail?.documents?.ent_score ? `${detail.documents.ent_score} / 140` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="info-row">
                      <span className="key">{k}</span>
                      <span className="val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ flex: '1 1 240px' }}>
                <h3>{t('candidate.docs_title')}</h3>
                {docs.map(d => (
                  <div key={d.name} className="flex items-center justify-between" style={{ marginBottom: 10, fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{d.name}</span>
                    <span style={{ color: d.ok ? 'var(--green)' : 'var(--amber)', display: 'flex' }}>
                      {d.ok ? <IconCheck size={15} /> : <IconWarn size={15} />}
                    </span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mt-8" onClick={() => setShowDocs(s => !s)}>
                  {showDocs ? t('candidate.hide_docs_form') : t('candidate.show_docs_form')}
                </button>
              </div>
            </div>

            {showDocs && (
              <DocumentsForm appId={user?.appId} onSaved={load} />
            )}

            <div className="card">
              <h3>{t('candidate.progress_title')}</h3>
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
                            {t('candidate.status_now')}
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
                    {submitting ? t('candidate.submitting') : t('candidate.submit_btn')}
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