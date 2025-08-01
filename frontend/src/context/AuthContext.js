import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken, loginUser, registerUser, getCurrentUser } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            getCurrentUser()
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setAuthToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await loginUser(email, password);
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setAuthToken(access_token);
        const userResponse = await getCurrentUser();
        setUser(userResponse.data);
    };

    const register = async (email, password) => {
        await registerUser(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    const value = { user, loading, login, register, logout };

    if (loading) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Oturum kontrol ediliyor...</div>
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider> 
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};