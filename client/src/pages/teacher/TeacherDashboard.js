import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [periodStatus, setPeriodStatus] = useState(null);
  const [preferenceCount, setPreferenceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (periodStatus?.isActive && periodStatus?.timeRemaining) {
      const interval = setInterval(() => {
        const now = Date.now();
        const endTime = new Date(periodStatus.period.end_date).getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setPeriodStatus(prev => ({ ...prev, isActive: false, canEdit: false }));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [periodStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [periodResponse, preferencesResponse] = await Promise.all([
        axios.get('/teacher/preferences/period-status'),
        axios.get('/teacher/preferences/my-preferences')
      ]);

      setPeriodStatus(periodResponse.data);
      setPreferenceCount(preferencesResponse.data.preferences?.length || 0);

      if (periodResponse.data.isActive) {
        const endTime = new Date(periodResponse.data.period.end_date).getTime();
        const now = Date.now();
        setTimeRemaining(Math.max(0, endTime - now));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '00:00:00:00';

    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="text-center" style={{ padding: '50px' }}>
          <div className="loading"></div>
          <p style={{ marginTop: '10px' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <i className="fas fa-tachometer-alt"></i>
          Öğretmen Paneli
        </h1>
        <p className="dashboard-subtitle">
          Hoş geldiniz, {user?.firstName} {user?.lastName}! Tercih durumunuzu buradan takip edebilirsiniz.
        </p>
      </div>

      {periodStatus?.isActive && timeRemaining > 0 && (
        <div className="countdown-timer">
          <div className="countdown-title">
            <i className="fas fa-clock"></i>
            Tercih süresi bitimine kalan süre
          </div>
          <div className="countdown-time">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.9' }}>
            Gün : Saat : Dakika : Saniye
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{user?.placementPoints || 0}</div>
          <div className="stat-label">
            <i className="fas fa-star"></i>
            Yerleştirme Puanım
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{preferenceCount}/25</div>
          <div className="stat-label">
            <i className="fas fa-list-ol"></i>
            Tercih Sayım
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{user?.branch || '-'}</div>
          <div className="stat-label">
            <i className="fas fa-graduation-cap"></i>
            Branşım
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">
            {periodStatus?.hasActivePeriod ? (
              periodStatus.isActive ? (
                <span style={{ color: '#28a745' }}>AKTİF</span>
              ) : (
                <span style={{ color: '#dc3545' }}>BİTTİ</span>
              )
            ) : (
              <span style={{ color: '#6c757d' }}>YOK</span>
            )}
          </div>
          <div className="stat-label">
            <i className="fas fa-calendar-check"></i>
            Tercih Dönemi
          </div>
        </div>
      </div>

      {periodStatus?.hasActivePeriod && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-calendar-alt"></i>
              Tercih Dönemi Bilgileri
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Başlangıç Tarihi</h4>
              <p style={{ margin: '0', color: '#666' }}>
                {formatDate(periodStatus.period.start_date)}
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Bitiş Tarihi</h4>
              <p style={{ margin: '0', color: '#666' }}>
                {formatDate(periodStatus.period.end_date)}
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Durum</h4>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: periodStatus.isActive ? '#28a745' : '#dc3545'
                }}
              >
                {periodStatus.isActive ? 'Aktif' : 'Sona Erdi'}
              </span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Tercih Durumu</h4>
              <p style={{ margin: '0', color: preferenceCount > 0 ? '#28a745' : '#dc3545' }}>
                {preferenceCount > 0 ? `${preferenceCount} tercih yapıldı` : 'Henüz tercih yapılmadı'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-bolt"></i>
            Hızlı İşlemler
          </h2>
        </div>

        <div className="quick-actions">
          <Link to="/teacher/info" className="quick-action-btn">
            <i className="fas fa-user"></i>
            Bilgilerimi Görüntüle
          </Link>

          <Link
            to="/teacher/preferences"
            className={`quick-action-btn ${!periodStatus?.canEdit ? 'disabled' : ''}`}
            style={{
              opacity: periodStatus?.canEdit ? 1 : 0.6,
              pointerEvents: periodStatus?.canEdit ? 'auto' : 'none'
            }}
          >
            <i className="fas fa-edit"></i>
            Tercih Yap / Düzenle
          </Link>

          <Link to="/teacher/preferences" className="quick-action-btn">
            <i className="fas fa-list-ol"></i>
            Tercihlerimi Görüntüle
          </Link>

          <div className="quick-action-btn" style={{ opacity: 0.6, pointerEvents: 'none' }}>
            <i className="fas fa-file-pdf"></i>
            Tercih Belgem (Yakında)
          </div>
        </div>
      </div>

      {!periodStatus?.hasActivePeriod && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-info-circle"></i>
              Bilgilendirme
            </h2>
          </div>
          <div className="alert alert-info">
            <i className="fas fa-calendar-times"></i>
            Şu anda aktif bir tercih dönemi bulunmamaktadır. Tercih dönemi açıldığında buradan bilgilendirileceksiniz.
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-user-circle"></i>
            Kişisel Bilgilerim
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Ad Soyad</h4>
            <p style={{ margin: '0', color: '#666' }}>
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>TC Kimlik No</h4>
            <p style={{ margin: '0', color: '#666' }}>{user?.tcId}</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Branş</h4>
            <p style={{ margin: '0', color: '#666' }}>{user?.branch}</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Mevcut Görev Yeri</h4>
            <p style={{ margin: '0', color: '#666' }}>
              {user?.currentAssignment || 'Belirtilmemiş'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;