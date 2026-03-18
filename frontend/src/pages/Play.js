import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STAGE_CONFIG = [
  { max: 5,   questions: 8 },
  { max: 10,  questions: 10 },
  { max: 20,  questions: 10 },
  { max: 50,  questions: 12 },
  { max: 100, questions: 12 },
];

const OP_INFO = {
  add:      { symbol: '+', label: 'Addition',    gradient: 'linear-gradient(135deg,#10b981,#34d399)', color: '#059669' },
  subtract: { symbol: '−', label: 'Subtraction', gradient: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#c2410c' },
  divide:   { symbol: '÷', label: 'Division',    gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', color: '#1d4ed8' },
};

const TIME_LIMIT = 15;

function generateQuestion(operation, max) {
  let a, b, correct;
  if (operation === 'add') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    correct = a + b;
  } else if (operation === 'subtract') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * (a)) + 1;
    correct = a - b;
  } else {
    // divide: ensure clean division
    b = Math.floor(Math.random() * Math.min(max, 10)) + 1;
    correct = Math.floor(Math.random() * Math.min(max, 10)) + 1;
    a = b * correct;
  }
  // Generate 3 wrong answers
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = correct + (Math.floor(Math.random() * 7) - 3);
    if (w !== correct && w >= 0) wrongs.add(w);
  }
  const options = [...wrongs, correct].sort(() => Math.random() - 0.5);
  return { a, b, correct, options };
}

function FlyingEmoji({ emoji, x, y, id }) {
  return (
    <div className="emoji-fly" style={{ left: x, top: y, position:'fixed', zIndex:9999 }}>{emoji}</div>
  );
}

export default function Play() {
  const { operation, stage } = useParams();
  const navigate = useNavigate();
  const { api, updateUser } = useAuth();
  const stageNum = parseInt(stage);
  const cfg = STAGE_CONFIG[stageNum - 1];
  const opInfo = OP_INFO[operation];

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameOver, setGameOver] = useState(false);
  const [flying, setFlying] = useState([]);
  const [shake, setShake] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef(null);

  // Generate all questions at start
  useEffect(() => {
    const qs = Array.from({ length: cfg.questions }, () =>
      generateQuestion(operation, cfg.max)
    );
    setQuestions(qs);
  }, []);

  // Timer
  useEffect(() => {
    if (answered || gameOver || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, answered, gameOver, questions.length]);

  const spawnEmoji = (isCorrect, e) => {
    if (!e) return;
    const rect = e.target?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top : window.innerHeight / 2;
    const emoji = isCorrect ? ['🎉','⭐','✨','🌟','💫'][Math.floor(Math.random()*5)] : '❌';
    const id = Date.now();
    setFlying(prev => [...prev, { emoji, x, y, id }]);
    setTimeout(() => setFlying(prev => prev.filter(f => f.id !== id)), 1500);
  };

  const handleAnswer = useCallback((answer, timeout = false, e = null) => {
    if (answered) return;
    clearInterval(timerRef.current);
    const q = questions[current];
    if (!q) return;
    const isCorrect = !timeout && answer === q.correct;

    setSelected(answer);
    setAnswered(true);
    if (isCorrect) {
      setCorrect(c => c + 1);
      spawnEmoji(true, e);
    } else {
      setShake(true);
      spawnEmoji(false, e);
      setTimeout(() => setShake(false), 600);
    }

    setTimeout(() => {
      if (current + 1 >= cfg.questions) {
        setGameOver(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(TIME_LIMIT);
      }
    }, 1200);
  }, [answered, questions, current, cfg.questions]);

  // Save & navigate when game over
  useEffect(() => {
    if (!gameOver || questions.length === 0) return;
    const score = Math.round((correct / cfg.questions) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    api.post('/game/session', { stage: stageNum, operation, totalQuestions: cfg.questions, correctAnswers: correct, score, timeSpent })
      .then(({ data }) => {
        updateUser({ totalStars: data.totalStars });
        navigate('/results', { state: { score, correct, total: cfg.questions, operation, stage: stageNum, stars: data.stars, nextUnlocked: score >= 70 } });
      })
      .catch(() => {
        navigate('/results', { state: { score, correct, total: cfg.questions, operation, stage: stageNum, stars: 0 } });
      });
  }, [gameOver]);

  if (questions.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center"><div className="spin d-inline-block" style={{fontSize:'4rem'}}>⭐</div><div className="font-fredoka mt-3" style={{fontSize:'1.5rem',color:'var(--mk-purple)'}}>Getting ready...</div></div>
    </div>
  );

  const q = questions[current];
  const progress = ((current) / cfg.questions) * 100;
  const timeProgress = (timeLeft / TIME_LIMIT) * 100;
  const circumference = 2 * Math.PI * 28;
  const timeColor = timeLeft > 8 ? '#10b981' : timeLeft > 4 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <div className="stars-bg" />
      {flying.map(f => <FlyingEmoji key={f.id} {...f} />)}

      <div className="container" style={{maxWidth:600,minHeight:'calc(100vh - 70px)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'1rem'}}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button className="btn btn-light rounded-pill px-3" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-arrow-left" /> Back
          </button>
          <div className="font-fredoka" style={{color:'white',fontSize:'1.1rem'}}>
            {opInfo.label} · Stage {stageNum}
          </div>
          <div className="d-flex align-items-center gap-1">
            {Array.from({length: cfg.questions}).map((_, i) => (
              <div key={i} style={{
                width:10, height:10, borderRadius:'50%',
                background: i < current ? (i < correct + (cfg.questions - questions.length + current - correct) ? '#10b981' : '#ef4444') : i === current ? 'white' : 'rgba(255,255,255,0.3)',
                transition:'all 0.3s'
              }} />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mk-progress mb-3">
          <div className="mk-progress-bar" style={{width:`${progress}%`}} />
        </div>

        {/* Main card */}
        <div className={`mk-card p-4 text-center ${shake ? 'shake' : ''}`} style={{transition:'all 0.3s'}}>

          {/* Timer + score row */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <span style={{fontSize:'1.5rem'}}>✅</span>
              <span className="font-fredoka" style={{color:'#10b981',fontSize:'1.5rem'}}>{correct}</span>
              <span className="text-muted">/ {cfg.questions}</span>
            </div>

            {/* Circular timer */}
            <svg width={72} height={72} viewBox="0 0 72 72">
              <circle className="timer-ring-track" cx={36} cy={36} r={28} />
              <circle className="timer-ring-fill timer-ring"
                cx={36} cy={36} r={28}
                stroke={timeColor}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (timeProgress / 100) * circumference}
              />
              <text x={36} y={42} textAnchor="middle" fontFamily="Fredoka One" fontSize={20} fill={timeColor}>{timeLeft}</text>
            </svg>

            <div className="text-muted small fw-600">Q {current+1} of {cfg.questions}</div>
          </div>

          {/* Question */}
          <div className="mb-5">
            <div className="question-display bounce-in">
              {q.a} <span className="question-symbol">{opInfo.symbol}</span> {q.b} <span className="question-symbol">=</span> ?
            </div>
          </div>

          {/* Answer options */}
          <div className="row g-3">
            {q.options.map((opt, i) => {
              let cls = 'idle';
              if (answered) {
                if (opt === q.correct) cls = 'correct';
                else if (opt === selected) cls = 'wrong';
              }
              return (
                <div key={i} className="col-6">
                  <button
                    className={`answer-btn ${cls}`}
                    disabled={answered}
                    onClick={(e) => handleAnswer(opt, false, e)}>
                    {opt}
                  </button>
                </div>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-4 bounce-in fw-800 fs-5`} style={{color: selected === q.correct ? '#10b981' : '#ef4444'}}>
              {selected === q.correct ? '🎉 Correct! Amazing!' : selected === null ? `⏱️ Time's up! It was ${q.correct}` : `❌ The answer was ${q.correct}`}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
