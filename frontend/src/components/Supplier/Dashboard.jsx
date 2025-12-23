import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, deliveryAPI } from '../../services/api';

function SupplierDashboard() {
    const { user, logout } = useAuth();
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        dashboardAPI.getSupplier().then(res => setDashboard(res.data));
    }, []);

    const handleStatusUpdate = async (deliveryId, status) => {
        try {
            await deliveryAPI.updateStatus(deliveryId, status);
            dashboardAPI.getSupplier().then(res => setDashboard(res.data));
            alert('Status updated successfully');
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (!dashboard) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loading"></div></div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Supplier Dashboard</h1>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Today's Deliveries</h2>
                <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Address</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.todayDeliveries.map(delivery => (
                                <tr key={delivery._id}>
                                    <td>{delivery.orderId?.customerId?.fullName}</td>
                                    <td>{delivery.orderId?.address}</td>
                                    <td>{delivery.orderId?.quantity}</td>
                                    <td><span className={`badge badge-${delivery.status === 'completed' ? 'success' : 'warning'}`}>{delivery.status}</span></td>
                                    <td>
                                        {delivery.status !== 'completed' && (
                                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => handleStatusUpdate(delivery._id, 'completed')}>
                                                Mark Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h2>Pending Deliveries</h2>
                <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Delivery Date</th>
                                <th>Quantity</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.pendingDeliveries.map(delivery => (
                                <tr key={delivery._id}>
                                    <td>{delivery.orderId?.customerId?.fullName}</td>
                                    <td>{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                                    <td>{delivery.orderId?.quantity}</td>
                                    <td><span className="badge badge-warning">{delivery.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SupplierDashboard;
