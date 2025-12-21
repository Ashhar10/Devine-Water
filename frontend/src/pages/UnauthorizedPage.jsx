export const UnauthorizedPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-background)',
            padding: 'var(--spacing-xl)',
        }}>
            <div className="card-glass" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🚫</div>
                <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Access Denied</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <button className="btn btn-primary" onClick={() => window.history.back()}>
                    Go Back
                </button>
            </div>
        </div>
    );
};
