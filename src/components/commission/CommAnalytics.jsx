import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import BarChart from '../shared/BarChart';
import { IconTrendUp } from '../icons';

export default function CommAnalytics() {
  const [stats, setStats]   = useState(null);
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
    : [
        { l: 'draft',    v: 12 },
        { l: 'review',   v: 38 },
        { l: 'approved', v: 67 },
        { l: 'rejected', v: 21 },
      ];

  const byZone = stats?.by_zone
    ? Object.entries(stats.by_zone).map(([l, v]) => ({ l, v }))
    : [
        { l: 'Zone A', v: 44, color: 'var(--green)' },
        { l: 'Zone B', v: 58 },
        { l: 'Zone C', v: 28, color: 'var(--red)' },
      ];

  const kpis = [
    { label: 'Всего заявок',       val: stats?.total_applications ?? 142 },
    { label: 'Средний AI Score',    val: stats?.avg_final_score   != null ? stats.avg_final_score.toFixed(1) : '76.4' },
    { label: 'AI-флагов',           val: stats?.ai_flagged        ?? 14 },
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

        <div className="flex flex-wrap gap-12">
          <div className="card" style={{ flex: '1 1 280px' }}>
            <h3>По статусам</h3>
            <BarChart data={byStatus} />
          </div>
          <div className="card" style={{ flex: '1 1 280px' }}>
            <h3>По зонам (AI Score)</h3>
            <BarChart data={byZone} />
          </div>
        </div>

        <div className="card">
          <h3>Распределение по зонам</h3>
          {byZone.map((z, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div className="flex justify-between text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>
                <span>{z.l}</span>
                <span className="mono text-muted">{z.v}</span>
              </div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${(z.v / (stats?.total_applications || 130)) * 100}%`, background: z.color || 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
