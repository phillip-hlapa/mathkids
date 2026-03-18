import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AVATARS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user && !isAdmin) return null;

  return (
    <nav className="mk-navbar navbar navbar-expand-md px-3 py-2 sticky-top">
      <div className="container-lg">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <span style={{fontSize:'2rem'}} className="float-anim">🌟</span>
          <span className="font-fredoka" style={{fontSize:'1.6rem', color:'var(--mk-purple)'}}>MathKids</span>
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          {isAdmin ? (
            <span className="badge rounded-pill px-3 py-2" style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)',fontSize:'0.9rem'}}>
              <i className="bi bi-shield-check me-1" /> Admin
            </span>
          ) : user && (
            <>
              <div className="d-flex align-items-center gap-2">
                <span style={{fontSize:'1.6rem'}}>{AVATARS[user.avatar % AVATARS.length]}</span>
                <div>
                  <div className="fw-800 text-dark" style={{fontWeight:800,fontSize:'0.95rem'}}>{user.username}</div>
                  <div className="d-flex align-items-center gap-1">
                    <span>⭐</span>
                    <span className="fw-bold" style={{color:'#f59e0b',fontSize:'0.85rem'}}>{user.totalStars || 0} stars</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <button className="btn btn-mk btn-mk-pink btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" />Bye!
          </button>
        </div>
      </div>
    </nav>
  );
}
