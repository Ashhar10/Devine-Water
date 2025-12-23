import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/Dashboard';
import CustomerDashboard from './components/Customer/Dashboard';
import SupplierDashboard from './components/Supplier/Dashboard';
import ShopkeeperDashboard from './components/Shopkeeper/Dashboard';

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
