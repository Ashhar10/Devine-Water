import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/utils/apiClient';
import config from '@/config';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in on mount
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Login function
    const login = useCallback(async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setIsAuthenticated(true);

            // Navigate based on role
            navigateByRole(userData.role);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.',
            };
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    }, [navigate]);

    // Navigate based on user role
    const navigateByRole = (role) => {
        switch (role) {
            case config.roles.CUSTOMER:
                navigate('/customer/dashboard');
                break;
            case config.roles.USER:
                navigate('/user/dashboard');
                break;
            case config.roles.ADMIN:
            case config.roles.SUPER_ADMIN:
                navigate('/admin/dashboard');
                break;
            default:
                navigate('/');
        }
    };

    // Check if user has required role
    const hasRole = useCallback((requiredRoles) => {
        if (!user) return false;
        if (typeof requiredRoles === 'string') {
            return user.role === requiredRoles;
        }
        return requiredRoles.includes(user.role);
    }, [user]);

    // Check if user can access admin features
    const isAdmin = useCallback(() => {
        return hasRole([config.roles.ADMIN, config.roles.SUPER_ADMIN]);
    }, [hasRole]);

    // Check if user can access activity logs
    const canAccessActivityLogs = useCallback(() => {
        return hasRole([config.roles.ADMIN, config.roles.SUPER_ADMIN]);
    }, [hasRole]);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        isAdmin,
        canAccessActivityLogs,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
