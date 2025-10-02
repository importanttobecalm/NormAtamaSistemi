import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('teacher');
  const [formData, setFormData] = useState({
    // Teacher fields
    tcId: '',
    birthDate: '',
    // Admin fields
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = user?.userType === 'admin' ? '/admin' : '/teacher';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({
      tcId: '',
      birthDate: '',
      username: '',
      password: ''
    });
    setError('');
  };

  const validateTeacherForm = () => {
    if (!formData.tcId || formData.tcId.length !== 11) {
      setError('TC kimlik numarası 11 haneli olmalıdır');
      return false;
    }

    if (!/^\d+$/.test(formData.tcId)) {
      setError('TC kimlik numarası sadece rakam içermelidir');
      return false;
    }

    if (!formData.birthDate || !/^\d{2}\.\d{2}\.\d{4}$/.test(formData.birthDate)) {
      setError('Doğum tarihi GG.AA.YYYY formatında olmalıdır');
      return false;
    }

    return true;
  };

  const validateAdminForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let isValid = false;
      let credentials = {};

      if (activeTab === 'teacher') {
        isValid = validateTeacherForm();
        credentials = {
          tcId: formData.tcId,
          birthDate: formData.birthDate
        };
      } else {
        isValid = validateAdminForm();
        credentials = {
          username: formData.username,
          password: formData.password
        };
      }

      if (!isValid) {
        setLoading(false);
        return;
      }

      const result = await login(credentials, activeTab);

      if (result.success) {
        const redirectPath = result.user.userType === 'admin' ? '/admin' : '/teacher';
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatBirthDate = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format as DD.MM.YYYY
    if (digits.length >= 2) {
      if (digits.length >= 4) {
        return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
      } else {
        return `${digits.slice(0, 2)}.${digits.slice(2)}`;
      }
    }
    return digits;
  };

  const handleBirthDateChange = (e) => {
    const formattedValue = formatBirthDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      birthDate: formattedValue
    }));
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Norm Atama Sistemi</h1>
          <p className="login-subtitle">Hesabınıza giriş yapın</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => handleTabChange('teacher')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            Öğretmen
          </button>
          <button
            className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
          >
            <i className="fas fa-user-cog"></i>
            Yönetici
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {activeTab === 'teacher' ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-id-card"></i>
                  TC Kimlik Numarası
                </label>
                <input
                  type="text"
                  name="tcId"
                  value={formData.tcId}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="11 haneli TC kimlik numaranız"
                  maxLength="11"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-calendar"></i>
                  Doğum Tarihi
                </label>
                <input
                  type="text"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleBirthDateChange}
                  className="form-control"
                  placeholder="GG.AA.YYYY"
                  maxLength="10"
                  required
                />
                <small className="text-muted">
                  Örnek: 15.03.1985
                </small>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user"></i>
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Kullanıcı adınız"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock"></i>
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Şifreniz"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Giriş Yap
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
          <p>
            <i className="fas fa-info-circle"></i>
            {activeTab === 'teacher'
              ? 'Öğretmenler TC kimlik numarası ve doğum tarihi ile giriş yapar'
              : 'Yöneticiler kullanıcı adı ve şifre ile giriş yapar'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;