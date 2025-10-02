import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherManagement.css';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const [formData, setFormData] = useState({
    tcId: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    placementPoints: '',
    branch: '',
    currentAssignment: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [pagination.currentPage, search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/teachers', {
        params: {
          page: pagination.currentPage,
          limit: 20,
          search: search
        }
      });

      setTeachers(response.data.teachers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showError('Öğretmenler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
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

    // TC ID validation
    if (!formData.tcId) {
      newErrors.tcId = 'TC Kimlik No zorunludur';
    } else if (!/^\d{11}$/.test(formData.tcId)) {
      newErrors.tcId = 'TC Kimlik No 11 haneli olmalıdır';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad zorunludur';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad zorunludur';
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Doğum Tarihi zorunludur';
    }

    // Placement points validation
    if (!formData.placementPoints) {
      newErrors.placementPoints = 'Yerleştirme Puanı zorunludur';
    } else if (isNaN(formData.placementPoints) || parseFloat(formData.placementPoints) < 0) {
      newErrors.placementPoints = 'Geçerli bir puan giriniz';
    }

    // Branch validation
    if (!formData.branch.trim()) {
      newErrors.branch = 'Branş zorunludur';
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
        await axios.put(`/admin/teachers/${currentTeacher.tc_id}`, formData);
        showSuccess('Öğretmen bilgileri başarıyla güncellendi');
      } else {
        await axios.post('/admin/teachers', formData);
        showSuccess('Öğretmen başarıyla eklendi');
      }

      closeModal();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      showError(error.response?.data?.message || 'İşlem sırasında hata oluştu');
    }
  };

  const handleEdit = (teacher) => {
    setEditMode(true);
    setCurrentTeacher(teacher);
    setFormData({
      tcId: teacher.tc_id,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      birthDate: teacher.birth_date.split('T')[0],
      placementPoints: teacher.placement_points.toString(),
      branch: teacher.branch,
      currentAssignment: teacher.current_assignment || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (tcId, fullName) => {
    if (!window.confirm(`${fullName} isimli öğretmeni silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await axios.delete(`/admin/teachers/${tcId}`);
      showSuccess('Öğretmen başarıyla silindi');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showError('Öğretmen silinirken hata oluştu');
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentTeacher(null);
    setFormData({
      tcId: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      placementPoints: '',
      branch: '',
      currentAssignment: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentTeacher(null);
    setFormData({
      tcId: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      placementPoints: '',
      branch: '',
      currentAssignment: ''
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <i className="fas fa-users"></i>
          Öğretmen Yönetimi
        </h1>
        <p className="dashboard-subtitle">
          Öğretmenleri ekle, düzenle ve yönet.
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
            Öğretmen Listesi
          </h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i>
            Yeni Öğretmen Ekle
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Öğretmen ara (Ad, Soyad, TC, Branş)..."
            value={search}
            onChange={handleSearchChange}
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '50px' }}>
            <div className="loading"></div>
            <p style={{ marginTop: '10px' }}>Yükleniyor...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            {search ? 'Arama kriterlerine uygun öğretmen bulunamadı.' : 'Henüz öğretmen eklenmemiş.'}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TC Kimlik No</th>
                    <th>Ad Soyad</th>
                    <th>Doğum Tarihi</th>
                    <th>Branş</th>
                    <th>Yerleştirme Puanı</th>
                    <th>Mevcut Görev Yeri</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.tc_id}>
                      <td>{teacher.tc_id}</td>
                      <td>{teacher.first_name} {teacher.last_name}</td>
                      <td>{formatDate(teacher.birth_date)}</td>
                      <td>{teacher.branch}</td>
                      <td>{teacher.placement_points}</td>
                      <td>{teacher.current_assignment || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(teacher)}
                            title="Düzenle"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(teacher.tc_id, `${teacher.first_name} ${teacher.last_name}`)}
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
                  Sayfa {pagination.currentPage} / {pagination.totalPages} (Toplam {pagination.totalCount} öğretmen)
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
                {editMode ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="tcId">
                    TC Kimlik No <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="tcId"
                    name="tcId"
                    value={formData.tcId}
                    onChange={handleInputChange}
                    disabled={editMode}
                    className={errors.tcId ? 'error' : ''}
                    maxLength="11"
                  />
                  {errors.tcId && <span className="error-message">{errors.tcId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="firstName">
                    Ad <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">
                    Soyad <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">
                    Doğum Tarihi <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={errors.birthDate ? 'error' : ''}
                  />
                  {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="placementPoints">
                    Yerleştirme Puanı <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="placementPoints"
                    name="placementPoints"
                    value={formData.placementPoints}
                    onChange={handleInputChange}
                    className={errors.placementPoints ? 'error' : ''}
                  />
                  {errors.placementPoints && <span className="error-message">{errors.placementPoints}</span>}
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
                  />
                  {errors.branch && <span className="error-message">{errors.branch}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="currentAssignment">
                    Mevcut Görev Yeri
                  </label>
                  <input
                    type="text"
                    id="currentAssignment"
                    name="currentAssignment"
                    value={formData.currentAssignment}
                    onChange={handleInputChange}
                  />
                </div>
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

export default TeacherManagement;