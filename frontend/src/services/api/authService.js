import apiClient from '@/services/utils/apiClient';

export const authService = {
    // Login
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        const response = await apiClient.post('/auth/reset-password', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/reset-password/confirm', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    // Verify token
    verifyToken: async () => {
        const response = await apiClient.get('/auth/verify');
        return response.data;
    },
};
