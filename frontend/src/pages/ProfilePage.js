import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ProfilePage.css';

// Alt bileşenler
const ProfileAvatar = ({ email }) => {
  const getInitials = useCallback((email) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  }, []);

  return (
    <div className="profile-avatar">
      <span className="avatar-icon" aria-label="Kullanıcı profil resmi">
        {getInitials(email)}
      </span>
    </div>
  );
};

ProfileAvatar.propTypes = {
  email: PropTypes.string
};

const StatCard = ({ icon, title, value, description }) => (
  <div className="stat-card">
    <div className="stat-icon" aria-hidden="true">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{title}</p>
      {description && <small>{description}</small>}
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string
};

const FavoriteCard = ({ favorite, onRemove }) => (
  <div className="favorite-card">
    <div className="favorite-icon" aria-hidden="true">💊</div>
    <div className="favorite-info">
      <h3>{favorite.drug_name}</h3>
      <p>Eklenme: {new Date(favorite.created_at || Date.now()).toLocaleDateString('tr-TR')}</p>
      {favorite.description && <small>{favorite.description}</small>}
    </div>
    <div className="favorite-actions">
      <Link 
        to={`/drug/${encodeURIComponent(favorite.drug_name)}`} 
        className="favorite-link primary"
        aria-label={`${favorite.drug_name} detaylarını görüntüle`}
      >
        Detayları Gör
      </Link>
      {onRemove && (
        <button 
          onClick={() => onRemove(favorite.id)}
          className="favorite-link danger"
          aria-label={`${favorite.drug_name} favorilerden çıkar`}
          title="Favorilerden çıkar"
        >
          ❌
        </button>
      )}
    </div>
  </div>
);

FavoriteCard.propTypes = {
  favorite: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    drug_name: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  onRemove: PropTypes.func
};

const EmptyFavorites = () => (
  <div className="empty-favorites">
    <div className="empty-icon" aria-hidden="true">💔</div>
    <h3>Henüz favori ilaç yok</h3>
    <p>İlaç detay sayfalarından favorilerinize ekleyebilirsiniz.</p>
    <Link to="/" className="browse-drugs-btn">
      🔍 İlaçlara Göz At
    </Link>
  </div>
);

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="logout-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-header">
          <h3>🚪 Çıkış Yap</h3>
          <button 
            onClick={onClose}
            className="modal-close"
            aria-label="Modalı kapat"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p>Hesabınızdan çıkış yapmak istediğinizden emin misiniz?</p>
          <small>Bu işlem sonrasında tekrar giriş yapmanız gerekecek.</small>
        </div>
        <div className="modal-actions">
          <button 
            onClick={onClose}
            className="modal-btn cancel"
            disabled={isLoading}
          >
            İptal
          </button>
          <button 
            onClick={onConfirm}
            className="modal-btn confirm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Çıkış yapılıyor...
              </>
            ) : (
              'Çıkış Yap'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

// Ana bileşen
const ProfilePage = () => {
  const { user, logout, removeFavorite } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || user?.email?.split('@')[0] || '');
  const [isSavingName, setIsSavingName] = useState(false);
  
  // Yeni state'ler
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'tr',
    notifications: {
      email: true,
      marketing: false
    },
    preferences: {
      autoSave: true,
      compactView: false
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const exportData = () => {
    const data = {
      user: user,
      settings: settings,
      exportDate: new Date().toISOString(),
      favorites: user?.favorites || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmai-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tarih formatlama fonksiyonu
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Bilinmiyor';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Tarih formatlanırken hata:', error);
      return 'Geçersiz tarih';
    }
  }, []);

  // Çıkış işlemi
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (err) {
      console.error('Çıkış hatası:', err);
      setError('Çıkış yaparken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Favori kaldırma işlemi
  const handleRemoveFavorite = useCallback(async (favoriteId) => {
    if (!removeFavorite) return;
    
    try {
      await removeFavorite(favoriteId);
    } catch (err) {
      console.error('Favori kaldırma hatası:', err);
      setError('Favori kaldırılırken bir hata oluştu.');
    }
  }, [removeFavorite]);

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  // İsim güncelleme fonksiyonunu düzeltiyoruz
  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setError('İsim boş olamaz');
      return;
    }

    setIsSavingName(true);
    setError(null);

    try {
      // Burada gerçek API çağrısı yerine sadece local state'i güncelliyoruz
      // Eğer API'de updateUserDisplayName fonksiyonu yoksa, bu işlemi AuthContext üzerinden yapabilirsiniz
      console.log('Yeni ad kaydedildi:', displayName);
      setIsEditingName(false);
      
      // Başarı mesajı (isteğe bağlı)
      // setSuccessMessage('İsim başarıyla güncellendi!');
    } catch (err) {
      console.error('İsim güncelleme hatası:', err);
      setError('İsim güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSavingName(false);
    }
  };

  const stats = useMemo(() => {
    if (!user) return []; // Kullanıcı yoksa boş dizi döndür

    const favoritesCount = user.favorites?.length || 0;
    const membershipDays = user.created_at 
      ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      : 0;

    return [
      {
        icon: '💊',
        title: 'Favori İlaç',
        value: favoritesCount,
        description: favoritesCount > 0 ? `${favoritesCount} ilaç favorilerinizde` : 'Henüz favori yok'
      },
      {
        icon: '✅',
        title: 'Hesap Durumu',
        value: 'Aktif',
        description: 'Tüm özellikler kullanılabilir'
      },
      {
        icon: '📅',
        title: 'Üyelik Süresi',
        value: `${membershipDays} gün`,
        description: `Katılım: ${formatDate(user.created_at)}`
      },
    ];
  }, [user, formatDate]);

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Hata Mesajı */}
        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={() => setError(null)} aria-label="Hata mesajını kapat">×</button>
          </div>
        )}

        {/* Profil Karşılama Kartı */}
        <div className="profile-header">
          <ProfileAvatar email={user.email} />
          <div className="profile-info">
            <h1>{displayName}</h1>
            <p className="user-email">{user.email}</p>
            <div className="profile-badges">
              <span className="user-badge">Aktif Kullanıcı</span>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="profile-stats">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Sekme Navigasyonu */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Hesap Ayarları
          </button>
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Veri Yönetimi
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorilerim
          </button>
        </div>

        {/* Sekme İçerikleri */}
        <div className="tab-content">
          {activeTab === 'account' && (
            <div className="account-settings-card">
              <h2>Hesap Bilgileri</h2>
              <div className="setting-item">
                <label htmlFor="displayName">Görünen Ad</label>
                {isEditingName ? (
                  <div className="edit-name-container">
                    <input 
                      type="text" 
                      id="displayName" 
                      value={displayName} 
                      onChange={handleNameChange} 
                      className="name-input"
                      placeholder="Adınızı girin"
                      disabled={isSavingName}
                    />
                    <button 
                      onClick={handleSaveName} 
                      className="save-btn"
                      disabled={isSavingName || !displayName.trim()}
                    >
                      {isSavingName ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)} 
                      className="cancel-btn"
                      disabled={isSavingName}
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <div className="display-name-container">
                    <span>{displayName}</span>
                    <button onClick={() => setIsEditingName(true)} className="edit-btn">Düzenle</button>
                  </div>
                )}
              </div>
              <div className="setting-item">
                <label>E-posta Adresi</label>
                <div className="display-email-container">
                  <span>{user.email}</span>
                  {/* <span className="verified-badge">Doğrulanmış</span> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-management-card">
              <h2>Veri Yönetimi</h2>
              <div className="setting-group">
                <h3>Veri Dışa Aktarma</h3>
                <p className="setting-description">
                  Tüm verilerinizi JSON formatında indirebilirsiniz. Bu dosya favori ilaçlarınızı, 
                  ayarlarınızı ve profil bilgilerinizi içerir.
                </p>
                <button onClick={exportData} className="export-btn">
                  Verilerimi İndir
                </button>
              </div>
              <div className="setting-group">
                <h3>Otomatik Kaydetme</h3>
                <div className="toggle-item">
                  <label>Otomatik Kaydetme</label>
                  <input 
                    type="checkbox"
                    checked={settings.preferences.autoSave}
                    onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
                  />
                  <span className="toggle-description">Değişiklikleri otomatik olarak kaydet</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section">
              <div className="section-header">
                <h2>Favori İlaçlarım</h2>
                <span className="favorites-count">{user.favorites?.length || 0} İlaç</span>
              </div>
              {user.favorites && user.favorites.length > 0 ? (
                <div className="favorites-grid">
                  {user.favorites.map(favorite => (
                    <FavoriteCard 
                      key={favorite.id} 
                      favorite={favorite}
                      onRemove={removeFavorite ? handleRemoveFavorite : null}
                    />
                  ))}
                </div>
              ) : (
                <EmptyFavorites />
              )}
            </div>
          )}
        </div>

        {/* Çıkış Butonu */}
        <div className="logout-btn-container">
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="logout-btn"
              disabled={isLoggingOut}
            >
              Güvenli Çıkış Yap
            </button>
        </div>
      </div>

      {/* Çıkış Onay Modalı */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
};

export default ProfilePage;