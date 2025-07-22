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

const DrugCard = ({ drug }) => {
    if (!drug || !drug.drug_name) return null;
    const rating = drug.average_rating ? drug.average_rating.toFixed(1) : 'N/A';
    let infoText = '';
    if (drug.total_useful !== undefined) {
        infoText = `${Math.round(drug.total_useful)} kullanıcı faydalı buldu`;
    } else if (drug.review_count) {
        infoText = `${drug.review_count} yoruma sahip`;
    }
    return (
        <Link to={`/drug/${drug.drug_name}`} className="drug-card">
            <h3>{drug.drug_name}</h3>
            <div className="drug-card-rating"><span className="star">★</span><strong>{rating}</strong> / 10</div>
            <p>{infoText}</p>
        </Link>
    );
};

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
    const navigate = useNavigate();

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
                    popular: results[0].status === 'fulfilled' ? results[0].value.data : [],
                    topRated: results[1].status === 'fulfilled' ? results[1].value.data : [],
                    mostReviewed: results[2].status === 'fulfilled' ? results[2].value.data : []
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
        if (searchTerm.trim() && fuse) {
            const results = fuse.search(searchTerm.trim());
            if (results.length > 0) {
                navigate(`/drug/${results[0].item}`);
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
                {currentList.map(drug => <DrugCard key={`${activeTab}-${drug.drug_name}`} drug={drug} />)}
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
                        <input type="text" placeholder="İlaç adı ara (örn: Lipitor)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <button type="submit">Ara</button>
                    </form>
                    {searchSuggestions.length > 0 && (
                        <ul className="search-suggestions">
                            {searchSuggestions.map(drug => (
                                <li key={drug} onMouseDown={() => navigate(`/drug/${drug}`)}>{drug}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="tabs-container">
                <button onClick={() => setActiveTab('popular')} className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}>En Popüler</button>
                <button onClick={() => setActiveTab('topRated')} className={`tab-button ${activeTab === 'topRated' ? 'active' : ''}`}>En Yüksek Puanlı</button>
                <button onClick={() => setActiveTab('mostReviewed')} className={`tab-button ${activeTab === 'mostReviewed' ? 'active' : ''}`}>En Çok Yorum Alan</button>
            </div>

            <section className="drug-list-section">
                {renderDrugGrid()}
            </section>
        </div>
    );
};
export default HomePage;