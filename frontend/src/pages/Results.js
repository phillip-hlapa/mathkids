import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OP_INFO = {
  add:      { symbol: '+', label: 'Addition',    gradient: 'linear-gradient(135deg,#10b981,#34d399)', color: '#059669', emoji: '➕' },
  subtract: { symbol: '−', label: 'Subtraction', gradient: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#c2410c', emoji: '➖' },
  divide:   { symbol: '÷', label: 'Division',    gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', color: '#1d4ed8', emoji: '➗' },
};

function Stars({ score }) {
  const count = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
  return (
    <div className="d-flex justify-content-center gap-2 my-3">
      {[1, 2, 3].map(i => (
        <span key={i} className={`bounce-in`} style={{
          fontSize: '3rem',
          filter: i <= count ? 'none' : 'grayscale(1) opacity(0.3)',
          animationDelay: `${i * 0.15}s`,
        }}>⭐</span>
      ))}
    </div>
  );
}

function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: ['#7c3aed','#ec4899','#fbbf24','#10b981','#3b82f6','#f97316'][Math.floor(Math.random()*6)],
      speed: Math.random() * 4 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 2,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0
    }} />
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, correct = 0, total = 10, operation = 'add', stage = 1, stars = 0, nextUnlocked } = location.state || {};
  const opInfo = OP_INFO[operation] || OP_INFO.add;

  const getMessage = () => {
    if (score >= 90) return { text: 'INCREDIBLE! 🏆', sub: "You're a math superstar!", color: '#7c3aed' };
    if (score >= 70) return { text: 'GREAT JOB! 🎉',  sub: 'You unlocked the next stage!', color: '#10b981' };
    if (score >= 50) return { text: 'GOOD TRY! 💪',   sub: "Keep practicing, you're getting there!", color: '#f97316' };
    return { text: 'KEEP GOING! 🌱', sub: "Practice makes perfect! Try again!", color: '#3b82f6' };
  };

  const msg = getMessage();
  const showConfetti = score >= 70;

  return (
    <>
      <div className="stars-bg" />
      {showConfetti && <Confetti />}

      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-7 col-lg-5">
              <div className="mk-card p-4 p-md-5 text-center bounce-in">

                {/* Big emoji */}
                <div className="float-anim d-inline-block mb-2" style={{ fontSize: '5rem' }}>
                  {score >= 90 ? '🏆' : score >= 70 ? '🎉' : score >= 50 ? '💪' : '🌱'}
                </div>

                <h1 className="font-fredoka mb-1" style={{ color: msg.color, fontSize: '2rem' }}>{msg.text}</h1>
                <p className="text-muted fw-600 mb-3">{msg.sub}</p>

                {/* Stars */}
                <Stars score={score} />

                {/* Score circle */}
                <div className="mx-auto mb-4" style={{
                  width: 130, height: 130, borderRadius: '50%',
                  background: opInfo.gradient,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
                }}>
                  <div className="font-fredoka" style={{ color: 'white', fontSize: '2.8rem', lineHeight: 1 }}>{score}%</div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 700 }}>Score</div>
                </div>

                {/* Stats row */}
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div className="p-3 rounded-4" style={{ background: '#d1fae5' }}>
                      <div className="font-fredoka" style={{ color: '#059669', fontSize: '1.8rem' }}>{correct}</div>
                      <div className="text-muted small fw-700">Correct</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-4" style={{ background: '#fee2e2' }}>
                      <div className="font-fredoka" style={{ color: '#dc2626', fontSize: '1.8rem' }}>{total - correct}</div>
                      <div className="text-muted small fw-700">Wrong</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-3 rounded-4" style={{ background: '#fef3c7' }}>
                      <div className="font-fredoka" style={{ color: '#d97706', fontSize: '1.8rem' }}>+{stars}</div>
                      <div className="text-muted small fw-700">Stars</div>
                    </div>
                  </div>
                </div>

                {nextUnlocked && stage < 5 && (
                  <div className="alert rounded-4 border-0 mb-4 bounce-in" style={{ background: '#f0fdf4', color: '#15803d', fontWeight: 700 }}>
                    🔓 Stage {stage + 1} unlocked! Keep going!
                  </div>
                )}

                {/* Action buttons */}
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-mk btn-mk-purple" onClick={() => navigate(`/play/${operation}/${stage}`)}>
                    🔄 Play Again
                  </button>
                  {nextUnlocked && stage < 5 && (
                    <button className="btn btn-mk btn-mk-green" onClick={() => navigate(`/play/${operation}/${stage + 1}`)}>
                      ⏭️ Next Stage!
                    </button>
                  )}
                  <button className="btn btn-mk btn-mk-blue" onClick={() => navigate('/dashboard')}>
                    🏠 Back to Dashboard
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
