import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Routes, Route, Link } from 'react-router-dom';
import { dashboardAPI, orderAPI, financeAPI, userAPI, logAPI, routeAPI } from '../../services/api';

function DashboardHome() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        dashboardAPI.getAdmin().then(res => setStats(res.data));
    }, []);

    if (!stats) return <div className="loading"></div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Admin Dashboard</h1>
            <div className="grid grid-4">
                <div className="card">
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Total Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.orders.total}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stats.orders.pending} pending</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Total Income</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{stats.finance.totalIncome.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Total Expenses</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{stats.finance.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Net Profit</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>₹{stats.finance.netProfit.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        orderAPI.getAll().then(res => setOrders(res.data));
    }, []);

    return (
        <div>
            <h1>Orders</h1>
            <div className="table-container" style={{ marginTop: '2rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Quantity</th>
                            <th>Delivery Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id}>
                                <td>{order.customerId?.fullName}</td>
                                <td>{order.quantity}</td>
                                <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                                <td><span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}`}>{order.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Finance() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        financeAPI.getReports({}).then(res => setReport(res.data));
    }, []);

    if (!report) return <div className="loading"></div>;

    return (
        <div>
            <h1>Finance</h1>
            <div className="grid grid-2" style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Incoming Money</h2>
                    <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>₹{report.incoming.total}</p>
                    {report.incoming.breakdown.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>{item._id}</span>
                            <span>₹{item.total}</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Outgoing Money</h2>
                    <p style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>₹{report.outgoing.total}</p>
                    {report.outgoing.breakdown.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>{item._id}</span>
                            <span>₹{item.total}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        userAPI.getAll().then(res => setUsers(res.data));
    }, []);

    return (
        <div>
            <h1>User Management</h1>
            <div className="table-container" style={{ marginTop: '2rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.fullName}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td><span className="badge badge-info">{user.role}</span></td>
                                <td>{user.isActive ? '✅ Active' : '❌ Inactive'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ActivityLogs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        logAPI.getAll({}).then(res => setLogs(res.data.logs));
    }, []);

    return (
        <div>
            <h1>Activity Logs</h1>
            <div className="table-container" style={{ marginTop: '2rem' }}>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td>{log.userId?.fullName || 'Unknown'}</td>
                                <td><span className="badge badge-info">{log.action}</span></td>
                                <td>{log.entity}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeNav, setActiveNav] = useState('Dashboard');

    const navItems = ['Dashboard', 'Orders', 'Finance', 'Users', 'Activity Logs'];

    return (
        <div className="dashboard">
            <div className="sidebar">
                <h2 style={{ marginBottom: '2rem' }}>Admin Panel</h2>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Welcome, {user?.fullName}</p>
                <ul className="sidebar-nav">
                    {navItems.map(item => (
                        <li key={item} className={`nav-item ${activeNav === item ? 'active' : ''}`} onClick={() => setActiveNav(item)}>
                            <Link to={`/${item.toLowerCase().replace(' ', '-')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item}</Link>
                        </li>
                    ))}
                </ul>
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={logout}>Logout</button>
            </div>
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/activity-logs" element={<ActivityLogs />} />
                </Routes>
            </div>
        </div>
    );
}

export default AdminDashboard;
