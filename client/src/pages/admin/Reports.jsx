import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Reports.css';

function Reports() {
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const response = await axios.get('/api/admin/periods', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPeriods(response.data);
            if (response.data.length > 0) {
                setSelectedPeriod(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const downloadReport = async (endpoint, filename) => {
        if (!selectedPeriod) {
            alert('Lütfen bir dönem seçin');
            return;
        }

        try {
            setDownloading(endpoint);
            const response = await axios.get(`/api/admin/reports/${endpoint}/${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Rapor indirilemedi');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="reports">
            <h2>Rapor İndir</h2>

            <div className="period-selector">
                <label>Tercih Dönemi:</label>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    <option value="">Dönem Seçin</option>
                    {periods.map(period => (
                        <option key={period.id} value={period.id}>
                            {new Date(period.start_date).toLocaleDateString('tr-TR')} -
                            {new Date(period.end_date).toLocaleDateString('tr-TR')}
                            ({period.status})
                        </option>
                    ))}
                </select>
            </div>

            <div className="report-cards">
                <div className="report-card">
                    <div className="report-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h3>Öğretmenler ve Tercihler</h3>
                    <p>Tüm öğretmenlerin bilgileri ve tercih ettikleri pozisyonlar</p>
                    <button
                        onClick={() => downloadReport('teachers', `ogretmenler_tercihler_${Date.now()}.xlsx`)}
                        disabled={!selectedPeriod || downloading === 'teachers'}
                        className="btn-download"
                    >
                        {downloading === 'teachers' ? 'İndiriliyor...' : 'Excel İndir'}
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h3>Atama Sonuçları</h3>
                    <p>Atanan ve açıkta kalan öğretmenlerin detaylı listesi</p>
                    <button
                        onClick={() => downloadReport('assignments', `atama_sonuclari_${Date.now()}.xlsx`)}
                        disabled={!selectedPeriod || downloading === 'assignments'}
                        className="btn-download"
                    >
                        {downloading === 'assignments' ? 'İndiriliyor...' : 'Excel İndir'}
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h3>Pozisyon Durumları</h3>
                    <p>Tüm pozisyonların kontenjan ve doluluk bilgileri</p>
                    <button
                        onClick={() => downloadReport('positions', `pozisyon_durumlari_${Date.now()}.xlsx`)}
                        disabled={!selectedPeriod || downloading === 'positions'}
                        className="btn-download"
                    >
                        {downloading === 'positions' ? 'İndiriliyor...' : 'Excel İndir'}
                    </button>
                </div>
            </div>

            <div className="report-info">
                <h3>📋 Rapor Bilgileri</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <strong>Öğretmenler ve Tercihler:</strong>
                        <p>Öğretmenlerin kişisel bilgileri, branşları, puanları ve tercih ettikleri pozisyonlar (1-25. tercihler) Excel formatında sunulur.</p>
                    </div>
                    <div className="info-item">
                        <strong>Atama Sonuçları:</strong>
                        <p>İki ayrı sayfa içerir: Atanan öğretmenlerin hangi okullara, kaçıncı tercihleri ile atandıkları ve açıkta kalan öğretmenlerin listesi.</p>
                    </div>
                    <div className="info-item">
                        <strong>Pozisyon Durumları:</strong>
                        <p>Tüm açık pozisyonların kontenjan bilgileri, kaç tanesinin dolduğu ve boş kalan kontenjan sayıları detaylı olarak listelenir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;
