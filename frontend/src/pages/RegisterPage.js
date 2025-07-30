import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css'; 

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return false;
        }
        if (!email.includes('@')) {
            setError('Geçerli bir e-posta adresi girin.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        
        try {
            await register(email, password);
            setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-form-section">
                <div className="register-form-container">
                    <div className="register-form-header">
                        <h2>Hesap Oluştur</h2>
                        <p>Favori ilaçlarınızı ve bilgilerinizi kaydetmek, verilerinize ulaşmak ve fazlası için PharmAI'a kaydolun.</p>
                    </div>
                    <form className="register-form" onSubmit={handleSubmit}>
                        {error && <p style={{ color: '#D92B2B', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                        {success && <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}
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
                                placeholder="Şifreniz (en az 6 karakter)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Şifrenizi Tekrar Girin"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="register-btn" disabled={isLoading}>
                            {isLoading ? 'KAYIT OLUNUYOR...' : 'KAYIT OL'}
                        </button>
                    </form>
                    <div className="register-form-footer">
                        <p>Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;