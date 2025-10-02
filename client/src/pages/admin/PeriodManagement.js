import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PeriodManagement.css';

const PeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [periodStats, setPeriodStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'upcoming'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/periods');
      setPeriods(response.data);
    } catch (error) {
      console.error('Error fetching periods:', error);
      showError('Tercih dönemleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodStats = async (periodId) => {
    try {
      setStatsLoading(true);
      const response = await axios.get(`/admin/periods/${periodId}/preferences`);
      setPeriodStats(response.data);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error fetching period stats:', error);
      showError('Dönem istatistikleri yüklenirken hata oluştu');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Başlangıç tarihi zorunludur';
    }

    // End date validation
    if (!formData.endDate) {
      newErrors.endDate = 'Bitiş tarihi zorunludur';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editMode) {
        await axios.put(`/admin/periods/${currentPeriod.id}`, formData);
        showSuccess('Tercih dönemi başarıyla güncellendi');
      } else {
        await axios.post('/admin/periods', formData);
        showSuccess('Tercih dönemi başarıyla oluşturuldu');
      }

      closeModal();
      fetchPeriods();
    } catch (error) {
      console.error('Error saving period:', error);
      showError(error.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const handleEdit = (period) => {
    setEditMode(true);
    setCurrentPeriod(period);

    // Format dates for datetime-local input
    const startDate = new Date(period.start_date).toISOString().slice(0, 16);
    const endDate = new Date(period.end_date).toISOString().slice(0, 16);

    setFormData({
      startDate: startDate,
      endDate: endDate,
      status: period.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id, periodInfo) => {
    if (!window.confirm(`${periodInfo} dönemini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/periods/${id}`);
      showSuccess('Tercih dönemi başarıyla silindi');
      fetchPeriods();
    } catch (error) {
      console.error('Error deleting period:', error);
      showError('Tercih dönemi silinirken hata oluştu');
    }
  };

  const handleStatusChange = async (periodId, newStatus) => {
    try {
      await axios.patch(`/admin/periods/${periodId}/status`, { status: newStatus });
      showSuccess('Dönem durumu başarıyla güncellendi');
      fetchPeriods();
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Durum güncellenirken hata oluştu');
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentPeriod(null);
    setFormData({
      startDate: '',
      endDate: '',
      status: 'upcoming'
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentPeriod(null);
    setFormData({
      startDate: '',
      endDate: '',
      status: 'upcoming'
    });
    setErrors({});
  };

  const closeStatsModal = () => {
    setShowStatsModal(false);
    setPeriodStats(null);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Yaklaşan';
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return 'fa-clock';
      case 'active': return 'fa-play-circle';
      case 'completed': return 'fa-check-circle';
      default: return 'fa-question-circle';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <i className="fas fa-calendar-alt"></i>
          Tercih Dönemi Yönetimi
        </h1>
        <p className="dashboard-subtitle">
          Tercih dönemlerini oluştur ve yönet.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {errorMessage}
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="card-title">
            <i className="fas fa-list"></i>
            Tercih Dönemleri
          </h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i>
            Yeni Dönem Oluştur
          </button>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '50px' }}>
            <div className="loading"></div>
            <p style={{ marginTop: '10px' }}>Yükleniyor...</p>
          </div>
        ) : periods.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            Henüz tercih dönemi oluşturulmamış.
          </div>
        ) : (
          <div className="periods-container">
            {periods.map((period) => (
              <div key={period.id} className={`period-card period-${period.status}`}>
                <div className="period-header">
                  <div className="period-status">
                    <i className={`fas ${getStatusIcon(period.status)}`}></i>
                    <span className={`status-badge status-${period.status}`}>
                      {getStatusText(period.status)}
                    </span>
                  </div>
                  <div className="period-actions">
                    <button
                      className="btn-icon btn-stats"
                      onClick={() => fetchPeriodStats(period.id)}
                      title="İstatistikler"
                    >
                      <i className="fas fa-chart-bar"></i>
                    </button>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(period)}
                      title="Düzenle"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(period.id, formatDateTime(period.start_date))}
                      title="Sil"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="period-info">
                  <div className="period-dates">
                    <div className="date-item">
                      <i className="fas fa-calendar-plus"></i>
                      <div>
                        <span className="date-label">Başlangıç</span>
                        <span className="date-value">{formatDateTime(period.start_date)}</span>
                      </div>
                    </div>
                    <div className="date-item">
                      <i className="fas fa-calendar-minus"></i>
                      <div>
                        <span className="date-label">Bitiş</span>
                        <span className="date-value">{formatDateTime(period.end_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="period-meta">
                    <span className="meta-item">
                      <i className="fas fa-user"></i>
                      Oluşturan: {period.created_by_username || 'Bilinmiyor'}
                    </span>
                  </div>

                  {period.status !== 'completed' && (
                    <div className="period-status-actions">
                      {period.status === 'upcoming' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(period.id, 'active')}
                        >
                          <i className="fas fa-play"></i>
                          Aktif Yap
                        </button>
                      )}
                      {period.status === 'active' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleStatusChange(period.id, 'completed')}
                        >
                          <i className="fas fa-stop"></i>
                          Tamamla
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus'}`}></i>
                {editMode ? 'Tercih Dönemi Düzenle' : 'Yeni Tercih Dönemi Oluştur'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="startDate">
                    Başlangıç Tarihi ve Saati <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={errors.startDate ? 'error' : ''}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="endDate">
                    Bitiş Tarihi ve Saati <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={errors.endDate ? 'error' : ''}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>

                {editMode && (
                  <div className="form-group full-width">
                    <label htmlFor="status">
                      Durum <span className="required">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="upcoming">Yaklaşan</option>
                      <option value="active">Aktif</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'}`}></i>
                  {editMode ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="modal-overlay" onClick={closeStatsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-chart-bar"></i>
                Dönem İstatistikleri
              </h2>
              <button className="modal-close" onClick={closeStatsModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="stats-content">
              {statsLoading ? (
                <div className="text-center" style={{ padding: '50px' }}>
                  <div className="loading"></div>
                  <p style={{ marginTop: '10px' }}>Yükleniyor...</p>
                </div>
              ) : periodStats ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{periodStats.stats?.teachers_with_preferences || 0}</div>
                        <div className="stat-label">Tercih Yapan Öğretmen</div>
                      </div>
                    </div>

                    <div className="stat-box">
                      <div className="stat-icon">
                        <i className="fas fa-list"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-value">{periodStats.stats?.total_preferences || 0}</div>
                        <div className="stat-label">Toplam Tercih</div>
                      </div>
                    </div>
                  </div>

                  {periodStats.preferences && periodStats.preferences.length > 0 ? (
                    <div className="preferences-list">
                      <h3>Son Tercihler</h3>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Öğretmen</th>
                              <th>Tercih Sayısı</th>
                              <th>Tarih</th>
                            </tr>
                          </thead>
                          <tbody>
                            {periodStats.preferences.slice(0, 10).map((pref, index) => (
                              <tr key={index}>
                                <td>{pref.teacher_name || 'N/A'}</td>
                                <td>{pref.preference_count || 0}</td>
                                <td>{formatDateTime(pref.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle"></i>
                      Bu dönem için henüz tercih yapılmamış.
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodManagement;