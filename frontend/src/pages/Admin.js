import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AVATARS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'];
const OP_COLORS = { add: '#10b981', subtract: '#f97316', divide: '#3b82f6' };
const OP_LABELS = { add: 'Addition', subtract: 'Subtraction', divide: 'Division' };

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="col-6 col-md-3">
      <div className="mk-card p-4 text-center h-100 bounce-in">
        <div style={{ fontSize: '2.5rem' }}>{icon}</div>
        <div className="font-fredoka mt-1" style={{
          fontSize: '2rem',
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>{value}</div>
        <div className="text-muted fw-600 small">{label}</div>
      </div>
    </div>
  );
}

function Stars({ score }) {
  const count = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
  return <span>{[1,2,3].map(i => <span key={i} style={{ opacity: i <= count ? 1 : 0.25 }}>⭐</span>)}</span>;
}

function ProgressBar({ value, color }) {
  return (
    <div className="mk-progress" style={{ height: 10 }}>
      <div className="mk-progress-bar" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function ChildModal({ child, onClose }) {
  if (!child) return null;

  const sessions = [...(child.sessions || [])].reverse();
  const ops = ['add', 'subtract', 'divide'];

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-content" style={{ borderRadius: 24, border: 'none' }}>
          <div className="modal-header border-0 pb-0">
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '2.5rem' }}>{AVATARS[child.avatar % AVATARS.length]}</span>
              <div>
                <h4 className="font-fredoka mb-0" style={{ color: 'var(--mk-purple)' }}>{child.username}</h4>
                <small className="text-muted">Joined {new Date(child.createdAt).toLocaleDateString()}</small>
              </div>
              <span className="ms-3 badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: 'white' }}>
                ⭐ {child.totalStars} stars
              </span>
            </div>
            <button className="btn-close ms-auto" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            {/* Progress by operation */}
            {ops.map(op => {
              const stages = (child.progress || []).filter(p => p.operation === op).sort((a, b) => a.stage - b.stage);
              return (
                <div key={op} className="mb-4">
                  <h6 className="fw-800 mb-3" style={{ color: OP_COLORS[op] }}>
                    {op === 'add' ? '➕' : op === 'subtract' ? '➖' : '➗'} {OP_LABELS[op]}
                  </h6>
                  <div className="row g-2">
                    {stages.map(s => (
                      <div key={s.stage} className="col">
                        <div className="text-center p-2 rounded-3" style={{
                          background: s.unlocked ? `${OP_COLORS[op]}18` : '#f9fafb',
                          border: `2px solid ${s.unlocked ? OP_COLORS[op] : '#e5e7eb'}`
                        }}>
                          <div style={{ fontSize: '1.2rem' }}>{s.unlocked ? (s.completions > 0 ? '✅' : '🔓') : '🔒'}</div>
                          <div className="fw-700 small">S{s.stage}</div>
                          {s.completions > 0 && (
                            <>
                              <Stars score={s.highScore} />
                              <div className="text-muted" style={{ fontSize: '0.65rem' }}>{s.highScore}%</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Recent sessions */}
            <h6 className="fw-800 mb-3 mt-4" style={{ color: 'var(--mk-purple)' }}>📋 Recent Sessions</h6>
            {sessions.length === 0 ? (
              <p className="text-muted text-center py-3">No sessions yet — the child hasn't played!</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover rounded-4 overflow-hidden">
                  <thead style={{ background: 'var(--mk-purple)', color: 'white' }}>
                    <tr>
                      <th className="py-2 ps-3">Date</th>
                      <th>Operation</th>
                      <th>Stage</th>
                      <th>Score</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 20).map((s, i) => (
                      <tr key={i}>
                        <td className="ps-3 align-middle small text-muted">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="align-middle">
                          <span className="badge rounded-pill px-2" style={{ background: `${OP_COLORS[s.operation]}22`, color: OP_COLORS[s.operation], fontWeight: 700 }}>
                            {s.operation}
                          </span>
                        </td>
                        <td className="align-middle fw-700">Stage {s.stage}</td>
                        <td className="align-middle fw-800" style={{ color: s.score >= 70 ? '#10b981' : '#ef4444' }}>{s.score}%</td>
                        <td className="align-middle">{s.correctAnswers}/{s.totalQuestions} ✅</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { api } = useAuth();
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/children'),
      api.get('/admin/stats'),
    ]).then(([c, s]) => {
      setChildren(c.data);
      setStats(s.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = children.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const getChildAvgScore = (child) => {
    const sessions = child.sessions || [];
    if (!sessions.length) return null;
    return Math.round(sessions.reduce((a, s) => a + s.score, 0) / sessions.length);
  };

  const getStagesUnlocked = (child) => {
    return (child.progress || []).filter(p => p.unlocked && p.completions > 0).length;
  };

  return (
    <>
      <div style={{ background: '#f8f7ff', minHeight: '100vh' }}>
        <div className="container-lg py-4">

          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4 slide-up-1">
            <span style={{ fontSize: '3rem' }}>🛡️</span>
            <div>
              <h2 className="font-fredoka mb-0" style={{ color: 'var(--mk-purple)', fontSize: '2rem' }}>Admin Dashboard</h2>
              <p className="text-muted mb-0 fw-600">Monitor every child's progress and results</p>
            </div>
          </div>

          {/* Stats cards */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spin d-inline-block" style={{ fontSize: '3rem' }}>⭐</div>
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4 slide-up-2">
                <StatCard icon="👦" label="Total Children" value={stats?.totalChildren ?? 0} gradient="linear-gradient(135deg,#7c3aed,#a855f7)" />
                <StatCard icon="🎮" label="Total Sessions" value={stats?.totalSessions ?? 0} gradient="linear-gradient(135deg,#3b82f6,#60a5fa)" />
                <StatCard icon="⭐" label="Stars Earned" value={stats?.totalStars ?? 0} gradient="linear-gradient(135deg,#f59e0b,#fbbf24)" />
                <StatCard icon="📊" label="Avg Score" value={`${stats?.avgScore ?? 0}%`} gradient="linear-gradient(135deg,#10b981,#34d399)" />
              </div>

              {/* Search */}
              <div className="mb-3 slide-up-3">
                <input
                  className="mk-input"
                  style={{ maxWidth: 360, borderRadius: 50 }}
                  placeholder="🔍 Search by username..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Children list */}
              <div className="row g-3">
                {filtered.length === 0 && (
                  <div className="col-12 text-center py-5">
                    <div style={{ fontSize: '3rem' }}>🔍</div>
                    <p className="text-muted fw-600">No children found</p>
                  </div>
                )}
                {filtered.map((child, idx) => {
                  const avg = getChildAvgScore(child);
                  const stagesCompleted = getStagesUnlocked(child);
                  const sessions = child.sessions?.length || 0;
                  return (
                    <div key={child._id} className={`col-md-6 col-lg-4 slide-up-${Math.min(idx + 1, 4)}`}>
                      <div className="admin-card mk-card p-4 h-100" style={{ cursor: 'pointer' }} onClick={() => setSelected(child)}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="avatar-circle" style={{ background: 'linear-gradient(135deg,#f3f4f6,#e5e7eb)', fontSize: '2rem' }}>
                            {AVATARS[child.avatar % AVATARS.length]}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-800" style={{ fontSize: '1.05rem', color: '#1f2937' }}>{child.username}</div>
                            <div className="text-muted small">
                              {sessions} session{sessions !== 1 ? 's' : ''} · Joined {new Date(child.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div style={{ fontSize: '1.3rem' }}>⭐</div>
                            <div className="fw-800 small" style={{ color: '#f59e0b' }}>{child.totalStars}</div>
                          </div>
                        </div>

                        {/* Operation progress bars */}
                        <div className="mb-3">
                          {['add', 'subtract', 'divide'].map(op => {
                            const opSessions = (child.sessions || []).filter(s => s.operation === op);
                            const opAvg = opSessions.length
                              ? Math.round(opSessions.reduce((a, s) => a + s.score, 0) / opSessions.length)
                              : 0;
                            const stagesUnlocked = (child.progress || []).filter(p => p.operation === op && p.unlocked).length;
                            return (
                              <div key={op} className="mb-2">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="small fw-700" style={{ color: OP_COLORS[op] }}>
                                    {op === 'add' ? '➕' : op === 'subtract' ? '➖' : '➗'} {OP_LABELS[op]}
                                  </span>
                                  <span className="small text-muted">{stagesUnlocked}/5 stages · {opAvg}% avg</span>
                                </div>
                                <ProgressBar value={(stagesUnlocked / 5) * 100} color={OP_COLORS[op]} />
                              </div>
                            );
                          })}
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {avg !== null ? (
                              <span className="badge rounded-pill px-3 py-2" style={{
                                background: avg >= 70 ? '#d1fae5' : avg >= 50 ? '#ffedd5' : '#fee2e2',
                                color: avg >= 70 ? '#059669' : avg >= 50 ? '#c2410c' : '#dc2626',
                                fontWeight: 800
                              }}>
                                Overall: {avg}%
                              </span>
                            ) : (
                              <span className="badge rounded-pill px-3 py-2" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                                No sessions yet
                              </span>
                            )}
                          </div>
                          <button className="btn btn-sm rounded-pill px-3 fw-700" style={{ background: 'var(--mk-purple)', color: 'white' }}>
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selected && <ChildModal child={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
