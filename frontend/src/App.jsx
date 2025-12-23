import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login.jsx';
import AdminDashboard from './components/Admin/Dashboard.jsx';
import CustomerDashboard from './components/Customer/Dashboard.jsx';
import SupplierDashboard from './components/Supplier/Dashboard.jsx';
import ShopkeeperDashboard from './components/Shopkeeper/Dashboard.jsx';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading" style={{ width: '50px', height: '50px' }}></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

                <Route path="/*" element={user ? (
                    user.role === 'admin' ? <AdminDashboard /> :
                        user.role === 'customer' ? <CustomerDashboard /> :
                            user.role === 'supplier' ? <SupplierDashboard /> :
                                user.role === 'shopkeeper' ? <ShopkeeperDashboard /> :
                                    <Navigate to="/login" />
                ) : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
