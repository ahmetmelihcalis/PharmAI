import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    fetchPopularDrugs, 
    fetchTopRatedDrugs, 
    fetchMostReviewedDrugs, 
    fetchDrugs 
} from '../services/api';
import Fuse from 'fuse.js';
import './HomePage.css';

const HEALTH_TIPS = [
    { icon: '💡', tip: 'İlaçlarınızı her gün aynı saatte alın', category: 'Kullanım' },
    { icon: '🚰', tip: 'İlaçları bol su ile alın', category: 'Güvenlik' },
    { icon: '🍎', tip: 'Bazı ilaçlar yemekle birlikte alınmalıdır', category: 'Beslenme' },
    { icon: '☀️', tip: 'Güneş ışığına duyarlılığı olan ilaçları sakın', category: 'Saklama' },
    { icon: '👨‍⚕️', tip: 'Dozaj değişikliği için doktorunuza danışın', category: 'Dozaj' }
];

const DrugCard = ({ drug, isHighlighted = false }) => {
    if (!drug || !drug.drug_name) return null;
    const rating = drug.average_rating ? drug.average_rating.toFixed(1) : 'N/A';
    let infoText = '';
    if (drug.total_useful !== undefined) {
        infoText = `${Math.round(drug.total_useful)} kullanıcı faydalı buldu`;
    } else if (drug.review_count) {
        infoText = `${drug.review_count} yoruma sahip`;
    }
    
    return (
        <Link 
            to={`/drug/${encodeURIComponent(drug.drug_name)}`} 
            className={`drug-card ${isHighlighted ? 'highlighted' : ''}`}
        >
            <div className="drug-card-header">
                <h3>{drug.drug_name}</h3>
                {isHighlighted && <span className="highlight-badge">🔥 Popüler</span>}
            </div>
            <div className="drug-card-rating">
                <span className="star">★</span>
                <strong>{rating}</strong>
                <span className="rating-max">/10</span>
            </div>
            <p className="drug-info">{infoText}</p>
            <div className="drug-card-footer">
                <span className="view-details">Detayları Gör →</span>
            </div>
        </Link>
    );
};

const HealthTip = ({ tip }) => (
    <div className="health-tip">
        <span className="tip-icon">{tip.icon}</span>
        <div className="tip-content">
            <p>{tip.tip}</p>
            <span className="tip-category">{tip.category}</span>
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-rating"></div>
        <div className="skeleton-text skeleton-info"></div>
    </div>
);

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('popular');
    const [drugLists, setDrugLists] = useState({ popular: [], topRated: [], mostReviewed: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [fuse, setFuse] = useState(null);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await Promise.allSettled([
                    fetchPopularDrugs(),
                    fetchTopRatedDrugs(),
                    fetchMostReviewedDrugs(),
                    fetchDrugs()
                ]);

                setDrugLists({
                    popular: results[0].status === 'fulfilled' ? results[0].value.data.filter(drug => !drug.drug_name.includes('/')) : [],
                    topRated: results[1].status === 'fulfilled' ? results[1].value.data.filter(drug => !drug.drug_name.includes('/')) : [],
                    mostReviewed: results[2].status === 'fulfilled' ? results[2].value.data.filter(drug => !drug.drug_name.includes('/')) : []
                });
                
                if (results[3].status === 'fulfilled' && Array.isArray(results[3].value.data.drugs)) {
                    const drugList = results[3].value.data.drugs;
                    setFuse(new Fuse(drugList, { includeScore: true, threshold: 0.4 }));
                }

            } catch (err) {
                setError("İlaç verileri yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const searchSuggestions = useMemo(() => {
        if (!searchTerm || !fuse) return [];
        const results = fuse.search(searchTerm);
        return results.slice(0, 5).map(result => result.item);
    }, [searchTerm, fuse]);

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch(searchTerm.trim());
    };

    const performSearch = (query) => {
        if (query && fuse) {
            const results = fuse.search(query);
            if (results.length > 0 && results[0].item && results[0].item.drug_name) {
                navigate(`/drug/${encodeURIComponent(results[0].item.drug_name)}`);
            } else {
                alert("Aramanızla eşleşen bir ilaç bulunamadı.");
            }
        }
    };

    const renderDrugGrid = () => {
        if (loading) {
            return (
                <div className="drug-card-grid">
                    {Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
            );
        }
        if (error) return <p className="error-message">{error}</p>;
        const currentList = drugLists[activeTab];
        if (!currentList || currentList.length === 0) return <p>Bu kategoride gösterilecek ilaç bulunamadı.</p>;
        
        return (
            <div className="drug-card-grid">
                {currentList.map((drug, index) => (
                    <DrugCard 
                        key={`${activeTab}-${drug.drug_name}`} 
                        drug={drug} 
                        isHighlighted={index < 3}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="hero-section">
                <h1 className="page-title">Yapay Zeka Destekli İlaç Rehberiniz</h1>
                <p className="page-description">
                    Kullanıcı yorumlarından elde edilen özetler, karşılaştırmalar ve etkileşim analizleri ile sağlığınız hakkında daha bilinçli kararlar alın.
                </p>
                <div className="search-container">
                    <form onSubmit={handleSearch} className="hero-search-form">
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="İlaç adı ara (örn: Lipitor)" 
                                value={searchTerm} 
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setSearchTerm(newValue);
                                }}
                                autoComplete="off"
                                spellCheck="false"
                            />
                            <button type="submit">
                                <span className="search-icon">🔍</span>
                            </button>
                        </div>
                        {searchSuggestions.length > 0 && (
                            <div className="search-suggestions-container">
                                <ul className="search-suggestions">
                                    {searchSuggestions.map(drug => (
                                        <li key={drug} onMouseDown={() => navigate(`/drug/${encodeURIComponent(drug)}`)}>
                                            {drug}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </form>
                    {searchSuggestions.length > 0 && (
                        <ul className="search-suggestions">
                            {searchSuggestions.map(drug => (
                                <li key={drug} onMouseDown={() => navigate(`/drug/${encodeURIComponent(drug)}`)}>
                                    {drug}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="filter-tabs">
                <div className="filter-tab-wrapper">
                    <button 
                        onClick={() => setActiveTab('popular')} 
                        className={`filter-tab ${activeTab === 'popular' ? 'active' : ''}`}
                    >
                        <span className="tab-text">En Popüler</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('topRated')} 
                        className={`filter-tab ${activeTab === 'topRated' ? 'active' : ''}`}
                    >
                        <span className="tab-text">En Yüksek Puanlı</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('mostReviewed')} 
                        className={`filter-tab ${activeTab === 'mostReviewed' ? 'active' : ''}`}
                    >
                        <span className="tab-text">En Çok Yorum Alan</span>
                    </button>
                </div>
            </div>

            <section className="drug-list-section">
                {renderDrugGrid()}
            </section>
        </div>
    );
};

export default HomePage;