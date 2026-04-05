import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin';
import { IconWarn, IconCheck, IconZap } from '../icons';
import { toast } from '../shared/Toast';

export default function CommSettings() {
  const { t } = useTranslation();
  const [draft, setDraft]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const [thresholds, setThresholds] = useState({
    zone_a_threshold:      80,
    zone_b_threshold:      60,
    ai_detector_threshold: 0.7,
    consistency_threshold: 0.6,
    nlp_weight:            0.5,
    struct_weight:         0.5,
  });

  const saveDraft = () => setDraft(true);

  const confirm = async () => {
    setSaving(true);
    try {
      await adminApi.settings(thresholds);
      setSaved(true);
      setDraft(false);
      toast(t('settings.toast_saved'), 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast(e.message || t('settings.toast_error'), 'error');
    }
    setSaving(false);
  };

  const thresholdFields = [
    { label: t('settings.threshold_zone_a'), key: 'zone_a_threshold',      hint: t('settings.hint_100') },
    { label: t('settings.threshold_zone_b'), key: 'zone_b_threshold',      hint: t('settings.hint_100') },
    { label: t('settings.threshold_ai'),     key: 'ai_detector_threshold', hint: t('settings.hint_01') },
    { label: t('settings.threshold_consistency'), key: 'consistency_threshold', hint: t('settings.hint_01') },
  ];

  const modelInfo = [
    { label: t('settings.model_name'),    val: 'inVisionU-Eval v2.1' },
    { label: t('settings.interview_lang'), val: 'RU / KZ / EN' },
    { label: t('settings.max_answer'),    val: '500 words' },
    { label: t('settings.nlp_weight'),    val: `${thresholds.nlp_weight}` },
    { label: t('settings.struct_weight'), val: `${thresholds.struct_weight}` },
  ];

  return (
    <>
      <div className="page-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <div className="content fade-in">
        {saved && (
          <div className="alert-box" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCheck size={14} />
            {t('settings.saved_alert')}
          </div>
        )}

        {draft && (
          <div className="alert-box warn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWarn size={14} />
            {t('settings.draft_alert')}
          </div>
        )}

        <div className="card">
          <h3>{t('settings.thresholds_title')}</h3>
          {thresholdFields.map(({ label, key, hint }) => (
            <div key={key} className="flex items-center justify-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{hint}</div>
              </div>
              <input
                type="number"
                value={thresholds[key]}
                onChange={e => setThresholds(th => ({ ...th, [key]: Number(e.target.value) }))}
                style={{ width: 88, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '7px 12px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none', transition: '.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={saveDraft}>{t('settings.save_draft')}</button>
            {draft && (
              <button className="btn btn-dark" onClick={confirm} disabled={saving}>
                {saving ? t('settings.saving') : <><IconCheck size={14} /> {t('settings.confirm')}</>}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h3>{t('settings.drive_title')}</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            {t('settings.drive_hint')}
          </p>
          {[
            { key: 'D', name: 'Disciplined Resilience',      w: 20 },
            { key: 'R', name: 'Responsible Innovation',       w: 25 },
            { key: 'I', name: 'Insightful Vision',            w: 20 },
            { key: 'V', name: 'Values-Driven Leadership',     w: 20 },
            { key: 'E', name: 'Entrepreneurial Execution',    w: 15 },
          ].map(item => (
            <div key={item.key} style={{ marginBottom: 10 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <div className="flex items-center gap-8">
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', fontWeight: 900, fontSize: 11 }}>
                    {item.key}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{item.w}%</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${item.w}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>{t('settings.model_title')}</h3>
          {modelInfo.map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center" style={{ marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>{t('settings.seed_title')}</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            {t('settings.seed_hint')}
          </p>
          <SeedButton />
        </div>
      </div>
    </>
  );
}

function SeedButton() {
  const { t } = useTranslation();
  const [seeding, setSeeding] = useState(false);
  const [seeded,  setSeeded]  = useState(false);
  const [err,     setErr]     = useState('');

  const run = async () => {
    setSeeding(true);
    setErr('');
    try {
      await adminApi.seed();
      setSeeded(true);
      setTimeout(() => setSeeded(false), 4000);
    } catch (e) {
      setErr(e.message || t('common.error_generic'));
    }
    setSeeding(false);
  };

  return (
    <div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 10 }}>{err}</div>}
      <button className="btn btn-ghost" onClick={run} disabled={seeding}>
        <IconZap size={14} />
        {seeded ? t('settings.seed_done') : seeding ? t('settings.seed_loading') : t('settings.seed_btn')}
      </button>
    </div>
  );
}