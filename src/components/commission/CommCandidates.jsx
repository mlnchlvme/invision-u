import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../shared/StatusBadge';
import RadarChart  from '../shared/RadarChart';
import { adminApi } from '../../api/admin';
import { applicationsApi } from '../../api/applications';
import { displayScore, scoreColor, scoreZone } from '../../utils/score';
import { IconFilter, IconDownload, IconChevronDown, IconChevronUp, IconSearch } from '../icons';
import { toast } from '../shared/Toast';

const ZONES   = ['', 'A', 'B', 'C'];
const STATUSES = ['', 'draft', 'review', 'approved', 'rejected'];
const PER_PAGE = 20;

export default function CommCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [decision, setDecision]     = useState({});
  const [saving, setSaving]         = useState({});

  const [search, setSearch]   = useState('');
  const [zone, setZone]       = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const filters = { page, per_page: PER_PAGE };
    if (search) filters.search = search;
    if (zone)   filters.zone   = zone;
    if (status) filters.status = status;

    adminApi.candidates(filters)
      .then(data => {
        if (Array.isArray(data)) {
          setCandidates(data);
          setTotal(data.length);
        } else {
          setCandidates(data.applications || []);
          setTotal(data.total || 0);
        }
      })
      .catch(() => toast('Ошибка загрузки кандидатов', 'error'))
      .finally(() => setLoading(false));
  }, [search, zone, status, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [search, zone, status]);

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
      load();
    } catch (e) {
      toast(e.message || 'Ошибка', 'error');
    }
    setSaving(s => ({ ...s, [appId]: false }));
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div>
            <h1>Кандидаты</h1>
            <p>Все заявки · Foundation Year 2026{total > 0 ? ` · ${total} всего` : ''}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => adminApi.export().catch(() => toast('Ошибка экспорта', 'error'))}>
            <IconDownload size={12} />
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="content fade-in">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="flex gap-8 flex-wrap items-center">
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Поиск по имени или городу..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: '8px 12px 8px 32px',
                  fontFamily: 'var(--font)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(f => !f)}>
              <IconFilter size={12} />
              Фильтры{(zone || status) ? ' ●' : ''}
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-8 flex-wrap" style={{ marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Зона</div>
                <div className="flex gap-6">
                  {ZONES.map(z => (
                    <button
                      key={z || 'all'}
                      className={`btn btn-sm ${zone === z ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setZone(z)}
                    >
                      {z || 'Все'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Статус</div>
                <div className="flex gap-6 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s || 'all'}
                      className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setStatus(s)}
                    >
                      {s || 'Все'}
                    </button>
                  ))}
                </div>
              </div>
              {(zone || status) && (
                <div style={{ alignSelf: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setZone(''); setStatus(''); }}>
                    Сбросить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: '24px 0' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8 }} />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-muted text-sm" style={{ padding: '12px 0' }}>Кандидаты не найдены</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Кандидат</th>
                    <th>Направление</th>
                    <th>AI Score</th>
                    <th>Зона</th>
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
                        <td>
                          <span className="mono" style={{ fontWeight: 700, fontSize: 11, color: scoreColor(c.final_score) }}>
                            {scoreZone(c.final_score)}
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
                          <td colSpan={7}>
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
                                {c.drive_scores && (
                                  <>
                                    <p className="section-title">Оценки по D.R.I.V.E.</p>
                                    {[
                                      ['Disciplined Resilience',    c.drive_scores?.D],
                                      ['Responsible Innovation',    c.drive_scores?.R],
                                      ['Insightful Vision',         c.drive_scores?.I],
                                      ['Values-Driven Leadership',  c.drive_scores?.V],
                                      ['Entrepreneurial Execution', c.drive_scores?.E],
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
                                )}
                                <div style={{ marginTop: c.drive_scores ? 12 : 0 }}>
                                  {[
                                    ['Имя',       c.full_name],
                                    ['Программа', c.program],
                                    ['Город',     c.city],
                                    ['AI Score',  displayScore(c.final_score)],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-sm" style={{ marginBottom: 6 }}>
                                      <span className="text-muted" style={{ fontWeight: 600 }}>{k}</span>
                                      <span style={{ fontWeight: 700 }}>{v || '—'}</span>
                                    </div>
                                  ))}
                                </div>
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

          {totalPages > 1 && (
            <div className="flex justify-between items-center" style={{ marginTop: 16, fontSize: 13 }}>
              <span className="text-muted" style={{ fontWeight: 600 }}>
                Стр. {page} из {totalPages} · {total} кандидатов
              </span>
              <div className="flex gap-6">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Назад
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Вперёд →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}