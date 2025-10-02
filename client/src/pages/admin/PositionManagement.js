import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PositionManagement.css';

const PositionManagement = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  const [formData, setFormData] = useState({
    schoolName: '',
    district: '',
    branch: '',
    quota: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPositions();
    fetchBranches();
  }, [pagination.currentPage, search, branchFilter]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/positions', {
        params: {
          page: pagination.currentPage,
          limit: 20,
          search: search,
          branch: branchFilter
        }
      });

      setPositions(response.data.positions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching positions:', error);
      showError('Pozisyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/admin/positions/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
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

    // School name validation
    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'Okul adı zorunludur';
    }

    // District validation
    if (!formData.district.trim()) {
      newErrors.district = 'İlçe zorunludur';
    }

    // Branch validation
    if (!formData.branch.trim()) {
      newErrors.branch = 'Branş zorunludur';
    }

    // Quota validation
    if (!formData.quota) {
      newErrors.quota = 'Kontenjan zorunludur';
    } else if (isNaN(formData.quota) || parseInt(formData.quota) < 1) {
      newErrors.quota = 'Geçerli bir kontenjan giriniz (minimum 1)';
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
        await axios.put(`/admin/positions/${currentPosition.id}`, formData);
        showSuccess('Pozisyon başarıyla güncellendi');
      } else {
        await axios.post('/admin/positions', formData);
        showSuccess('Pozisyon başarıyla eklendi');
      }

      closeModal();
      fetchPositions();
      fetchBranches(); // Refresh branch list
    } catch (error) {
      console.error('Error saving position:', error);
      showError(error.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const handleEdit = (position) => {
    setEditMode(true);
    setCurrentPosition(position);
    setFormData({
      schoolName: position.school_name,
      district: position.district,
      branch: position.branch,
      quota: position.quota.toString(),
      status: position.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id, schoolName) => {
    if (!window.confirm(`${schoolName} pozisyonunu silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/positions/${id}`);
      showSuccess('Pozisyon başarıyla silindi');
      fetchPositions();
      fetchBranches(); // Refresh branch list
    } catch (error) {
      console.error('Error deleting position:', error);
      showError('Pozisyon silinirken hata oluştu');
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentPosition(null);
    setFormData({
      schoolName: '',
      district: '',
      branch: '',
      quota: '',
      status: 'active'
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentPosition(null);
    setFormData({
      schoolName: '',
      district: '',
      branch: '',
      quota: '',
      status: 'active'
    });
    setErrors({});
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleBranchFilterChange = (e) => {
    setBranchFilter(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <i className="fas fa-map-marker-alt"></i>
          Pozisyon Yönetimi
        </h1>
        <p className="dashboard-subtitle">
          Açık pozisyonları ekle, düzenle ve yönet.
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
            Pozisyon Listesi
          </h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i>
            Yeni Pozisyon Ekle
          </button>
        </div>

        <div className="filter-container">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Okul veya ilçe ara..."
              value={search}
              onChange={handleSearchChange}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          <div className="filter-wrapper">
            <select
              className="filter-select"
              value={branchFilter}
              onChange={handleBranchFilterChange}
            >
              <option value="">Tüm Branşlar</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '50px' }}>
            <div className="loading"></div>
            <p style={{ marginTop: '10px' }}>Yükleniyor...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            {search || branchFilter ? 'Arama kriterlerine uygun pozisyon bulunamadı.' : 'Henüz pozisyon eklenmemiş.'}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Okul Adı</th>
                    <th>İlçe</th>
                    <th>Branş</th>
                    <th>Kontenjan</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td>{position.school_name}</td>
                      <td>{position.district}</td>
                      <td>
                        <span className="branch-badge">{position.branch}</span>
                      </td>
                      <td>
                        <span className="quota-badge">{position.quota}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${position.status}`}>
                          {position.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(position)}
                            title="Düzenle"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(position.id, position.school_name)}
                            title="Sil"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  <i className="fas fa-chevron-left"></i>
                  Önceki
                </button>
                <span className="pagination-info">
                  Sayfa {pagination.currentPage} / {pagination.totalPages} (Toplam {pagination.totalCount} pozisyon)
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Sonraki
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus'}`}></i>
                {editMode ? 'Pozisyon Düzenle' : 'Yeni Pozisyon Ekle'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="schoolName">
                    Okul Adı <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className={errors.schoolName ? 'error' : ''}
                    placeholder="Örn: Atatürk İlkokulu"
                  />
                  {errors.schoolName && <span className="error-message">{errors.schoolName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="district">
                    İlçe <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={errors.district ? 'error' : ''}
                    placeholder="Örn: Merkez"
                  />
                  {errors.district && <span className="error-message">{errors.district}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="branch">
                    Branş <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={errors.branch ? 'error' : ''}
                    placeholder="Örn: Matematik, İngilizce"
                  />
                  {errors.branch && <span className="error-message">{errors.branch}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="quota">
                    Kontenjan <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="quota"
                    name="quota"
                    min="1"
                    value={formData.quota}
                    onChange={handleInputChange}
                    className={errors.quota ? 'error' : ''}
                    placeholder="Örn: 1"
                  />
                  {errors.quota && <span className="error-message">{errors.quota}</span>}
                </div>

                {editMode && (
                  <div className="form-group">
                    <label htmlFor="status">
                      Durum <span className="required">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
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
                  {editMode ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionManagement;