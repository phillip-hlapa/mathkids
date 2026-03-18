import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminLogin(password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Wrong password!');
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="stars-bg" />
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-8 col-md-5 col-lg-4">
              <div className="mk-card p-4 p-md-5 slide-up">
                <div className="text-center mb-4">
                  <div className="float-anim d-inline-block mb-2" style={{ fontSize: '4rem' }}>🛡️</div>
                  <h1 className="font-fredoka" style={{ color: 'var(--mk-purple)', fontSize: '2rem' }}>Admin Area</h1>
                  <p className="text-muted fw-600">Enter the admin password to continue</p>
                </div>

                {error && (
                  <div className="alert rounded-4 border-0 shake" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <i className="bi bi-shield-x me-2" />{error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="fw-bold mb-1" style={{ color: 'var(--mk-purple)' }}>🔑 Admin Password</label>
                    <input
                      type="password"
                      className="mk-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter admin password..."
                      required autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-mk btn-mk-purple w-100" disabled={loading}>
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Checking...</>
                      : '🛡️ Enter Admin Panel'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <Link to="/login" className="text-muted small text-decoration-none">← Back to child login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
