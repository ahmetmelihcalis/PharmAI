import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        try {
            await register(email, password);
            navigate('/login'); // Başarılı kayıt sonrası giriş sayfasına yönlendir
        } catch (err) {
            setError(err.response?.data?.detail || 'Kayıt başarısız.');
        }
    };

    return (
        <div className="page-container auth-page">
            <div className="auth-form-container">
                <h1 className="page-title">Kayıt Ol</h1>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Kayıt Ol</button>
                </form>
                <p>Zaten bir hesabın var mı? <Link to="/login">Giriş Yap</Link></p>
            </div>
        </div>
    );
};
export default RegisterPage;