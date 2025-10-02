import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalPositions: 0,
    activePeriods: 0,
    completedPreferences: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      const [teachersResponse, positionsResponse, periodsResponse] = await Promise.all([
        axios.get('/admin/teachers?limit=1'),
        axios.get('/admin/positions?limit=1'),
        axios.get('/admin/periods')
      ]);

      // Get current period
      const currentPeriodResponse = await axios.get('/admin/periods/current');

      setStats({
        totalTeachers: teachersResponse.data.pagination?.totalCount || 0,
        totalPositions: positionsResponse.data.pagination?.totalCount || 0,
        activePeriods: periodsResponse.data.filter(p => p.status === 'active').length,
        completedPreferences: 0 // Will be calculated from current period
      });

      setCurrentPeriod(currentPeriodResponse.data);

      // If there's a current period, get preference stats
      if (currentPeriodResponse.data) {
        const preferencesResponse = await axios.get(`/admin/periods/${currentPeriodResponse.data.id}/preferences`);
        setStats(prev => ({
          ...prev,
          completedPreferences: preferencesResponse.data.stats?.teachers_with_preferences || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'completed': return '#6c757d';
      case 'upcoming': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'upcoming': return 'Yaklaşan';
      default: return 'Bilinmiyor';
    }
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
          Yönetici Paneli
        </h1>
        <p className="dashboard-subtitle">
          Hoş geldiniz, {user?.username}! Sistem durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalTeachers}</div>
          <div className="stat-label">
            <i className="fas fa-users"></i>
            Toplam Öğretmen
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalPositions}</div>
          <div className="stat-label">
            <i className="fas fa-map-marker-alt"></i>
            Açık Pozisyon
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.activePeriods}</div>
          <div className="stat-label">
            <i className="fas fa-calendar-check"></i>
            Aktif Dönem
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.completedPreferences}</div>
          <div className="stat-label">
            <i className="fas fa-check-circle"></i>
            Tercih Yapan
          </div>
        </div>
      </div>

      {currentPeriod && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-calendar-alt"></i>
              Mevcut Tercih Dönemi
            </h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                Dönem Bilgileri
              </h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Başlangıç:</strong> {formatDate(currentPeriod.start_date)}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Bitiş:</strong> {formatDate(currentPeriod.end_date)}
              </p>
              <div style={{ marginTop: '10px' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: getStatusColor(currentPeriod.status)
                  }}
                >
                  {getStatusText(currentPeriod.status)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link
                to={`/admin/periods`}
                className="btn btn-primary"
              >
                <i className="fas fa-cog"></i>
                Dönem Yönetimi
              </Link>
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
          <Link to="/admin/teachers" className="quick-action-btn">
            <i className="fas fa-user-plus"></i>
            Öğretmen Ekle
          </Link>

          <Link to="/admin/positions" className="quick-action-btn">
            <i className="fas fa-plus-circle"></i>
            Pozisyon Ekle
          </Link>

          <Link to="/admin/periods" className="quick-action-btn">
            <i className="fas fa-calendar-plus"></i>
            Dönem Oluştur
          </Link>

          <Link to="/admin/import" className="quick-action-btn">
            <i className="fas fa-file-import"></i>
            Toplu İçe Aktar
          </Link>

          <Link to="/admin/reports" className="quick-action-btn">
            <i className="fas fa-download"></i>
            Rapor İndir
          </Link>

          <Link to="/admin/statistics" className="quick-action-btn">
            <i className="fas fa-chart-bar"></i>
            İstatistikler
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-info-circle"></i>
            Sistem Bilgileri
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Sürüm Bilgisi</h4>
            <p style={{ margin: '0', color: '#666' }}>v1.0.0</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Son Güncelleme</h4>
            <p style={{ margin: '0', color: '#666' }}>
              {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Aktif Kullanıcı</h4>
            <p style={{ margin: '0', color: '#666' }}>{user?.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;