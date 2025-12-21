import { useAuth } from '@/hooks/useAuth';
import '../../customer/dashboard/CustomerDashboard.css';

export const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="container">
                    <h2 className="section-title">Welcome, Admin {user?.name}! 🎯</h2>

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
                                <p className="stat-label">Monthly Revenue</p>
                                <h3 className="stat-value">PKR 5.2M</h3>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-secondary)' }}>💧</div>
                            <div className="stat-content">
                                <p className="stat-label">Water Distributed</p>
                                <h3 className="stat-value">125K L</h3>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>⚠️</div>
                            <div className="stat-content">
                                <p className="stat-label">Active Complaints</p>
                                <h3 className="stat-value">23</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
