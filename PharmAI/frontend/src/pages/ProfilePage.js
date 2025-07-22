import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, logout } = useAuth();

    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Profilim</h1>
            <p className="page-description">Hoş geldin, <strong>{user.email}</strong></p>

            <div className="profile-content">
                <div className="favorites-section">
                    <h2>Favori İlaçların</h2>
                    {user.favorites && user.favorites.length > 0 ? (
                        <ul className="search-result-list">
                            {user.favorites.map(fav => (
                                <li key={fav.id}>
                                    <Link to={`/drug/${fav.drug_name}`}>{fav.drug_name}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Henüz favori ilacınız bulunmuyor. İlaç detay sayfalarından favorilerinize ekleyebilirsiniz.</p>
                    )}
                </div>
                <button onClick={logout} className="logout-button">Oturumu Kapat</button>
            </div>
        </div>
    );
};

export default ProfilePage;