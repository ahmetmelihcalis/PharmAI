// frontend/src/components/SearchBar.js (YENİ DOSYA)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Kullanıcıyı arama sonuçları sayfasına yönlendir
            navigate(`/search?q=${searchTerm.trim()}`);
            setSearchTerm(''); // Arama yaptıktan sonra kutuyu temizle
        }
    };

    return (
        <form onSubmit={handleSearch} className="header-search-form">
            <span className="search-icon" style={{display: 'flex', alignItems: 'center', marginLeft: '10px', marginRight: '6px'}}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="7" stroke="#B52323" strokeWidth="2" />
                  <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#B52323" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </span>
            <input
                type="text"
                placeholder="İlaç veya durum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Ara</button>
        </form>
    );
};

export default SearchBar;