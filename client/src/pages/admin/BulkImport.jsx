import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/BulkImport.css';

function BulkImport() {
    const [teacherFile, setTeacherFile] = useState(null);
    const [positionFile, setPositionFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleTeacherFileChange = (e) => {
        setTeacherFile(e.target.files[0]);
        setResult(null);
    };

    const handlePositionFileChange = (e) => {
        setPositionFile(e.target.files[0]);
        setResult(null);
    };

    const handleTeacherImport = async () => {
        if (!teacherFile) {
            alert('Lütfen bir dosya seçin');
            return;
        }

        const formData = new FormData();
        formData.append('file', teacherFile);

        try {
            setLoading(true);
            const response = await axios.post('/api/admin/import/teachers', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setResult({
                type: 'success',
                message: response.data.message,
                details: response.data
            });
            setTeacherFile(null);
            document.getElementById('teacherFileInput').value = '';
        } catch (error) {
            setResult({
                type: 'error',
                message: error.response?.data?.message || 'İçe aktarma başarısız'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePositionImport = async () => {
        if (!positionFile) {
            alert('Lütfen bir dosya seçin');
            return;
        }

        const formData = new FormData();
        formData.append('file', positionFile);

        try {
            setLoading(true);
            const response = await axios.post('/api/admin/import/positions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setResult({
                type: 'success',
                message: response.data.message,
                details: response.data
            });
            setPositionFile(null);
            document.getElementById('positionFileInput').value = '';
        } catch (error) {
            setResult({
                type: 'error',
                message: error.response?.data?.message || 'İçe aktarma başarısız'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bulk-import">
            <h2>Toplu İçe Aktar</h2>

            <div className="import-sections">
                {/* Teacher Import */}
                <div className="import-section">
                    <h3>Öğretmen İçe Aktar</h3>
                    <div className="import-info">
                        <p><strong>Excel Format:</strong></p>
                        <ul>
                            <li>TC: TC Kimlik Numarası (11 haneli)</li>
                            <li>Ad: Öğretmen Adı</li>
                            <li>Soyad: Öğretmen Soyadı</li>
                            <li>Doğum Tarihi: GG.AA.YYYY formatında (örn: 15.05.1985)</li>
                            <li>Puan: Atama Puanı (sayısal)</li>
                            <li>Branş: Branş Adı</li>
                            <li>Mevcut Atama: Mevcut görev yeri (opsiyonel)</li>
                        </ul>
                    </div>

                    <div className="file-input-group">
                        <input
                            type="file"
                            id="teacherFileInput"
                            accept=".xlsx,.xls"
                            onChange={handleTeacherFileChange}
                            disabled={loading}
                        />
                        <button
                            onClick={handleTeacherImport}
                            disabled={!teacherFile || loading}
                            className="btn-import"
                        >
                            {loading ? 'İşleniyor...' : 'Öğretmenleri İçe Aktar'}
                        </button>
                    </div>
                </div>

                {/* Position Import */}
                <div className="import-section">
                    <h3>Pozisyon İçe Aktar</h3>
                    <div className="import-info">
                        <p><strong>Excel Format:</strong></p>
                        <ul>
                            <li>Okul Adı: Okulun tam adı</li>
                            <li>İlçe: İlçe adı</li>
                            <li>Branş: Branş adı</li>
                            <li>Kontenjan: Kontenjan sayısı (sayısal)</li>
                            <li>Durum: Aktif veya Pasif (opsiyonel, varsayılan: Aktif)</li>
                        </ul>
                    </div>

                    <div className="file-input-group">
                        <input
                            type="file"
                            id="positionFileInput"
                            accept=".xlsx,.xls"
                            onChange={handlePositionFileChange}
                            disabled={loading}
                        />
                        <button
                            onClick={handlePositionImport}
                            disabled={!positionFile || loading}
                            className="btn-import"
                        >
                            {loading ? 'İşleniyor...' : 'Pozisyonları İçe Aktar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Display */}
            {result && (
                <div className={`import-result ${result.type}`}>
                    <h4>{result.type === 'success' ? '✓ Başarılı' : '✗ Hata'}</h4>
                    <p>{result.message}</p>
                    {result.details && (
                        <div className="result-details">
                            <p>Başarılı: {result.details.successCount}</p>
                            <p>Hatalı: {result.details.errorCount}</p>
                            {result.details.errors && result.details.errors.length > 0 && (
                                <div className="errors">
                                    <strong>Hatalar:</strong>
                                    <ul>
                                        {result.details.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default BulkImport;
