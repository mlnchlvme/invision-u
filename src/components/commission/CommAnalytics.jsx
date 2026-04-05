import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import BarChart from '../shared/BarChart';
import { displayScore } from '../../utils/score';
import { IconTrendUp } from '../icons';

export default function CommAnalytics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="content fade-in">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  const byStatus = stats?.by_status
    ? Object.entries(stats.by_status).map(([l, v]) => ({ l, v }))
    : [];

  const byZone = stats?.by_zone
    ? Object.entries(stats.by_zone).map(([l, v]) => ({ l, v }))
    : [];

  const avgScoreDisplay = stats?.avg_final_score != null
    ? displayScore(stats.avg_final_score)
    : '—';

  const kpis = [
    { label: 'Всего заявок',    val: stats?.total_applications != null ? String(stats.total_applications) : '—' },
    { label: 'Средний AI Score', val: avgScoreDisplay },
    { label: 'AI-флагов',       val: stats?.ai_flagged        != null ? String(stats.ai_flagged) : '—' },
  ];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-8">
          <IconTrendUp size={18} />
          <div>
            <h1>Аналитика</h1>
            <p>Статистика приёмной кампании 2026</p>
          </div>
        </div>
      </div>

      <div className="content fade-in">
        <div className="stat-grid">
          {kpis.map((k, i) => (
            <div key={i} className="stat-card">
              <div className="val">{k.val}</div>
              <div className="lbl">{k.label}</div>
            </div>
          ))}
        </div>

        {(byStatus.length > 0 || byZone.length > 0) ? (
          <div className="flex flex-wrap gap-12">
            {byStatus.length > 0 && (
              <div className="card" style={{ flex: '1 1 280px' }}>
                <h3>По статусам</h3>
                <BarChart data={byStatus} />
              </div>
            )}
            {byZone.length > 0 && (
              <div className="card" style={{ flex: '1 1 280px' }}>
                <h3>По зонам (AI Score)</h3>
                <BarChart data={byZone} />
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <p className="text-muted text-sm">Статистика загружается или недоступна</p>
          </div>
        )}

        {byZone.length > 0 && (
          <div className="card">
            <h3>Распределение по зонам</h3>
            {byZone.map((z, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="flex justify-between text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>
                  <span>{z.l}</span>
                  <span className="mono text-muted">{z.v}</span>
                </div>
                <div className="progress-bar">
                  <div className="fill" style={{ width: `${(z.v / (stats?.total_applications || 1)) * 100}%`, background: z.color || 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}