import '../../customer/dashboard/CustomerDashboard.css';

export const ActivityLogs = () => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header glass">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">Activity Logs 🔒</h1>
                </div>
            </header>
            <main className="dashboard-main">
                <div className="container">
                    <div className="card-glass" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>🔐</div>
                        <h3>Admin-Only Feature</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Activity logs are only accessible to Admin and Super Admin roles.
                            This ensures secure audit trails and compliance monitoring.
                        </p>
                        <div style={{ marginTop: 'var(--spacing-xl)' }}>
                            <span className="badge badge-info">Secure Access</span>
                            <span className="badge badge-success">Compliance Ready</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
