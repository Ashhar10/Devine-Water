import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shopSaleAPI } from '../../services/api';

function ShopkeeperDashboard() {
    const { user, logout } = useAuth();
    const [dailySales, setDailySales] = useState(null);
    const [saleData, setSaleData] = useState({ quantity: 1, totalAmount: 0, cashReceived: 0 });
    const PRICE_PER_UNIT = 20; // Example price

    useEffect(() => {
        loadDailySales();
    }, []);

    useEffect(() => {
        setSaleData({ ...saleData, totalAmount: saleData.quantity * PRICE_PER_UNIT });
    }, [saleData.quantity]);

    const loadDailySales = () => {
        shopSaleAPI.getDailySales().then(res => setDailySales(res.data));
    };

    const handleRecordSale = async (e) => {
        e.preventDefault();
        try {
            await shopSaleAPI.create(saleData);
            alert('Sale recorded successfully!');
            setSaleData({ quantity: 1, totalAmount: PRICE_PER_UNIT, cashReceived: 0 });
            loadDailySales();
        } catch (error) {
            alert('Failed to record sale');
        }
    };

    const changeToReturn = saleData.cashReceived - saleData.totalAmount;

    if (!dailySales) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loading"></div></div>;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Shopkeeper Dashboard</h1>
                <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ color: 'var(--accent-primary)' }}>Today's Sales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>Rs {dailySales.summary.totalSales}</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--success)' }}>Units Sold</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{dailySales.summary.totalQuantity}</p>
                </div>
                <div className="card">
                    <h3 style={{ color: 'var(--warning)' }}>Transactions</h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700' }}>{dailySales.summary.numberOfTransactions}</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Record New Sale</h2>
                <form onSubmit={handleRecordSale} style={{ marginTop: '1rem' }}>
                    <div className="grid grid-2">
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Quantity</label>
                            <input type="number" className="input" min="1" value={saleData.quantity} onChange={(e) => setSaleData({ ...saleData, quantity: parseInt(e.target.value) })} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Total Amount</label>
                            <input type="number" className="input" value={saleData.totalAmount} readOnly style={{ background: 'var(--bg-tertiary)' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Cash Received</label>
                            <input type="number" className="input" value={saleData.cashReceived} onChange={(e) => setSaleData({ ...saleData, cashReceived: parseFloat(e.target.value) })} required />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Change to Return</label>
                            <input type="number" className="input" value={changeToReturn >= 0 ? changeToReturn : 0} readOnly style={{ background: 'var(--bg-tertiary)', color: changeToReturn < 0 ? 'var(--error)' : 'var(--success)' }} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={changeToReturn < 0}>Record Sale</button>
                </form>
            </div>

            <div className="card">
                <h2>Today's Sales History</h2>
                <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                                <th>Cash Received</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailySales.sales.map(sale => (
                                <tr key={sale._id}>
                                    <td>{new Date(sale.date).toLocaleTimeString()}</td>
                                    <td>{sale.quantity}</td>
                                    <td>Rs {sale.totalAmount}</td>
                                    <td>Rs {sale.cashReceived}</td>
                                    <td>Rs {sale.changeReturned}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ShopkeeperDashboard;
