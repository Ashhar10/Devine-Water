import { useAuth } from '@/hooks/useAuth';
import '../../customer/dashboard/CustomerDashboard.css';

export const UserDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">User Dashboard</h1>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="container">
                    <h2 className="section-title">Welcome, {user?.name}! 👤</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                        You have limited admin access. You can view and manage customers, billing, and complaints.
                    </p>

                    <div className="stats-grid">
                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>👥</div>
                            <div className="stat-content">
                                <p className="stat-label">Total Customers</p>
                                <h3 className="stat-value">1,234</h3>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>💰</div>
                            <div className="stat-content">
                                <p className="stat-label">Pending Payments</p>
                                <h3 className="stat-value">156</h3>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>⚠️</div>
                            <div className="stat-content">
                                <p className="stat-label">Open Complaints</p>
                                <h3 className="stat-value">23</h3>
                            </div>
                        </div>
                    </div>

                    <div className="card-glass" style={{ padding: 'var(--spacing-xl)', marginTop: 'var(--spacing-2xl)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>⚠️ Limited Access</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                            As a USER, you do not have access to:
                        </p>
                        <ul style={{ color: 'var(--color-text-secondary)', paddingLeft: 'var(--spacing-xl)' }}>
                            <li>Activity Logs</li>
                            <li>User Management</li>
                            <li>System Settings</li>
                            <li>Infrastructure Management</li>
                            <li>Advanced Analytics</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};
