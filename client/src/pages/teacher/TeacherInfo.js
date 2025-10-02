import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherInfo = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/teacher/profile/info');
      setTeacherInfo(response.data);
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateString) => {
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
          <p style={{ marginTop: '10px' }}>Bilgiler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <i className="fas fa-user"></i>
          Kişisel Bilgilerim
        </h1>
        <p className="dashboard-subtitle">
          Sistemde kayıtlı kişisel bilgilerinizi görüntüleyebilirsiniz.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-id-card"></i>
            Temel Bilgiler
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div className="info-section">
            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-user"></i>
                Ad
              </label>
              <div className="info-value">{teacherInfo?.firstName}</div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-user"></i>
                Soyad
              </label>
              <div className="info-value">{teacherInfo?.lastName}</div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-id-card"></i>
                TC Kimlik Numarası
              </label>
              <div className="info-value">{teacherInfo?.tcId}</div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-calendar"></i>
                Doğum Tarihi
              </label>
              <div className="info-value">
                {teacherInfo?.birthDate ? formatDate(teacherInfo.birthDate) : '-'}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-star"></i>
                Yerleştirme Puanı
              </label>
              <div className="info-value score">
                {teacherInfo?.placementPoints ? Number(teacherInfo.placementPoints).toFixed(2) : '0.00'} puan
              </div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-graduation-cap"></i>
                Branş
              </label>
              <div className="info-value">{teacherInfo?.branch}</div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <i className="fas fa-school"></i>
                Mevcut Görev Yeri
              </label>
              <div className="info-value">
                {teacherInfo?.currentAssignment || 'Belirtilmemiş'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-clock"></i>
            Sistem Bilgileri
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div className="info-item">
            <label className="info-label">
              <i className="fas fa-calendar-plus"></i>
              Kayıt Tarihi
            </label>
            <div className="info-value">
              {teacherInfo?.createdAt ? formatDateTime(teacherInfo.createdAt) : '-'}
            </div>
          </div>

          <div className="info-item">
            <label className="info-label">
              <i className="fas fa-sign-in-alt"></i>
              Son Giriş
            </label>
            <div className="info-value">
              {teacherInfo?.lastLogin ? formatDateTime(teacherInfo.lastLogin) : 'İlk giriş'}
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle"></i>
        <strong>Not:</strong> Kişisel bilgilerinizde herhangi bir hata olduğunu düşünüyorsanız,
        lütfen sistem yöneticisi ile iletişime geçiniz. Bu bilgiler sadece yetkili personel tarafından güncellenebilir.
      </div>

      <style jsx>{`
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #555;
          font-size: 14px;
        }

        .info-label i {
          width: 16px;
          color: #007bff;
        }

        .info-value {
          padding: 10px 12px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          color: #333;
          font-weight: 500;
        }

        .info-value.score {
          background-color: #e7f3ff;
          border-color: #007bff;
          color: #007bff;
          font-size: 18px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0 10px;
          }

          .info-section {
            gap: 15px;
          }

          .info-value {
            padding: 8px 10px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherInfo;