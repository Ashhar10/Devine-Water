import { format, parseISO, isValid } from 'date-fns';

// Format currency
export const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-PK').format(num);
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
};

// Format date and time
export const formatDateTime = (date) => {
    return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Format water consumption (in liters)
export const formatWaterConsumption = (liters) => {
    if (liters >= 1000) {
        return `${(liters / 1000).toFixed(2)} m³`;
    }
    return `${liters.toFixed(2)} L`;
};

// Truncate text
export const truncate = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Generate random color
export const generateColor = (seed) => {
    const colors = [
        '#0066cc', '#00bfff', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'
    ];
    const index = seed ? seed.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length);
    return colors[index];
};
