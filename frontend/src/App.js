import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import SearchBar from './components/SearchBar';
import HomePage from './pages/HomePage';
import DrugDetailPage from './pages/DrugDetailPage';
import ComparePage from './pages/ComparePage';
import InteractionPage from './pages/InteractionPage';
import ProfilePage from './pages/ProfilePage';
import DisclaimerPage from './pages/DisclaimerPage';
import SearchResultsPage from './pages/SearchResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="nav-wrapper" style={{justifyContent: 'space-between'}}>
            <div className="nav-left">
              <NavLink to="/" className="logo-link" style={{marginRight: '1.2rem'}}><h1>PharmAI</h1></NavLink>
              <NavLink to="/" className="home-link nav-link" title="Ana Sayfa">Ana Sayfa</NavLink>
            </div>
            <div className="nav-right">
              <nav>
                <NavLink to="/compare" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>İlaç Karşılaştır</NavLink>
                <NavLink to="/interaction" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Etkileşim Kontrol</NavLink>
                {user && <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Profilim</NavLink>}
              </nav>
              <div className="auth-controls">
                {user ? (
                  <button onClick={logout} className="register-button logout-button">Çıkış Yap</button>
                ) : (
                  <>
                    <NavLink to="/login" className="register-button login-button">Giriş Yap</NavLink>
                    <NavLink to="/register" className="register-button">Kayıt Ol</NavLink>
                  </>
                )}
              </div>
              <div className="navbar-search-area" style={{display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
                <SearchBar />
                <Link to="/yasal-uyari" className="disclaimer-red-button">Yasal Uyarı</Link>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/interaction" element={<InteractionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/drug/:drugName" element={<DrugDetailPage />} />
            <Route path="/yasal-uyari" element={<DisclaimerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={
              <div className="page-container" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="page-title">404 - Sayfa Bulunamadı</h1>
                <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#6c757d' }}>Aradığınız sayfa mevcut değil.</p>
                <NavLink 
                  to="/" 
                  style={{
                    background: 'linear-gradient(135deg, #D92B2B, #B52323)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(217, 43, 43, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(217, 43, 43, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(217, 43, 43, 0.3)';
                  }}
                >
                  Ana Sayfaya Dön
                </NavLink>
              </div>
            } />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-section">
              <div className="footer-brand">
                <h3>PharmAI</h3>
                <p>Yapay Zeka Destekli İlaç Rehberiniz.</p>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Hızlı Erişim</h4>
              <ul className="footer-links">
                <li><Link to="/">Ana Sayfa</Link></li>
                <li><Link to="/compare">İlaç Karşılaştır</Link></li>
                <li><Link to="/interaction">Etkileşim Kontrol</Link></li>
                {user && <li><Link to="/profile">Profilim</Link></li>}
              </ul>
            </div>
          </div>
          
          {/* Basit İstatistikler */}
          <div className="footer-stats">
            <div className="footer-stats-grid">
              <div className="footer-stat">
                
                <span className="footer-stat-text">1000+ İlaç</span>
              </div>
              <div className="footer-stat">
                
                <span className="footer-stat-text">30.000+ Yorum</span>
              </div>
              <div className="footer-stat">
                
                <span className="footer-stat-text">100.000+ Değerlendirme</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>
                <strong>PharmAI © 2025</strong> - Bu platform tıbbi tavsiye niteliği taşımaz. 
                İlaç kullanımı konusunda mutlaka doktorunuza danışınız.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;