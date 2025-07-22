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