import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user?.userType === 'admin' ? '/admin' : '/teacher'}>
            <i className="fas fa-graduation-cap"></i>
            Norm Atama Sistemi
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {user?.userType === 'admin' && (
            <div className="navbar-nav">
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-tachometer-alt"></i>
                Panel
              </Link>
              <Link
                to="/admin/teachers"
                className={`nav-link ${isActive('/admin/teachers') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-users"></i>
                Öğretmenler
              </Link>
              <Link
                to="/admin/positions"
                className={`nav-link ${isActive('/admin/positions') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-map-marker-alt"></i>
                Pozisyonlar
              </Link>
              <Link
                to="/admin/periods"
                className={`nav-link ${isActive('/admin/periods') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-calendar-alt"></i>
                Tercih Dönemleri
              </Link>
            </div>
          )}

          {user?.userType === 'teacher' && (
            <div className="navbar-nav">
              <Link
                to="/teacher"
                className={`nav-link ${isActive('/teacher') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-tachometer-alt"></i>
                Panel
              </Link>
              <Link
                to="/teacher/info"
                className={`nav-link ${isActive('/teacher/info') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-user"></i>
                Bilgilerim
              </Link>
              <Link
                to="/teacher/preferences"
                className={`nav-link ${isActive('/teacher/preferences') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-list-ol"></i>
                Tercihlerim
              </Link>
            </div>
          )}

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">
                {user?.userType === 'admin'
                  ? user.username
                  : `${user.firstName} ${user.lastName}`
                }
              </span>
              <span className="user-role">
                {user?.userType === 'admin' ? 'Yönetici' : 'Öğretmen'}
              </span>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Çıkış Yap"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;