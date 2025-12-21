// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone validation (Pakistani format)
export const isValidPhone = (phone) => {
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password strength validation
export const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(password);
};

// CNIC validation (Pakistani national ID)
export const isValidCNIC = (cnic) => {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
    return cnicRegex.test(cnic);
};

// Required field validation
export const isRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

// Min length validation
export const minLength = (value, min) => {
    return value && value.length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
    return value && value.length <= max;
};

// Number range validation
export const isInRange = (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
};

// Form validation helper
export const validateForm = (values, rules) => {
    const errors = {};

    Object.keys(rules).forEach((field) => {
        const fieldRules = rules[field];
        const value = values[field];

        if (fieldRules.required && !isRequired(value)) {
            errors[field] = fieldRules.requiredMessage || 'This field is required';
        } else if (fieldRules.email && !isValidEmail(value)) {
            errors[field] = 'Please enter a valid email address';
        } else if (fieldRules.phone && !isValidPhone(value)) {
            errors[field] = 'Please enter a valid phone number';
        } else if (fieldRules.minLength && !minLength(value, fieldRules.minLength)) {
            errors[field] = `Minimum length is ${fieldRules.minLength} characters`;
        } else if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength)) {
            errors[field] = `Maximum length is ${fieldRules.maxLength} characters`;
        } else if (fieldRules.custom && !fieldRules.custom(value)) {
            errors[field] = fieldRules.customMessage || 'Invalid value';
        }
    });

    return errors;
};
