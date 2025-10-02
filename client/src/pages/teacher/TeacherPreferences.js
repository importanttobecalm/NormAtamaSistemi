import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './TeacherPreferences.css';

const TeacherPreferences = () => {
  const [availablePositions, setAvailablePositions] = useState([]);
  const [myPreferences, setMyPreferences] = useState([]);
  const [periodStatus, setPeriodStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [periodRes, positionsRes, myPrefsRes] = await Promise.all([
        axios.get('/teacher/preferences/period-status'),
        axios.get('/teacher/preferences/positions'),
        axios.get('/teacher/preferences/my-preferences'),
      ]);

      setPeriodStatus(periodRes.data);

      const preferredPositionIds = new Set(myPrefsRes.data.preferences.map(p => p.position_id));
      const available = positionsRes.data.filter(p => !preferredPositionIds.has(p.id));
      setAvailablePositions(available);
      
      const sortedPreferences = myPrefsRes.data.preferences.sort((a, b) => a.preference_rank - b.preference_rank);
      setMyPreferences(sortedPreferences);

    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPreference = (position) => {
    if (myPreferences.length >= 25) {
      alert('En fazla 25 tercih yapabilirsiniz.');
      return;
    }
    setMyPreferences([...myPreferences, position]);
    setAvailablePositions(availablePositions.filter(p => p.id !== position.id));
  };

  const removePreference = (position) => {
    setMyPreferences(myPreferences.filter(p => (p.id || p.position_id) !== (position.id || position.position_id)));
    // Add the position back to available positions, keeping its original properties
    const originalPosition = {
        id: position.position_id || position.id,
        school_name: position.school_name,
        district: position.district,
        branch: position.branch,
        quota: position.quota
    }
    setAvailablePositions([...availablePositions, originalPosition]);
  };

  const movePreference = (index, direction) => {
    const newPreferences = [...myPreferences];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newPreferences.length) return;

    const [movedItem] = newPreferences.splice(index, 1);
    newPreferences.splice(newIndex, 0, movedItem);
    setMyPreferences(newPreferences);
  };

  const handleSavePreferences = async () => {
    if (!periodStatus?.canEdit) {
      alert('Tercih dönemi aktif değil.');
      return;
    }

    setSaving(true);
    try {
      const preferencesToSave = myPreferences.map((pref, index) => ({
        positionId: pref.id || pref.position_id,
        rank: index + 1,
      }));

      await axios.post('/teacher/preferences/save', { preferences: preferencesToSave });
      alert('Tercihleriniz başarıyla kaydedildi.');
      fetchData(); // Re-fetch to confirm
    } catch (err) {
      alert('Tercihler kaydedilirken bir hata oluştu.');
      console.error('Save preferences error:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredPositions = availablePositions.filter(p =>
    p.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-container">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!periodStatus?.hasActivePeriod) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-info">Aktif bir tercih dönemi bulunmamaktadır.</div>
      </div>
    );
  }
  
  if (!periodStatus?.canEdit) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-warning">Tercih dönemi sona ermiştir. Tercihlerinizi sadece görüntüleyebilirsiniz.</div>
        <div className="preferences-grid read-only">
            <div className="preference-column">
              <h2>Tercihlerim ({myPreferences.length}/25)</h2>
              {myPreferences.map((pref, index) => (
                  <div key={pref.position_id} className="preference-card">
                    <span className="rank">{index + 1}</span>
                    <div className="school-info">
                      <span className="school-name">{pref.school_name}</span>
                      <span className="district">{pref.district}</span>
                    </div>
                  </div>
              ))}
            </div>
        </div>
      </div>
    );
  }

  return (
      <div className="dashboard-container preferences-container">
        <div className="preferences-header">
          <h1>Tercih Yap / Düzenle</h1>
          <button onClick={handleSavePreferences} className="save-button" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
          </button>
        </div>

        <div className="preferences-grid">
            <div className="preference-column">
              <h2>Uygun Pozisyonlar</h2>
              <input
                type="text"
                placeholder="Okul veya ilçe ara..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="positions-list">
                {filteredPositions.map((pos) => (
                    <div key={pos.id} className="preference-card">
                      <div className="school-info">
                        <span className="school-name">{pos.school_name}</span>
                        <span className="district">{pos.district}</span>
                      </div>
                      <button onClick={() => addPreference(pos)} className="btn-add">Ekle</button>
                    </div>
                ))}
              </div>
            </div>

            <div className="preference-column">
              <h2>Tercihlerim ({myPreferences.length}/25)</h2>
              <div className="positions-list">
                {myPreferences.map((pref, index) => (
                    <div key={pref.id || pref.position_id} className="preference-card">
                      <span className="rank">{index + 1}</span>
                      <div className="school-info">
                        <span className="school-name">{pref.school_name}</span>
                        <span className="district">{pref.district}</span>
                      </div>
                      <div className="preference-actions">
                        <button onClick={() => movePreference(index, -1)} disabled={index === 0} className="btn-move">▲</button>
                        <button onClick={() => movePreference(index, 1)} disabled={index === myPreferences.length - 1} className="btn-move">▼</button>
                        <button onClick={() => removePreference(pref)} className="btn-remove">Sil</button>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        </div>
      </div>
  );
};

export default TeacherPreferences;