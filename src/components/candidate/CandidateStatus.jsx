import { useState, useEffect } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { STEPS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/applications';
import { IconInfo, IconCheck, IconWarn, IconUpload } from '../icons';
import { toast } from '../shared/Toast';

function DocumentsForm({ appId, onSaved }) {
  const [form, setForm] = useState({ ent_score: '', ielts_score: '', gpa: '', graduation_year: '', school_name: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (form.ent_score)      payload.ent_score      = Number(form.ent_score);
      if (form.ielts_score)    payload.ielts_score    = Number(form.ielts_score);
      if (form.gpa)            payload.gpa            = Number(form.gpa);
      if (form.graduation_year) payload.graduation_year = Number(form.graduation_year);
      if (form.school_name)    payload.school_name    = form.school_name;
      await applicationsApi.updateDocs(appId, payload);
      setSaved(true);
      toast('Данные сохранены', 'success');
      setTimeout(() => setSaved(false), 3000);
      if (onSaved) onSaved();
    } catch {}
    setSaving(false);
  };

  const fields = [
    { key: 'ent_score',       label: 'ЕНТ балл',        placeholder: 'макс. 140', type: 'number' },
    { key: 'ielts_score',     label: 'IELTS',            placeholder: 'необязательно', type: 'number' },
    { key: 'gpa',             label: 'GPA',              placeholder: 'напр. 4.8',  type: 'number' },
    { key: 'graduation_year', label: 'Год окончания',    placeholder: '2025', type: 'number' },
    { key: 'school_name',     label: 'Название школы',   placeholder: 'Средняя школа №...', type: 'text' },
  ];

  return (
    <div className="card fade-in">
      <h3>Академические данные</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 5 }}>
              {f.label}
            </div>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '9px 12px', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none', transition: '.15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
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
                {STEPS.map(s => (
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
