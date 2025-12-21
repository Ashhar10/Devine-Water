// Application Configuration
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    appName: import.meta.env.VITE_APP_NAME || 'Devine Water',

    // Roles
    roles: {
        CUSTOMER: 'CUSTOMER',
        USER: 'USER',
        ADMIN: 'ADMIN',
        SUPER_ADMIN: 'SUPER_ADMIN',
    },

    // Pagination
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],

    // Date formats
    dateFormat: 'MMM dd, yyyy',
    dateTimeFormat: 'MMM dd, yyyy HH:mm',

    // Chart colors
    chartColors: {
        primary: '#0066cc',
        secondary: '#00bfff',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
    },

    // File upload
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
};

export default config;
