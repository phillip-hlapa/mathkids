import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AVATARS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'];

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Oops! Try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="stars-bg" />
      <div className="d-flex align-items-center justify-content-center" style={{minHeight:'calc(100vh - 70px)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-7 col-lg-5">
              <div className="mk-card p-4 p-md-5 slide-up">
                <div className="text-center mb-4">
                  <div className="float-anim d-inline-block mb-2" style={{fontSize:'4rem'}}>✨</div>
                  <h1 className="font-fredoka" style={{color:'var(--mk-purple)',fontSize:'2.2rem'}}>Join MathKids!</h1>
                  <p className="text-muted fw-600">Choose your avatar and get started!</p>
                </div>

                {error && (
                  <div className="alert rounded-4 border-0 shake" style={{background:'#fee2e2',color:'#dc2626'}}>
                    <i className="bi bi-emoji-frown me-2" />{error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="fw-bold mb-2 d-block" style={{color:'var(--mk-purple)'}}>🎭 Pick your avatar!</label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVATARS.map((a, i) => (
                      <button key={i} type="button" onClick={() => setAvatar(i)}
                        className="btn p-0 border-0"
                        style={{fontSize:'2rem', opacity: avatar === i ? 1 : 0.4, transform: avatar === i ? 'scale(1.3)' : 'scale(1)', transition:'all 0.2s'}}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="fw-bold mb-1" style={{color:'var(--mk-purple)'}}>👤 Your Name</label>
                    <input className="mk-input" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Pick a cool username..." required minLength={2} maxLength={20} />
                  </div>
                  <div className="mb-4">
                    <label className="fw-bold mb-1" style={{color:'var(--mk-purple)'}}>🔒 Password</label>
                    <input type="password" className="mk-input" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="At least 4 characters..." required minLength={4} />
                  </div>
                  <button type="submit" className="btn btn-mk btn-mk-green w-100 mb-3" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : '🎊 Create My Account!'}
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-muted">Already playing? </span>
                  <Link to="/login" className="fw-bold text-decoration-none" style={{color:'var(--mk-pink)'}}>Login here! 🚀</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
