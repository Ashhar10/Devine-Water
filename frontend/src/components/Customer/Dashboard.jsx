import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, orderAPI } from '../../services/api';

function CustomerDashboard() {
    const { user, logout } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderData, setOrderData] = useState({ quantity: 1, deliveryDate: '', address: user?.address || '' });

    useEffect(() => {
        dashboardAPI.getCustomer().then(res => setDashboard(res.data));
    }, []);

    const handleRequestBottle = async (e) => {
        e.preventDefault();
        try {
            await orderAPI.create(orderData);
            alert('Order placed successfully!');
            setShowOrderForm(false);
            dashboardAPI.getCustomer().then(res => setDashboard(res.data));
        } catch (error) {
            alert('Failed to place order');
        }
    };

    if (!dashboard) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loading"></div></div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Customer Dashboard</h1>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ color: 'var(--accent-primary)' }}>Total Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{dashboard.recentOrders.length}</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--success)' }}>Total Spent</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>Rs {dashboard.totalSpent}</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <button className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }} onClick={() => setShowOrderForm(true)}>
                        Request Bottle
                    </button>
                </div>
            </div>

            {showOrderForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Place New Order</h2>
                    <form onSubmit={handleRequestBottle} style={{ marginTop: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Quantity</label>
                            <input type="number" className="input" min="1" value={orderData.quantity} onChange={(e) => setOrderData({ ...orderData, quantity: parseInt(e.target.value) })} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Delivery Date</label>
                            <input type="date" className="input" value={orderData.deliveryDate} onChange={(e) => setOrderData({ ...orderData, deliveryDate: e.target.value })} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Delivery Address</label>
                            <input type="text" className="input" value={orderData.address} onChange={(e) => setOrderData({ ...orderData, address: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">Place Order</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Recent Orders</h2>
                <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Quantity</th>
                                <th>Order Date</th>
                                <th>Delivery Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td>{order.quantity}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                                    <td><span className={`badge badge-${order.status === 'delivered' ? 'success' : 'info'}`}>{order.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboard;
