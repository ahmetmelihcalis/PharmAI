// frontend/src/pages/ComparePage.js (TAM VE DOĞRU HALİ)

import React, { useState, useEffect } from 'react';
import { fetchDrugs, compareTwoDrugs } from '../services/api';

const ComparePage = () => {
    const [allDrugs, setAllDrugs] = useState([]);
    const [drug1, setDrug1] = useState('');
    const [drug2, setDrug2] = useState('');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await fetchDrugs();
                if (response.data && Array.isArray(response.data.drugs)) {
                    setAllDrugs(response.data.drugs.sort());
                }
            } catch (err) {
                setError('İlaç listesi sunucudan alınamadı.');
            }
        };
        loadInitialData();
    }, []);

    const handleCompare = async () => {
        if (!drug1 || !drug2) { setError('Lütfen karşılaştırmak için iki ilaç seçin.'); return; }
        if (drug1 === drug2) { setError('Lütfen farklı iki ilaç seçin.'); return; }
        setError(''); setLoading(true); setComparison(null);
        try {
            const response = await compareTwoDrugs(drug1, drug2);
            setComparison(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Karşılaştırma verileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const renderComparisonCard = (drugKey) => {
        if (!comparison || !comparison[drugKey]) return null;
        const drugDataKey = Object.keys(comparison).find(k => k.toLowerCase() === drugKey.toLowerCase());
        if (!drugDataKey) return null;
        const drugData = comparison[drugDataKey];
        return (
            <div className="card">
                <h2>{drugDataKey}</h2>
                <p><strong>Ortalama Puan:</strong> {drugData.average_rating} / 10</p>
                <p><strong>Toplam Yorum Sayısı:</strong> {drugData.total_reviews}</p>
                <div><strong>En Sık Kullanıldığı Durumlar:</strong>
                    <ul>
                        {drugData.top_conditions && Object.entries(drugData.top_conditions).map(([c, n]) => (<li key={c}>{c} ({n} yorum)</li>))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <h1 className="page-title">İlaç Karşılaştır</h1>
            <p className="page-description">Veri setimizdeki bilgilere dayanarak iki ilacı karşılaştırın.</p>
            
            {/* --- SINIF ADI GÜNCELLENDİ: "vertical" eklendi --- */}
            <div className="selection-area vertical">
                <select value={drug1} onChange={(e) => setDrug1(e.target.value)}>
                    <option value="">1. İlacı Seçin</option>
                    {allDrugs.map(d => <option key={`drug1-${d}`} value={d}>{d}</option>)}
                </select>
                <select value={drug2} onChange={(e) => setDrug2(e.target.value)}>
                    <option value="">2. İlacı Seçin</option>
                    {allDrugs.map(d => <option key={`drug2-${d}`} value={d}>{d}</option>)}
                </select>
                <button onClick={handleCompare} disabled={loading}>
                    {loading ? 'Karşılaştırılıyor...' : 'Karşılaştır'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            
            <div className="results-area">
                {comparison && renderComparisonCard(drug1)}
                {comparison && renderComparisonCard(drug2)}
            </div>
        </div>
    );
};

export default ComparePage;