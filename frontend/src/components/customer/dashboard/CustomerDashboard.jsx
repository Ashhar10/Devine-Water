import { useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeContext } from '@/context/ThemeContext';
import './CustomerDashboard.css';

export const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useContext(ThemeContext);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header glass">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">Devine Water</h1>
                    <div className="dashboard-header-actions">
                        <button onClick={toggleTheme} className="btn btn-glass" aria-label="Toggle theme">
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        <div className="user-menu">
                            <span className="user-name">{user?.name || user?.email}</span>
                            <button onClick={logout} className="btn btn-secondary">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    <div className="welcome-section">
                        <h2 className="section-title">Welcome, {user?.name || 'Customer'}! 👋</h2>
                        <p className="section-subtitle">Here's your water usage overview</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                                💧
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Current Usage</p>
                                <h3 className="stat-value">1,245 L</h3>
                                <span className="badge badge-info">This Month</span>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                                💵
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Current Bill</p>
                                <h3 className="stat-value">PKR 2,450</h3>
                                <span className="badge badge-warning">Pending</span>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
                                📊
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Avg. Daily Usage</p>
                                <h3 className="stat-value">42 L</h3>
                                <span className="badge badge-success">-5% vs last month</span>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
                                🎯
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Connection Status</p>
                                <h3 className="stat-value">Active</h3>
                                <span className="badge badge-success">Connected</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="section">
                        <h3 className="section-title">Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <button className="action-btn card-glass">
                                <div className="action-icon">💳</div>
                                <div>
                                    <h4>Pay Bill</h4>
                                    <p>Pay your current bill</p>
                                </div>
                            </button>
                            <button className="action-btn card-glass">
                                <div className="action-icon">📈</div>
                                <div>
                                    <h4>View Usage</h4>
                                    <p>Check consumption history</p>
                                </div>
                            </button>
                            <button className="action-btn card-glass">
                                <div className="action-icon">⚠️</div>
                                <div>
                                    <h4>Report Issue</h4>
                                    <p>Submit a complaint</p>
                                </div>
                            </button>
                            <button className="action-btn card-glass">
                                <div className="action-icon">📄</div>
                                <div>
                                    <h4>Download Bills</h4>
                                    <p>Get invoice history</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
