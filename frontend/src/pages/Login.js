import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Oops! Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="stars-bg" />
  ) && (
    <>
      <div className="stars-bg" />
      <div className="d-flex align-items-center justify-content-center" style={{minHeight:'calc(100vh - 70px)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-9 col-md-6 col-lg-5">
              <div className="mk-card p-4 p-md-5 slide-up">
                <div className="text-center mb-4">
                  <div className="float-anim d-inline-block mb-2" style={{fontSize:'4rem'}}>🚀</div>
                  <h1 className="font-fredoka" style={{color:'var(--mk-purple)',fontSize:'2.2rem'}}>Welcome Back!</h1>
                  <p className="text-muted fw-600">Ready to do some math? Let's go!</p>
                </div>

                {error && (
                  <div className="alert rounded-4 border-0 shake" style={{background:'#fee2e2',color:'#dc2626'}}>
                    <i className="bi bi-emoji-frown me-2" />{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="fw-bold mb-1" style={{color:'var(--mk-purple)'}}>👤 Your Name</label>
                    <input className="mk-input" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your username..." required autoFocus />
                  </div>
                  <div className="mb-4">
                    <label className="fw-bold mb-1" style={{color:'var(--mk-purple)'}}>🔒 Password</label>
                    <input type="password" className="mk-input" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password..." required />
                  </div>
                  <button type="submit" className="btn btn-mk btn-mk-purple w-100 mb-3" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Loading...</> : '🎮 Let\'s Play!'}
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-muted">New here? </span>
                  <Link to="/register" className="fw-bold text-decoration-none" style={{color:'var(--mk-pink)'}}>Join the fun! 🎉</Link>
                </div>
                <div className="text-center mt-2">
                  <Link to="/admin-login" className="text-muted small text-decoration-none">Admin login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
