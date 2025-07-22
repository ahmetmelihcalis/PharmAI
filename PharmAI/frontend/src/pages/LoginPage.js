import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/profile'); // Başarılı giriş sonrası profile yönlendir
        } catch (err) {
            setError(err.response?.data?.detail || 'Giriş yapılamadı.');
        }
    };

    return (
        <div className="page-container auth-page">
            <div className="auth-form-container">
                <h1 className="page-title">Giriş Yap</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Giriş Yap</button>
                </form>
                <p>Hesabın yok mu? <Link to="/register">Kayıt Ol</Link></p>
            </div>
        </div>
    );
};
export default LoginPage;