import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    fetchDrugDetails, 
    fetchDrugSummary, 
    addFavoriteDrug, 
    fetchBatchTranslations, 
} from '../services/api';

const DrugDetailPage = () => {
    const { drugName } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [details, setDetails] = useState([]);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isTranslationsLoading, setIsTranslationsLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteButtonText, setFavoriteButtonText] = useState('🤍 Favorilere Ekle');
    const [sortBy, setSortBy] = useState('useful');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const getInitialData = async () => {
            setIsInitialLoading(true);
            setError(null);
            setDetails([]);
            try {
                const detailsResponse = await fetchDrugDetails(drugName);
                const fetchedDetails = Array.isArray(detailsResponse.data) ? detailsResponse.data : [];
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
            
            <h2>Yapay Zeka Destekli Türkçe Özet</h2>
            {isSummaryLoading ? (
                <div className="summary-box-loading">Özet oluşturuluyor...</div>
            ) : (
                <pre className="summary-box">{summary || "Bu ilaç için bir özet oluşturulamadı."}</pre>
            )}
            
            <div className="reviews-header">
                <h2>Kullanıcı Yorumları</h2>
                <div className="sort-buttons">
                    <span>Sırala:</span>
                    <button onClick={() => setSortBy('useful')} className={sortBy === 'useful' ? 'active' : ''}>En Faydalı</button>
                    <button onClick={() => setSortBy('high')} className={sortBy === 'high' ? 'active' : ''}>En Yüksek Puan</button>
                    <button onClick={() => setSortBy('low')} className={sortBy === 'low' ? 'active' : ''}>En Düşük Puan</button>
                </div>
            </div>
            <div className="reviews-container">
                {sortedDetails.slice(0, 4).map((review) => (
                    <div key={review.uniqueID} className="review-card">
                        <p><strong>Puan:</strong> {review.rating}/10 | <strong>Faydalı Bulanlar:</strong> {review.useful_count}</p>
                        <p><strong>Kullanım Sebebi:</strong> {isTranslationsLoading ? '...' : getTranslation(review.condition)}</p>
                        <blockquote>"{isTranslationsLoading ? 'Çevriliyor...' : getTranslation(review.review)}"</blockquote>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default DrugDetailPage;