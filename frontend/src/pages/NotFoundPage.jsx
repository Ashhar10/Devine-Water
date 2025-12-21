export const NotFoundPage = () => {
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
                <div style={{ fontSize: '6rem', fontWeight: 'bold', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--spacing-md)' }}>404</div>
                <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Page Not Found</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                    Go Home
                </button>
            </div>
        </div>
    );
};
