import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.getMe()
                .then(res => {
                    setUser(res.data);
                    connectSocket();
                })
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        connectSocket();
        return res.data.user;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        setUser(null);
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
