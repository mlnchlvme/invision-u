import { useState, useEffect } from 'react';
import StatusBadge from '../shared/StatusBadge';
import RadarChart  from '../shared/RadarChart';
import BarChart    from '../shared/BarChart';
import { adminApi } from '../../api/admin';
import { applicationsApi } from '../../api/applications';
import { displayScore, scoreColor } from '../../utils/score';
import { IconFilter, IconDownload, IconChevronDown, IconChevronUp } from '../icons';
import { toast } from '../shared/Toast';

export default function CommDashboard() {
  const [expanded, setExpanded] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [decision, setDecision] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    adminApi.dashboard()
      .then(setDashboard)
      .catch(() => {});
  }, []);

  const makeDecision = async (appId, decisionVal, agreedWithAi) => {
    setSaving(s => ({ ...s, [appId]: true }));
    try {
      await applicationsApi.makeDecision(appId, {
        decision: decisionVal,
        agreed_with_ai: agreedWithAi,
        notes: '',
      });
      setDecision(d => ({ ...d, [appId]: decisionVal }));
      toast(decisionVal === 'shortlist' ? 'Кандидат одобрен' : 'Кандидат отклонён', decisionVal === 'shortlist' ? 'success' : 'error');
    } catch (e) {
      toast(e.message || 'Ошибка', 'error');
    }
    setSaving(s => ({ ...s, [appId]: false }));
  };

  const candidates = dashboard?.applications || [];

  const stats = dashboard
    ? [
        { val: String(dashboard.total),           lbl: 'Всего заявок',    delta: `Zone A: ${dashboard.zone_a}`, color: 'var(--text)' },
        { val: String(dashboard.pending_review),  lbl: 'На рассмотрении', delta: 'avg 2.4 дня',                color: 'var(--amber)' },
        { val: String(dashboard.zone_a),          lbl: 'Зона A',          delta: 'Топ кандидаты',              color: 'var(--green)' },
        { val: String(dashboard.zone_c),          lbl: 'Зона C',          delta: 'Требуют внимания',           color: 'var(--red)' },
      ]
    : [
        { val: '—', lbl: 'Всего заявок',    delta: 'загрузка...', color: 'var(--text)' },
        { val: '—', lbl: 'На рассмотрении', delta: 'загрузка...', color: 'var(--amber)' },
        { val: '—', lbl: 'Зона A',          delta: 'загрузка...', color: 'var(--green)' },
        { val: '—', lbl: 'Зона C',          delta: 'загрузка...', color: 'var(--red)' },
      ];

  const byProgram = dashboard?.by_program
    ? Object.entries(dashboard.by_program).map(([l, v]) => ({ l, v }))
    : [];

  const funnel = dashboard
    ? [
        { lbl: 'Подали заявку',     v: dashboard.total,           max: dashboard.total },
        { lbl: 'AI-этап пройден',   v: dashboard.ai_completed ?? 0, max: dashboard.total },
        { lbl: 'Ревью комиссии',    v: dashboard.pending_review ?? 0, max: dashboard.total },
        { lbl: 'Финальное решение', v: (dashboard.zone_a ?? 0) + (dashboard.zone_c ?? 0), max: dashboard.total },
      ]
    : [];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div>
            <h1>Дашборд комиссии</h1>
            <p>Приёмная кампания · Foundation Year 2026</p>
          </div>
          <StatusBadge status="review" />
        </div>
      </div>

      <div className="content fade-in">
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="val" style={{ color: s.color }}>{s.val}</div>
              <div className="lbl">{s.lbl}</div>
              <div className="delta">{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-12">
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3>Заявки по направлениям</h3>
            {byProgram.length > 0 ? (
              <BarChart data={byProgram} />
            ) : (
              <p className="text-muted text-sm">Данные загружаются...</p>
            )}
          </div>

          <div className="card" style={{ flex: '1 1 220px' }}>
            <h3>Воронка отбора</h3>
            {funnel.length > 0 ? funnel.map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div className="flex justify-between text-sm" style={{ fontWeight: 600 }}>
                  <span>{f.lbl}</span>
                  <span className="mono text-muted">{f.v}</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: f.max ? `${(f.v / f.max) * 100}%` : '0%' }} />
                </div>
              </div>
            )) : (
              <p className="text-muted text-sm">Данные загружаются...</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
            <h3 style={{ marginBottom: 0 }}>Последние заявки</h3>
            <div className="flex gap-8">
              <button className="btn btn-ghost btn-sm" onClick={() => adminApi.export().catch(() => toast('Ошибка экспорта', 'error'))}>
                <IconDownload size={12} />
                Экспорт
              </button>
            </div>
          </div>

          {candidates.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: '12px 0' }}>
              {dashboard === null ? 'Загрузка данных...' : 'Нет кандидатов для отображения'}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Кандидат</th>
                    <th>Направление</th>
                    <th>AI Score</th>
                    <th>Город</th>
                    <th>Статус</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <>
                      <tr
                        key={c.id}
                        className="candidate-row"
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      >
                        <td><div className="name">{c.full_name}</div></td>
                        <td>{c.program}</td>
                        <td>
                          <span className="mono" style={{ fontWeight: 800, color: scoreColor(c.final_score) }}>
                            {displayScore(c.final_score)}
                          </span>
                        </td>
                        <td><span className="text-muted text-sm">{c.city}</span></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <span style={{ color: 'var(--muted)', display: 'flex', justifyContent: 'center' }}>
                            {expanded === c.id ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                          </span>
                        </td>
                      </tr>

                      {expanded === c.id && (
                        <tr key={`${c.id}-detail`} className="candidate-detail">
                          <td colSpan={6}>
                            <div className="cd-inner">
                              <div>
                                {c.drive_scores ? (
                                  <>
                                    <p className="section-title">AI-профиль компетенций</p>
                                    <RadarChart data={c.drive_scores} />
                                  </>
                                ) : (
                                  <p className="text-muted text-sm">D.R.I.V.E. оценки недоступны</p>
                                )}
                              </div>
                              <div>
                                {c.drive_scores ? (
                                  <>
                                    <p className="section-title">Оценки по D.R.I.V.E.</p>
                                    {[
                                      ['Disciplined Resilience',   c.drive_scores?.D],
                                      ['Responsible Innovation',   c.drive_scores?.R],
                                      ['Insightful Vision',        c.drive_scores?.I],
                                      ['Values-Driven Leadership', c.drive_scores?.V],
                                      ['Entrepreneurial Execution',c.drive_scores?.E],
                                    ].map(([k, v]) => (
                                      <div key={k} style={{ marginBottom: 9 }}>
                                        <div className="flex justify-between text-sm" style={{ fontWeight: 600 }}>
                                          <span>{k}</span>
                                          <span className="mono">{v != null ? `${v}/10` : '—'}</span>
                                        </div>
                                        <div className="progress-bar">
                                          <div className="fill" style={{ width: v != null ? `${v * 10}%` : '0%' }} />
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                ) : null}
                                <div className="btn-row">
                                  <button
                                    className="btn btn-primary btn-sm"
                                    disabled={!!saving[c.id] || decision[c.id] === 'shortlist'}
                                    onClick={() => makeDecision(c.id, 'shortlist', true)}
                                  >
                                    {decision[c.id] === 'shortlist' ? 'Одобрено' : 'Одобрить'}
                                  </button>
                                  <button
                                    className="btn btn-red btn-sm"
                                    disabled={!!saving[c.id] || decision[c.id] === 'reject'}
                                    onClick={() => makeDecision(c.id, 'reject', false)}
                                  >
                                    {decision[c.id] === 'reject' ? 'Отказано' : 'Отказать'}
                                  </button>
                                  <button className="btn btn-ghost btn-sm">Запросить инфо</button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}