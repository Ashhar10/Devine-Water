import axios from 'axios';
import config from '@/config';

// Create axios instance
const apiClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (requestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            if (error.response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (error.response.status === 403) {
                // Forbidden - insufficient permissions
                console.error('Access denied:', error.response.data.message);
            } else if (error.response.status === 500) {
                // Server error
                console.error('Server error:', error.response.data.message);
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error: No response from server');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
