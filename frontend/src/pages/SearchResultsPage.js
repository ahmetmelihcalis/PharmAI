import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchByQuery } from '../services/api';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await searchByQuery(query);
                setResults(response.data);
            } catch (error) {
                console.error("Arama sonuçları alınamadı:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) return <div className="page-container"><p>Arama sonuçları yükleniyor...</p></div>;
    if (!results || (!results.direct_matches.length && !results.condition_matches.length)) {
        return (
            <div className="page-container" style={{textAlign: 'center'}}>
                <h2>"{query}" için sonuç bulunamadı</h2>
                <p>Lütfen arama teriminizi kontrol edip tekrar deneyin.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Arama Sonuçları: "{query}"</h1>
            
            {results.direct_matches.length > 0 && (
                <section className="drug-list-section">
                    <h2>İlaç Adı Eşleşmeleri</h2>
                    <ul className="search-result-list">
                        {results.direct_matches.map(drugName => (
                            <li key={drugName}>
                                <Link to={`/drug/${encodeURIComponent(drugName)}`}>{drugName}</Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {results.condition_matches.length > 0 && (
                <section className="drug-list-section">
                    <h2>Bu Durum İçin Kullanılan İlaçlar</h2>
                    <div className="drug-card-grid">
                        {results.condition_matches.map(drug => (
                            <Link to={`/drug/${encodeURIComponent(drug.drug_name)}`} className="drug-card" key={drug.drug_name}>
                                <h3>{drug.drug_name}</h3>
                                <div className="drug-card-rating">
                                    <span className="star">★</span>
                                    <strong>{drug.average_rating.toFixed(1)}</strong> / 10
                                </div>
                                <p>{drug.review_count} yoruma göre</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchResultsPage;