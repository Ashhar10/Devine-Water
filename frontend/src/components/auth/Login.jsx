import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validators';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';

export const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        const result = await login(formData);
        setLoading(false);

        if (!result.success) {
            toast.error(result.message);
        } else {
            toast.success('Login successful!');
        }
    };

    return (
        <div className="login-container">
            <Toaster position="top-center" />

            {/* Animated Background */}
            <div className="login-bg">
                <div className="login-bg-sphere login-bg-sphere-1"></div>
                <div className="login-bg-sphere login-bg-sphere-2"></div>
                <div className="login-bg-sphere login-bg-sphere-3"></div>
            </div>

            {/* Login Card */}
            <div className="login-card glass-strong animate-fade-in">
                {/* Logo & Title */}
                <div className="login-header">
                    <div className="login-logo">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="url(#water-gradient)" />
                            <defs>
                                <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0066cc" />
                                    <stop offset="100%" stopColor="#00bfff" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="login-title">Devine Water</h1>
                    <p className="login-subtitle">Water Management System</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`input input-glass ${errors.email ? 'input-error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`input input-glass ${errors.password ? 'input-error' : ''}`}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-footer">
                        <a href="/reset-password" className="link-primary">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-login"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <p className="demo-title">Demo Credentials:</p>
                    <div className="demo-items">
                        <div className="demo-item">
                            <strong>Admin:</strong> admin@devinewater.com / admin123
                        </div>
                        <div className="demo-item">
                            <strong>User:</strong> user@devinewater.com / user123
                        </div>
                        <div className="demo-item">
                            <strong>Customer:</strong> customer@devinewater.com / customer123
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
