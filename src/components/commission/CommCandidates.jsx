import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../shared/StatusBadge';
import RadarChart  from '../shared/RadarChart';
import { adminApi } from '../../api/admin';
import { applicationsApi } from '../../api/applications';
import { displayScore, scoreColor, scoreZone } from '../../utils/score';
import {
  IconFilter, IconDownload, IconChevronDown, IconChevronUp, IconSearch,
} from '../icons';
import { toast } from '../shared/Toast';

const ZONES    = ['', 'A', 'B', 'C'];
const STATUSES = ['', 'draft', 'review', 'approved', 'rejected'];
const PROGRAMS = ['', 'Foundation Year', 'Pre-University', 'Bachelor', 'Master'];
const PER_PAGE = 20;


function ScoreBar({ label, value, max = 10 }) {
  const pct = value != null ? Math.min((value / max) * 100, 100) : 0;
  const LABELS = {
    leadership:           'Лидерство',
    motivation:           'Мотивация',
    perseverance:         'Настойчивость',
    teamwork:             'Командная работа',
    goal_pursuit:         'Целеустремлённость',
    intrinsic_motivation: 'Внутр. мотивация',
    prosocial_purpose:    'Соц. ответственность',
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex justify-between text-sm" style={{ fontWeight: 600, marginBottom: 3 }}>
        <span>{LABELS[label] || label}</span>
        <span className="mono" style={{ color: 'var(--muted)' }}>
          {value != null ? `${value.toFixed(1)}/10` : '—'}
        </span>
      </div>
      <div className="progress-bar">
        <div className="fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AiDetector({ data }) {
  if (!data) return null;
  const isHighRisk = data.ai_prob != null && data.ai_prob > 0.7;
  return (
    <div className="card ai-detector" style={{ marginBottom: 0 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>
        AI-детектор текста
      </h4>
      {[
        ['Perplexity',    data.perplexity  != null ? data.perplexity.toFixed(1)  : '—'],
        ['Burstiness',    data.burstiness  != null ? data.burstiness.toFixed(2)  : '—'],
        ['AI Probability', data.ai_prob    != null ? `${(data.ai_prob * 100).toFixed(0)}%` : '—'],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm" style={{ marginBottom: 6 }}>
          <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
          <span
            className="mono"
            style={{
              fontWeight: 700,
              color: k === 'AI Probability' && isHighRisk ? 'var(--red)' : 'var(--text)',
            }}
          >
            {v}
          </span>
        </div>
      ))}
      {isHighRisk && (
        <div style={{
          marginTop: 8, padding: '6px 10px', borderRadius: 'var(--r)',
          background: 'rgba(234,84,85,.10)', color: 'var(--red)',
          fontSize: 11, fontWeight: 700,
        }}>
          ⚠ Высокий риск AI-генерации текста
        </div>
      )}
    </div>
  );
}

function EssayBlock({ answers }) {
  const [open, setOpen] = useState(null);
  if (!answers?.length) return null;
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>
        Письменные ответы ({answers.length})
      </h4>
      {answers.map((ans, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              all: 'unset', cursor: 'pointer', width: '100%',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px',
              background: 'var(--panel)', borderRadius: 'var(--r)',
              fontSize: 12, fontWeight: 700, color: 'var(--text)',
            }}
          >
            <span>Эссе {i + 1}{ans.question_id ? ` · ${ans.question_id}` : ''}</span>
            {open === i ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
          </button>
          {open === i && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--surface)', borderRadius: '0 0 var(--r) var(--r)',
              fontSize: 12, lineHeight: 1.65, color: 'var(--muted)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {ans.text || '(нет текста)'}
              {ans.transcript && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)', fontSize: 11 }}>
                    Транскрипт
                  </summary>
                  <p style={{ marginTop: 6 }}>{ans.transcript}</p>
                </details>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VideoBlock({ videoUrl, transcript }) {
  if (!videoUrl) return null;
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>
        Видео-представление
      </h4>
      <video
        src={videoUrl}
        controls
        style={{ width: '100%', borderRadius: 'var(--r)', background: '#000', maxHeight: 280 }}
      />
      {transcript && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
            Транскрипт (Whisper)
          </summary>
          <p style={{
            marginTop: 8, fontSize: 12, lineHeight: 1.65, color: 'var(--muted)',
            whiteSpace: 'pre-wrap',
          }}>
            {transcript}
          </p>
        </details>
      )}
    </div>
  );
}

function InterviewBlock({ transcript }) {
  if (!transcript) return null;
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>
        Диалог AI-интервью
      </h4>
      <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 12, lineHeight: 1.65, color: 'var(--muted)' }}>
        {Array.isArray(transcript)
          ? transcript.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: msg.role === 'ai' ? 'var(--accent)' : 'var(--text)' }}>
                {msg.role === 'ai' ? 'AI: ' : 'Кандидат: '}
              </span>
              {msg.text}
            </div>
          ))
          : <p style={{ whiteSpace: 'pre-wrap' }}>{transcript}</p>
        }
      </div>
    </div>
  );
}


function CandidateDetail({ c, onDecision, saving, decisionState }) {
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!c?.id) return;
    setLoadingDetail(true);
    adminApi.candidate(c.id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [c?.id]);

  const d = detail || c;

  const scores7 = (() => {
    if (!detail) return null;
    if (detail.scores && Array.isArray(detail.scores) && detail.scores.length > 0) {
      const last = detail.scores[detail.scores.length - 1];
      return last?.scores || null;
    }
    return detail.scores_7 || null;
  })();

  const aiDetection = detail?.ai_detection || (() => {
    if (!detail?.answers?.length) return null;
    const ans = detail.answers.find(a => a.ai_detection);
    return ans?.ai_detection || null;
  })();

  return (
    <div className="cd-inner" style={{ flexDirection: 'column', gap: 16 }}>
      {loadingDetail && (
        <div style={{ padding: '12px 0' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 32, marginBottom: 8 }} />)}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: d.zone_explanation ? 10 : 0 }}>
            <span
              style={{
                fontSize: 20, fontWeight: 900, fontFamily: 'var(--font)',
                color: scoreColor(d.final_score), letterSpacing: '-0.03em',
              }}
            >
              Зона {scoreZone(d.final_score)}
            </span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 900, color: scoreColor(d.final_score) }}>
              {displayScore(d.final_score)}
            </span>
          </div>
          {d.zone_explanation && (
            <p style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--muted)', margin: 0 }}>
              {d.zone_explanation}
            </p>
          )}

          <div style={{ marginTop: 12 }}>
            {[
              ['Имя',       d.full_name],
              ['Программа', d.program],
              ['Город',     d.city],
              ['Школа',     d.school_name || detail?.documents?.school_name],
              ['ЕНТ',       detail?.documents?.ent_score],
              ['GPA',       detail?.documents?.gpa],
              ['IELTS',     detail?.documents?.ielts_score],
            ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm" style={{ marginBottom: 5 }}>
                <span className="text-muted" style={{ fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {scores7 ? (
          <div className="card" style={{ marginBottom: 0 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 10 }}>
              Качества лидерства
            </h4>
            {Object.keys(scores7).length >= 3 && (
              <RadarChart data={scores7} />
            )}
            <div style={{ marginTop: 8 }}>
              {Object.entries(scores7).map(([key, val]) => (
                <ScoreBar key={key} label={key} value={val} />
              ))}
            </div>
          </div>
        ) : (
          !loadingDetail && (
            <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-muted text-sm">D.R.I.V.E. оценки недоступны</p>
            </div>
          )
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {aiDetection && <AiDetector data={aiDetection} />}
        <VideoBlock videoUrl={d.video_url} transcript={detail?.transcript} />
      </div>

      <InterviewBlock transcript={detail?.interview_transcript} />

      <EssayBlock answers={detail?.answers} />

      <div className="btn-row">
        <button
          className="btn btn-primary btn-sm"
          disabled={!!saving || decisionState === 'shortlist'}
          onClick={() => onDecision(c.id, 'shortlist', true)}
        >
          {saving ? '...' : decisionState === 'shortlist' ? 'Одобрено' : 'Одобрить'}
        </button>
        <button
          className="btn btn-red btn-sm"
          disabled={!!saving || decisionState === 'reject'}
          onClick={() => onDecision(c.id, 'reject', false)}
        >
          {saving ? '...' : decisionState === 'reject' ? 'Отказано' : 'Отказать'}
        </button>
        <button className="btn btn-ghost btn-sm">Запросить инфо</button>
      </div>
    </div>
  );
}


export default function CommCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [decision, setDecision]     = useState({});
  const [saving, setSaving]         = useState({});

  const [search, setSearch]         = useState('');
  const [zone, setZone]             = useState('');
  const [status, setStatus]         = useState('');
  const [program, setProgram]       = useState('');
  const [page, setPage]             = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const filters = { page, per_page: PER_PAGE };
    if (search)  filters.search  = search;
    if (zone)    filters.zone    = zone;
    if (status)  filters.status  = status;
    if (program) filters.program = program;

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
  }, [search, zone, status, program, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, zone, status, program]);

  const makeDecision = async (appId, decisionVal, agreedWithAi) => {
    setSaving(s => ({ ...s, [appId]: true }));
    try {
      await applicationsApi.makeDecision(appId, {
        decision: decisionVal,
        agreed_with_ai: agreedWithAi,
        notes: '',
      });
      setDecision(d => ({ ...d, [appId]: decisionVal }));
      toast(
        decisionVal === 'shortlist' ? 'Кандидат одобрен' : 'Кандидат отклонён',
        decisionVal === 'shortlist' ? 'success' : 'error',
      );
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
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => adminApi.export().catch(() => toast('Ошибка экспорта', 'error'))}
          >
            <IconDownload size={12} />
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="content fade-in">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="flex gap-8 flex-wrap items-center">
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <IconSearch
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Поиск по имени или городу..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 32,
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)', padding: '8px 12px 8px 32px',
                  fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600,
                  color: 'var(--text)', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(f => !f)}>
              <IconFilter size={12} />
              Фильтры{(zone || status || program) ? ' ●' : ''}
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-8 flex-wrap" style={{ marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Зона</div>
                <div className="flex gap-6">
                  {ZONES.map(z => (
                    <button key={z || 'all'} className={`btn btn-sm ${zone === z ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setZone(z)}>
                      {z || 'Все'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Статус</div>
                <div className="flex gap-6 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s || 'all'} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus(s)}>
                      {s || 'Все'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Программа</div>
                <div className="flex gap-6 flex-wrap">
                  {PROGRAMS.map(pr => (
                    <button key={pr || 'all'} className={`btn btn-sm ${program === pr ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setProgram(pr)}>
                      {pr || 'Все'}
                    </button>
                  ))}
                </div>
              </div>
              {(zone || status || program) && (
                <div style={{ alignSelf: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setZone(''); setStatus(''); setProgram(''); }}>
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
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8 }} />)}
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
                            <CandidateDetail
                              c={c}
                              onDecision={makeDecision}
                              saving={saving[c.id]}
                              decisionState={decision[c.id]}
                            />
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
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Назад
                </button>
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
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