import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Bileşenleri ve Sayfaları Import Etme
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

// Global CSS
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <NavLink to="/" className="logo-link"><h1>💊 PharmAI</h1></NavLink>
          
          <div className="nav-wrapper">
            <nav>
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Ana Sayfa</NavLink>
              <NavLink to="/compare" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>İlaç Karşılaştır</NavLink>
              <NavLink to="/interaction" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Etkileşim Kontrol</NavLink>
              {user && <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Profilim</NavLink>}
            </nav>
            <SearchBar />
            <div className="auth-controls">
              {user ? (
                <button onClick={logout} className="disclaimer-button">Çıkış Yap</button>
              ) : (
                <>
                  <NavLink to="/login" className="nav-link">Giriş Yap</NavLink>
                  <NavLink to="/register" className="register-button">Kayıt Ol</NavLink>
                </>
              )}
            </div>
            <Link to="/yasal-uyari" className="disclaimer-button">Yasal Uyarı</Link>
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
              <div className="page-container" style={{ textAlign: 'center' }}>
                <h1 className="page-title">404 - Sayfa Bulunamadı</h1>
                <p>Aradığınız sayfa mevcut değil.</p>
                <NavLink to="/">Ana Sayfaya Dön</NavLink>
              </div>
            } />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>
            PharmAI © 2024 - Bu site tıbbi tavsiye niteliği taşımaz. 
            Detaylı bilgi için <Link to="/yasal-uyari" className="footer-link">Yasal Uyarı</Link> sayfamızı ziyaret ediniz.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;