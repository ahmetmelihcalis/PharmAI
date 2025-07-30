import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.detail || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-section">
                <div className="login-form-container">
                    <div className="login-form-header">
                        <h2>Giriş Yap</h2>
                        
                        <p>Hesabınıza erişmek için giriş yapınız.</p>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
                        )}
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-input"
                                placeholder="E-posta Adresiniz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Şifreniz"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
                        </button>
                    </form>
                    <div className="login-form-footer">
                        <p>
                            Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;