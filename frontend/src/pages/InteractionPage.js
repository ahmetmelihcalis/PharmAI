// frontend/src/pages/InteractionPage.js (TAM VE DÜZELTİLMİŞ HALİ)

import React, { useState, useEffect } from 'react';
import { fetchDrugs, checkInteraction } from '../services/api';
import './InteractionPage.css'; // Sayfaya özel CSS'i import ediyoruz

const InteractionPage = () => {
    const [allDrugs, setAllDrugs] = useState([]);
    const [drug1, setDrug1] = useState('');
    const [drug2, setDrug2] = useState('');
    const [result, setResult] = useState(null);
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
                console.error("İlaç listesi alınamadı:", err);
                setError('İlaç listesi sunucudan alınamadı.');
            }
        };
        loadInitialData();
    }, []);

    const handleCheck = async () => {
        if (!drug1 || !drug2) { setError('Lütfen iki ilaç seçin.'); return; }
        if (drug1 === drug2) { setError('Lütfen farklı iki ilaç seçin.'); return; }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const response = await checkInteraction(drug1, drug2);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Etkileşim verileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        if (!result) return null;
        if (result.message) {
            return (<div className="interaction-card no-interaction"><h3>Sonuç</h3><p>{result.message}</p></div>);
        }
        if (result.interactions && result.interactions.length > 0) {
            return (
                <div className="interaction-results-container">
                    {result.interactions.map((interaction, index) => (
                        <div key={index} className={`interaction-card severity-${interaction.severity.toLowerCase().replace(' ', '-')}`}>
                            <h3>Etkileşim Seviyesi: <span>{interaction.severity}</span></h3>
                            <p>{interaction.description}</p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-container">
            <h1 className="page-title">İlaç Etkileşim Kontrolü</h1>
            <p className="page-description">İki ilaç arasındaki potansiyel etkileşimleri NLM (ABD Ulusal Tıp Kütüphanesi) verilerine dayanarak kontrol edin.</p>
            <div className="disclaimer-box">
                <strong>Uyarı:</strong> Bu araç profesyonel tıbbi tavsiye yerine geçmez. İlaçlarınızla ilgili kararları mutlaka doktorunuza veya eczacınıza danışarak alınız.
            </div>
            
            {/* --- DEĞİŞİKLİK BURADA: 'vertical' sınıfı eklendi --- */}
            <div className="selection-area vertical">
                <select value={drug1} onChange={(e) => setDrug1(e.target.value)}>
                    <option value="">1. İlacı Seçin</option>
                    {allDrugs.map(d => <option key={`int-drug1-${d}`} value={d}>{d}</option>)}
                </select>
                <select value={drug2} onChange={(e) => setDrug2(e.target.value)}>
                    <option value="">2. İlacı Seçin</option>
                    {allDrugs.map(d => <option key={`int-drug2-${d}`} value={d}>{d}</option>)}
                </select>
                <button onClick={handleCheck} disabled={loading}>
                    {loading ? 'Kontrol Ediliyor...' : 'Etkileşimi Kontrol Et'}
                </button>
            </div>
            {/* --- DEĞİŞİKLİK SONU --- */}
            
            {error && <p className="error-message">{error}</p>}
            <div className="results-area">{renderResult()}</div>
        </div>
    );
};

export default InteractionPage;