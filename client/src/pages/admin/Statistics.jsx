import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Statistics.css';

function Statistics() {
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

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

    const fetchStatistics = async (periodId) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/assignments/statistics/${periodId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            alert('İstatistikler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const runAssignment = async () => {
        if (!selectedPeriod) {
            alert('Lütfen bir dönem seçin');
            return;
        }

        if (!window.confirm('Atama işlemini başlatmak istediğinizden emin misiniz? Bu işlem mevcut atamaları güncelleyecektir.')) {
            return;
        }

        try {
            setAssigning(true);
            const response = await axios.post(`/api/admin/assignments/run/${selectedPeriod}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            alert(`${response.data.message}\nAtanan: ${response.data.assignedCount}\nAçıkta kalan: ${response.data.unassignedCount}`);

            // Refresh statistics
            fetchStatistics(selectedPeriod);
        } catch (error) {
            alert(error.response?.data?.message || 'Atama işlemi başarısız');
        } finally {
            setAssigning(false);
        }
    };

    const handlePeriodChange = (e) => {
        const periodId = e.target.value;
        setSelectedPeriod(periodId);
        if (periodId) {
            fetchStatistics(periodId);
        } else {
            setStatistics(null);
        }
    };

    return (
        <div className="statistics">
            <h2>İstatistikler ve Atama Yönetimi</h2>

            <div className="controls">
                <div className="period-selector">
                    <label>Tercih Dönemi:</label>
                    <select value={selectedPeriod} onChange={handlePeriodChange}>
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

                <button
                    className="btn-run-assignment"
                    onClick={runAssignment}
                    disabled={!selectedPeriod || assigning}
                >
                    {assigning ? 'Atama Yapılıyor...' : 'Atama İşlemini Başlat'}
                </button>
            </div>

            {loading && <div className="loading">Yükleniyor...</div>}

            {statistics && (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Atanan Öğretmen</h3>
                            <div className="card-value">{statistics.summary.totalAssigned}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Açıkta Kalan</h3>
                            <div className="card-value warning">{statistics.summary.totalUnassigned}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Toplam Pozisyon</h3>
                            <div className="card-value">{statistics.summary.totalPositions}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Dolu Pozisyon</h3>
                            <div className="card-value">{statistics.summary.filledPositions}</div>
                        </div>
                    </div>

                    <div className="statistics-sections">
                        {/* Assigned Teachers */}
                        <div className="stat-section">
                            <h3>Atanan Öğretmenler ({statistics.assigned.length})</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ad Soyad</th>
                                            <th>Branş</th>
                                            <th>Puan</th>
                                            <th>Atandığı Okul</th>
                                            <th>İlçe</th>
                                            <th>Tercih Sırası</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.assigned.map((teacher, index) => (
                                            <tr key={index}>
                                                <td>{teacher.first_name} {teacher.last_name}</td>
                                                <td>{teacher.branch}</td>
                                                <td className="score">{teacher.placement_points}</td>
                                                <td>{teacher.school_name}</td>
                                                <td>{teacher.district}</td>
                                                <td className="rank">{teacher.preference_rank}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Unassigned Teachers */}
                        {statistics.unassigned.length > 0 && (
                            <div className="stat-section">
                                <h3>Açıkta Kalan Öğretmenler ({statistics.unassigned.length})</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Ad Soyad</th>
                                                <th>Branş</th>
                                                <th>Puan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.unassigned.map((teacher, index) => (
                                                <tr key={index} className="unassigned-row">
                                                    <td>{teacher.first_name} {teacher.last_name}</td>
                                                    <td>{teacher.branch}</td>
                                                    <td className="score">{teacher.placement_points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Position Fill Rates */}
                        <div className="stat-section">
                            <h3>Pozisyon Doluluk Oranları</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Okul Adı</th>
                                            <th>İlçe</th>
                                            <th>Branş</th>
                                            <th>Kontenjan</th>
                                            <th>Dolu</th>
                                            <th>Boş</th>
                                            <th>Doluluk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.positionStats.map((pos, index) => {
                                            const fillRate = (pos.filled_count / pos.quota * 100).toFixed(0);
                                            return (
                                                <tr key={index}>
                                                    <td>{pos.school_name}</td>
                                                    <td>{pos.district}</td>
                                                    <td>{pos.branch}</td>
                                                    <td>{pos.quota}</td>
                                                    <td>{pos.filled_count}</td>
                                                    <td>{pos.quota - pos.filled_count}</td>
                                                    <td>
                                                        <div className="fill-rate">
                                                            <div
                                                                className="fill-bar"
                                                                style={{
                                                                    width: `${fillRate}%`,
                                                                    background: fillRate >= 100 ? '#27ae60' : fillRate >= 50 ? '#f39c12' : '#e74c3c'
                                                                }}
                                                            />
                                                            <span>{fillRate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Statistics;
