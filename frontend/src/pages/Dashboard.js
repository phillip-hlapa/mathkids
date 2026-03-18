import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AVATARS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'];

const OPERATIONS = [
  { key: 'add',      label: 'Addition',      symbol: '+', emoji: '➕', gradient: 'linear-gradient(135deg,#10b981,#34d399)', bg: '#d1fae5', color: '#059669' },
  { key: 'subtract', label: 'Subtraction',   symbol: '−', emoji: '➖', gradient: 'linear-gradient(135deg,#f97316,#fb923c)', bg: '#ffedd5', color: '#c2410c' },
  { key: 'divide',   label: 'Division',      symbol: '÷', emoji: '➗', gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', bg: '#dbeafe', color: '#1d4ed8' },
];

const STAGE_NAMES = ['Baby Steps 🐣', 'Getting Good 🌱', 'Super Star ⭐', 'Champion 🏆', 'Math Wizard 🧙'];
const STAGE_DESCRIPTIONS = [
  'Numbers 1–5', 'Numbers 1–10', 'Numbers 1–20', 'Numbers 1–50', 'Numbers 1–100'
];

function Stars({ score }) {
  const s = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
  return (
    <span>
      {[1,2,3].map(i => <span key={i} style={{fontSize:'1rem'}}>{i <= s ? '⭐' : '☆'}</span>)}
    </span>
  );
}

export default function Dashboard() {
  const { user, api, updateUser } = useAuth();
  const [progress, setProgress] = useState([]);
  const [activeOp, setActiveOp] = useState('add');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/game/progress').then(({ data }) => {
      setProgress(data.progress || []);
      updateUser({ totalStars: data.totalStars });
    }).finally(() => setLoading(false));
  }, []);

  const getProgress = (op, stage) => progress.find(p => p.operation === op && p.stage === stage);

  const handleStageClick = (op, stage) => {
    const p = getProgress(op, stage);
    if (!p?.unlocked) return;
    navigate(`/play/${op}/${stage}`);
  };

  const op = OPERATIONS.find(o => o.key === activeOp);

  return (
    <>
      <div className="stars-bg" />
      <div className="container-lg py-4" style={{minHeight:'calc(100vh - 70px)'}}>

        {/* Welcome banner */}
        <div className="mk-card p-4 mb-4 slide-up-1 d-flex align-items-center gap-3 flex-wrap">
          <span className="float-anim" style={{fontSize:'3.5rem'}}>{AVATARS[user?.avatar % AVATARS.length]}</span>
          <div className="flex-grow-1">
            <h2 className="font-fredoka mb-0" style={{color:'var(--mk-purple)',fontSize:'1.8rem'}}>
              Hello, {user?.username}! 🎉
            </h2>
            <p className="text-muted mb-0 fw-600">Choose an operation and pick a stage to play!</p>
          </div>
          <div className="text-center">
            <div style={{fontSize:'2.5rem'}}>⭐</div>
            <div className="font-fredoka" style={{color:'#f59e0b',fontSize:'1.5rem'}}>{user?.totalStars || 0}</div>
            <div className="text-muted small">Total Stars</div>
          </div>
        </div>

        {/* Operation tabs */}
        <div className="d-flex gap-3 mb-4 flex-wrap slide-up-2">
          {OPERATIONS.map(o => (
            <button key={o.key} onClick={() => setActiveOp(o.key)}
              className="btn btn-mk flex-fill"
              style={{
                background: activeOp === o.key ? o.gradient : '#f3f4f6',
                color: activeOp === o.key ? 'white' : '#6b7280',
                transform: activeOp === o.key ? 'translateY(-3px)' : 'none',
                boxShadow: activeOp === o.key ? '0 8px 20px rgba(0,0,0,0.2)' : 'none',
                fontSize:'1rem', padding:'0.6rem 1rem'
              }}>
              {o.emoji} {o.label}
            </button>
          ))}
        </div>

        {/* Stages */}
        <div className="mk-card p-4 slide-up-3">
          <h3 className="font-fredoka mb-4" style={{color: op.color, fontSize:'1.6rem'}}>
            {op.emoji} {op.label} Stages
          </h3>
          {loading ? (
            <div className="text-center py-5"><div className="spin d-inline-block" style={{fontSize:'3rem'}}>⭐</div></div>
          ) : (
            <div className="row g-3">
              {[1,2,3,4,5].map((stage, idx) => {
                const prog = getProgress(activeOp, stage);
                const unlocked = prog?.unlocked;
                return (
                  <div key={stage} className="col-6 col-md-4 col-lg" style={{animationDelay:`${idx*0.1}s`}}>
                    <div
                      className={`stage-card text-center bounce-in ${unlocked ? '' : 'locked'}`}
                      style={{background: unlocked ? op.bg : '#f9fafb', borderColor: unlocked ? op.color : 'transparent', animationDelay:`${idx*0.1}s`}}
                      onClick={() => handleStageClick(activeOp, stage)}>

                      <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>
                        {unlocked ? (stage === 1 ? '🐣' : stage === 2 ? '🌱' : stage === 3 ? '⭐' : stage === 4 ? '🏆' : '🧙') : '🔒'}
                      </div>

                      <div className="font-fredoka" style={{color: unlocked ? op.color : '#9ca3af', fontSize:'1rem'}}>
                        Stage {stage}
                      </div>
                      <div className="fw-600 text-muted small mb-2">{STAGE_NAMES[stage-1]}</div>
                      <div className="text-muted" style={{fontSize:'0.75rem'}}>{STAGE_DESCRIPTIONS[stage-1]}</div>

                      {unlocked && prog?.completions > 0 && (
                        <div className="mt-2">
                          <Stars score={prog.highScore} />
                          <div className="text-muted" style={{fontSize:'0.7rem'}}>Best: {prog.highScore}%</div>
                        </div>
                      )}

                      {unlocked && prog?.completions === 0 && (
                        <div className="mt-2">
                          <span className="badge rounded-pill px-2" style={{background:op.gradient,color:'white',fontSize:'0.7rem'}}>
                            NEW!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="row g-3 mt-2">
          {[
            {icon:'🎯', text:'Answer 70% correct to unlock the next stage!'},
            {icon:'⏱️', text:'You have 15 seconds per question — be quick!'},
            {icon:'⭐', text:'Earn stars for every correct answer!'},
          ].map((tip, i) => (
            <div key={i} className={`col-md-4 slide-up-${i+2}`}>
              <div className="mk-card p-3 text-center h-100">
                <div style={{fontSize:'2rem'}}>{tip.icon}</div>
                <p className="mb-0 fw-600 text-muted small">{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
