import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import BarChart from '../shared/BarChart';
import StatusBadge from '../shared/StatusBadge';
import { displayScore, scoreColor, scoreZone } from '../../utils/score';
import { IconTrendUp, IconChevronDown, IconChevronUp } from '../icons';

function CandidateMiniCard({ candidate: c }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--r)',
        background: 'var(--panel)',
        marginBottom: 6,
        fontSize: 12,
      }}
    >
      <div>
        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{c.full_name}</span>
        <span className="text-muted" style={{ marginLeft: 8, fontWeight: 600 }}>{c.city}</span>
      </div>
      <div className="flex items-center gap-8">
        <span className="mono" style={{ fontWeight: 800, fontSize: 11, color: scoreColor(c.final_score) }}>
          {displayScore(c.final_score)}
        </span>
        <StatusBadge status={c.status} />
      </div>
    </div>
  );
}

function ZoneRow({ zone, count, total, isSelected, onClick, candidates, loadingCandidates }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const ZONE_COLORS = { A: 'var(--accent)', B: 'var(--text)', C: 'var(--muted)' };
  const zoneKey = zone.replace('Zone ', '').replace('Зона ', '');
  const color = ZONE_COLORS[zoneKey] || 'var(--accent)';

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        className="zone-row clickable"
        onClick={onClick}
        style={{
          cursor: 'pointer',
          padding: '8px 10px',
          borderRadius: 'var(--r)',
          background: isSelected ? 'rgba(192,241,28,.07)' : 'transparent',
          border: isSelected ? '1.5px solid var(--accent)' : '1.5px solid transparent',
          transition: 'all .15s',
          marginBottom: 6,
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--panel)'; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex justify-between text-sm" style={{ fontWeight: 600, marginBottom: 5 }}>
          <div className="flex items-center gap-8">
            <span
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: color, color: '#000',
                fontWeight: 900, fontSize: 11,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {zoneKey}
            </span>
            <span>{zone}</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="mono text-muted">{count}</span>
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{pct}%</span>
            {isSelected ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
          </div>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>

      {isSelected && (
        <div className="fade-in" style={{ paddingLeft: 4 }}>
          {loadingCandidates ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 6 }} />)
          ) : candidates.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: '8px 12px' }}>
              Кандидаты не найдены
            </p>
          ) : (
            <>
              {candidates.slice(0, 10).map(c => (
                <CandidateMiniCard key={c.id} candidate={c} />
              ))}
              {candidates.length > 10 && (
                <p className="text-muted text-sm" style={{ padding: '4px 12px', fontWeight: 600 }}>
                  + ещё {candidates.length - 10} кандидатов
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


export default function CommAnalytics() {
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [selectedZone, setSelectedZone]     = useState(null);
  const [zoneCandidates, setZoneCandidates] = useState([]);
  const [loadingZone, setLoadingZone]       = useState(false);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleZoneClick = async (zoneKey) => {
    if (selectedZone === zoneKey) {
      setSelectedZone(null);
      setZoneCandidates([]);
      return;
    }
    setSelectedZone(zoneKey);
    setZoneCandidates([]);
    setLoadingZone(true);
    try {
      const data = await adminApi.candidates({ zone: zoneKey, per_page: 50 });
      setZoneCandidates(
        Array.isArray(data) ? data : (data.applications || []),
      );
    } catch {} 
    finally {
      setLoadingZone(false);
    }
  };

  if (loading) {
    return (
      <div className="content fade-in">
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />)}
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
    { label: 'Всего заявок',     val: stats?.total_applications != null ? String(stats.total_applications) : '—' },
    { label: 'Средний AI Score', val: avgScoreDisplay },
    { label: 'AI-флагов',        val: stats?.ai_flagged != null ? String(stats.ai_flagged) : '—' },
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
            <h3 style={{ marginBottom: 4 }}>Распределение по зонам</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
              Нажмите на зону, чтобы увидеть список кандидатов
            </p>
            {byZone.map((z, i) => {
              const zKey = z.l.replace('Zone ', '').replace('Зона ', '').trim();
              return (
                <ZoneRow
                  key={i}
                  zone={z.l}
                  count={z.v}
                  total={stats?.total_applications || 1}
                  isSelected={selectedZone === zKey}
                  onClick={() => handleZoneClick(zKey)}
                  candidates={selectedZone === zKey ? zoneCandidates : []}
                  loadingCandidates={selectedZone === zKey && loadingZone}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}