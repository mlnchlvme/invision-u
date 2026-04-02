import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { IconWarn, IconCheck, IconZap } from '../icons';
import { toast } from '../shared/Toast';

export default function CommSettings() {
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
      toast('Настройки сохранены', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'error');
    }
    setSaving(false);
  };

  return (
    <>
      <div className="page-header">
        <h1>Настройки системы</h1>
        <p>Параметры оценки, пороговые значения и правила отбора</p>
      </div>

      <div className="content fade-in">
        {saved && (
          <div className="alert-box" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCheck size={14} />
            Настройки успешно сохранены
          </div>
        )}

        {draft && (
          <div className="alert-box warn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWarn size={14} />
            Черновик изменений ожидает подтверждения вторым администратором (принцип 4 глаз)
          </div>
        )}

        <div className="card">
          <h3>Пороговые баллы для допуска</h3>
          {[
            { label: 'Zone A порог (AI Score)',     key: 'zone_a_threshold',      hint: 'из 100' },
            { label: 'Zone B порог (AI Score)',     key: 'zone_b_threshold',      hint: 'из 100' },
            { label: 'AI детектор порог',           key: 'ai_detector_threshold', hint: '0–1' },
            { label: 'Consistency порог',           key: 'consistency_threshold', hint: '0–1' },
          ].map(({ label, key, hint }) => (
            <div key={key} className="flex items-center justify-between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{hint}</div>
              </div>
              <input
                type="number"
                value={thresholds[key]}
                onChange={e => setThresholds(t => ({ ...t, [key]: Number(e.target.value) }))}
                style={{ width: 88, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '7px 12px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none', transition: '.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={saveDraft}>Сохранить черновик</button>
            {draft && (
              <button className="btn btn-dark" onClick={confirm} disabled={saving}>
                {saving ? 'Сохранение...' : <><IconCheck size={14} /> Подтвердить (2-й адм.)</>}
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Веса критериев D.R.I.V.E.</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            Сумма всех весов должна равняться 100%
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
          <h3>AI-модель и параметры</h3>
          {[
            { label: 'Модель оценки',      val: 'inVisionU-Eval v2.1' },
            { label: 'Язык интервью',       val: 'RU / KZ / EN' },
            { label: 'Макс. длина ответа', val: '500 слов' },
            { label: 'NLP вес',            val: `${thresholds.nlp_weight}` },
            { label: 'Struct вес',          val: `${thresholds.struct_weight}` },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center" style={{ marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Тестовые данные</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            Заполнить систему демо-кандидатами для тестирования интерфейса
          </p>
          <SeedButton />
        </div>
      </div>
    </>
  );
}

function SeedButton() {
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
      setErr(e.message || 'Ошибка');
    }
    setSeeding(false);
  };

  return (
    <div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 10 }}>{err}</div>}
      <button className="btn btn-ghost" onClick={run} disabled={seeding}>
        <IconZap size={14} />
        {seeded ? 'Данные загружены' : seeding ? 'Загрузка...' : 'Заполнить тестовыми данными'}
      </button>
    </div>
  );
}
