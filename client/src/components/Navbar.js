import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

      <style jsx>{`
        .navbar {
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }

        .navbar-brand a {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
          color: #007bff;
        }

        .navbar-brand i {
          font-size: 24px;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .navbar-nav {
          display: flex;
          gap: 5px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          text-decoration: none;
          color: #666;
          border-radius: 5px;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .nav-link:hover {
          background-color: #f8f9fa;
          color: #007bff;
        }

        .nav-link.active {
          background-color: #007bff;
          color: white;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .user-role {
          font-size: 12px;
          color: #666;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 8px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background-color: #f8f9fa;
          color: #dc3545;
        }

        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
        }

        @media (max-width: 768px) {
          .navbar-toggle {
            display: block;
          }

          .navbar-menu {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            align-items: stretch;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .navbar-nav {
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }

          .nav-link {
            padding: 12px 15px;
            border-radius: 8px;
          }

          .navbar-user {
            justify-content: space-between;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
          }

          .user-info {
            align-items: flex-start;
            text-align: left;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;