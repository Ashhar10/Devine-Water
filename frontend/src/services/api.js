import axios from 'axios';

// API URL - always use absolute URL for Render backend in production
const API_URL = import.meta.env.MODE === 'production'
    ? 'https://devine-water.onrender.com/api'
    : '/api';

console.log('🔧 API_URL:', API_URL, 'MODE:', import.meta.env.MODE);

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
};

// Users
export const userAPI = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

// Orders
export const orderAPI = {
    getAll: () => api.get('/orders'),
    create: (data) => api.post('/orders', data),
    update: (id, data) => api.put(`/orders/${id}`, data),
    assign: (id, supplierId) => api.put(`/orders/${id}/assign`, { supplierId }),
    cancel: (id) => api.delete(`/orders/${id}`)
};

// Finance
export const financeAPI = {
    getIncoming: (params) => api.get('/finance/incoming', { params }),
    addIncoming: (data) => api.post('/finance/incoming', data),
    getOutgoing: (params) => api.get('/finance/outgoing', { params }),
    addExpense: (data) => api.post('/finance/outgoing', data),
    getReports: (params) => api.get('/finance/reports', { params })
};

// Deliveries
export const deliveryAPI = {
    getAll: () => api.get('/deliveries'),
    updateStatus: (id, status) => api.put(`/deliveries/${id}/status`, { status })
};

// Routes
export const routeAPI = {
    getAll: () => api.get('/routes'),
    create: (data) => api.post('/routes', data),
    update: (id, data) => api.put(`/routes/${id}`, data),
    getByDate: (date) => api.get(`/routes/date/${date}`)
};

// Shop Sales
export const shopSaleAPI = {
    getAll: () => api.get('/shop-sales'),
    create: (data) => api.post('/shop-sales', data),
    getDailySales: () => api.get('/shop-sales/daily')
};

// Activity Logs
export const logAPI = {
    getAll: (params) => api.get('/logs', { params }),
    getUserActivity: (id) => api.get(`/logs/user/${id}`)
};

//Dashboards
export const dashboardAPI = {
    getAdmin: () => api.get('/dashboard/admin'),
    getCustomer: () => api.get('/dashboard/customer'),
    getSupplier: () => api.get('/dashboard/supplier')
};

export default api;
