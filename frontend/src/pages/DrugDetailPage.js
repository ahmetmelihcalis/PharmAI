import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    getDrugDetails, 
    fetchDrugSummary, 
    addFavoriteDrug, 
    fetchBatchTranslations, 
} from '../services/api';
import './DrugDetail.css';

const DrugDetailPage = () => {
    const rawDrugName = useParams().drugName;
    const drugNameVariants = [
      rawDrugName,
      rawDrugName.replace(/\s*\/\s*/g, '_slash_'),
      rawDrugName.replace(/\s*\/\s*/g, ' slash '),
      rawDrugName.replace(/\s*\/\s*/g, ''),
      rawDrugName.replace(/\s*\/\s*/g, '_'),
      rawDrugName.replace(/_/g, ' / '),
      rawDrugName.replace(/_/g, ' '),
      rawDrugName.replace(/\s*\/\s*/g, ' / '),
      rawDrugName.replace(/\s*\/\s*/g, ' '),
      rawDrugName.replace(/_/g, '/'),
      rawDrugName.replace(/_/g, ''),
      rawDrugName.replace(/\s*\/\s*/g, '/'),
      rawDrugName.replace(/\s*\/\s*/g, ''),
      rawDrugName.replace(/\s*\/\s*/g, ' / '),
      rawDrugName.replace(/\s*\/\s*/g, ' '),
      rawDrugName.toLowerCase(),
      rawDrugName.toUpperCase(),
      rawDrugName.replace(/\s*\/\s*/g, ' / ').toLowerCase(),
      rawDrugName.replace(/\s*\/\s*/g, ' / ').toUpperCase(),
      rawDrugName.replace(/\s*\/\s*/g, ' ').toLowerCase(),
      rawDrugName.replace(/\s*\/\s*/g, ' ').toUpperCase(),
      rawDrugName.replace(/\s*\/\s*/g, '_slash_').toLowerCase(),
      rawDrugName.replace(/\s*\/\s*/g, '_slash_').toUpperCase(),
      rawDrugName.replace(/\s*\/\s*/g, '_slash_').replace(/ /g, ''),
      rawDrugName.replace(/\s*\/\s*/g, '_slash_').replace(/ /g, '').toLowerCase(),
      rawDrugName.replace(/\s*\/\s*/g, '_slash_').replace(/ /g, '').toUpperCase(),
      rawDrugName.replace(/ /g, ''),
      rawDrugName.replace(/ /g, '').toLowerCase(),
      rawDrugName.replace(/ /g, '').toUpperCase(),
      rawDrugName.replace(/_slash_/g, '/'),
      rawDrugName.replace(/_slash_/g, '/').toLowerCase(),
      rawDrugName.replace(/_slash_/g, '/').toUpperCase(),
      rawDrugName.replace(/_slash_/g, ' / '),
      rawDrugName.replace(/_slash_/g, ' / ').toLowerCase(),
      rawDrugName.replace(/_slash_/g, ' / ').toUpperCase(),
    ];
    const [drugName, setDrugName] = useState(rawDrugName);
    useEffect(() => {
      let found = false;
      const tryVariants = async () => {
        for (let variant of drugNameVariants) {
          try {
            const data = await getDrugDetails(variant);
            if (Array.isArray(data) && data.length > 0) {
              setDrugName(variant);
              found = true;
              break;
            }
          } catch (err) {
          }
        }
        if (!found) {
          setDrugName(rawDrugName); 
        }
      };
      tryVariants();
    }, [rawDrugName]);
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [details, setDetails] = useState([]);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isTranslationsLoading, setIsTranslationsLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteButtonText, setFavoriteButtonText] = useState(' Favorilere Ekle');
    const [sortBy, setSortBy] = useState('useful');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const getInitialData = async () => {
            setIsInitialLoading(true);
            setError(null);
            setDetails([]);
            try {
                const data = await getDrugDetails(drugName);
                const fetchedDetails = Array.isArray(data) ? data : [];
                if (fetchedDetails.length === 0) throw new Error(`'${drugName}' için hiç yorum bulunamadı.`);
                setDetails(fetchedDetails);
            } catch (err) {
                setError(err.response?.data?.detail || err.message || "Veriler yüklenirken bir hata oluştu.");
            } finally {
                setIsInitialLoading(false);
            }
        };
        getInitialData();
    }, [drugName]);

    useEffect(() => {
        if (details.length > 0) {
            const getAIData = async () => {
                setIsSummaryLoading(true);
                setIsTranslationsLoading(true);
                try {
                    const summaryPromise = fetchDrugSummary(drugName).then(res => setSummary(res.data.summary));
                    const visibleDetails = details.slice(0, 4);
                    const textsToTranslate = new Set();
                    visibleDetails.forEach(review => {
                        if (review.review) textsToTranslate.add(review.review);
                        if (review.condition) textsToTranslate.add(review.condition);
                    });
                    const uniqueTexts = Array.from(textsToTranslate);
                    
                    const translationPromise = uniqueTexts.length > 0 ? 
                        fetchBatchTranslations(uniqueTexts).then(res => {
                            const translatedTexts = res.data.translated_texts;
                            const translationMap = {};
                            uniqueTexts.forEach((text, i) => { translationMap[text] = translatedTexts[i]; });
                            setTranslations(translationMap);
                        }) : Promise.resolve();

                    await Promise.all([summaryPromise, translationPromise]);
                } catch (err) {
                    console.error("AI verileri alınırken hata:", err);
                    setSummary("Yorumlar özetlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
                } finally {
                    setIsSummaryLoading(false);
                    setIsTranslationsLoading(false);
                }
            };
            getAIData();
        }
    }, [details, drugName]);

    useEffect(() => {
        const checkFavoriteStatus = () => {
            if (user && user.favorites.some(fav => fav.drug_name.toLowerCase() === drugName.toLowerCase())) {
                setIsFavorited(true);
                setFavoriteButtonText('❤️ Favorilerde');
            } else {
                setIsFavorited(false);
                setFavoriteButtonText('🤍 Favorilere Ekle');
            }
        };
        checkFavoriteStatus();
    }, [user, drugName]);
    
    const sortedDetails = useMemo(() => {
        const sorted = [...details];
        if (sortBy === 'high') return sorted.sort((a, b) => b.rating - a.rating);
        if (sortBy === 'low') return sorted.sort((a, b) => a.rating - b.rating);
        return sorted.sort((a, b) => b.useful_count - a.useful_count);
    }, [details, sortBy]);

    const handleAddToFavorites = async () => {
        if (!user) {
            alert("Favorilere eklemek için lütfen giriş yapın.");
            navigate('/login');
            return;
        }
        if (isFavorited) return;
        setFavoriteButtonText('Ekleniyor...');
        try {
            await addFavoriteDrug(drugName);
            setIsFavorited(true);
            setFavoriteButtonText('❤️ Favorilerde');
        } catch(err) {
            console.error("Favorilere eklenemedi:", err);
            setFavoriteButtonText('Hata Oluştu');
            setIsFavorited(false);
        }
    };
    
    const getTranslation = (originalText) => {
        const translation = translations[originalText];
        if (translation && !translation.includes("[API hatası]") && !translation.includes("[çeviri hatası]")) {
            return translation;
        }
        return originalText;
    };
    
    if (isInitialLoading) return <div className="page-container" style={{ textAlign: 'center' }}><p>İlaç bilgileri yükleniyor...</p></div>;
    if (error) return <div className="page-container" style={{ textAlign: 'center' }}><h1 className="page-title">Hata</h1><p className="error-message">{error}</p><Link to="/">Ana Sayfaya Dön</Link></div>;

    return (
        <div className="page-container">
            <div className="drug-title-header">
                <h1>{drugName}</h1>
                <button onClick={handleAddToFavorites} disabled={isFavorited} className={`favorite-button ${isFavorited ? 'favorited' : ''}`}>
                    {favoriteButtonText}
                </button>
            </div>
            
            <div className="summary-section">
                <h2>Yapay Zeka Destekli Özet</h2>
                {isSummaryLoading ? (
                    <div className="summary-box-loading">
                        <div className="loading-spinner"></div>
                        <p>Yapay zeka ile özet hazırlanıyor...</p>
                    </div>
                ) : (
                    <div className="summary-box">
                        {summary ? (
                            <div dangerouslySetInnerHTML={{ 
                                __html: summary
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/•/g, '•')
                                    .replace(/\n/g, '<br>')
                            }} />
                        ) : (
                            <p>Bu ilaç için özet oluşturulamadı. Lütfen daha sonra tekrar deneyin.</p>
                        )}
                    </div>
                )}
            </div>
            
            <div className="drug-stats">
                <div className="stats-header">
                    <h3>📊 İstatistiksel Analiz</h3>
                    <p className="stats-subtitle">Bu ilaca ait kullanıcı verileri ve değerlendirme metrikleri</p>
                </div>
                
                <div className="stats-table">
                    <div className="stats-table-header">
                        <div className="stats-table-cell header-cell">Metrik</div>
                        <div className="stats-table-cell header-cell">Değer</div>
                        <div className="stats-table-cell header-cell">Açıklama</div>
                    </div>
                    
                    <div className="stats-table-row">
                        <div className="stats-table-cell metric-cell">
                            <span className="metric-icon">💬</span>
                            <span className="metric-name">Toplam Yorum</span>
                        </div>
                        <div className="stats-table-cell value-cell">
                            <span className="metric-value">{details.length}</span>
                            <span className="metric-unit">adet</span>
                        </div>
                        <div className="stats-table-cell description-cell">
                            Kullanıcılar tarafından yapılan toplam değerlendirme sayısı
                        </div>
                    </div>
                    
                    <div className="stats-table-row">
                        <div className="stats-table-cell metric-cell">
                            <span className="metric-icon">⭐</span>
                            <span className="metric-name">Ortalama Puan</span>
                        </div>
                        <div className="stats-table-cell value-cell">
                            <span className="metric-value">
                                {details.length > 0 ? (details.reduce((sum, d) => sum + d.rating, 0) / details.length).toFixed(1) : 'N/A'}
                            </span>
                            <span className="metric-unit">/10</span>
                        </div>
                        <div className="stats-table-cell description-cell">
                            Tüm kullanıcı puanlarının aritmetik ortalaması
                        </div>
                    </div>
                    
                    <div className="stats-table-row">
                        <div className="stats-table-cell metric-cell">
                            <span className="metric-icon">🔝</span>
                            <span className="metric-name">En Yüksek Puan</span>
                        </div>
                        <div className="stats-table-cell value-cell">
                            <span className="metric-value">
                                {details.length > 0 ? Math.max(...details.map(d => d.rating)) : 'N/A'}
                            </span>
                            <span className="metric-unit">/10</span>
                        </div>
                        <div className="stats-table-cell description-cell">
                            Kullanıcılar tarafından verilen en yüksek değerlendirme puanı
                        </div>
                    </div>
                    
                    <div className="stats-table-row">
                        <div className="stats-table-cell metric-cell">
                            <span className="metric-icon">🔻</span>
                            <span className="metric-name">En Düşük Puan</span>
                        </div>
                        <div className="stats-table-cell value-cell">
                            <span className="metric-value">
                                {details.length > 0 ? Math.min(...details.map(d => d.rating)) : 'N/A'}
                            </span>
                            <span className="metric-unit">/10</span>
                        </div>
                        <div className="stats-table-cell description-cell">
                            Kullanıcılar tarafından verilen en düşük değerlendirme puanı
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DrugDetailPage;