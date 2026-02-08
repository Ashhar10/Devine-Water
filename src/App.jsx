import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDataStore } from './store/dataStore'
import AdminLayout from './components/layout/AdminLayout'
import CustomerLayout from './components/layout/CustomerLayout'

// Auth Pages
import Login from './pages/auth/Login'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import FinanceModule from './pages/admin/FinanceModule'
import OrdersBilling from './pages/admin/OrdersBilling'
import Reports from './pages/admin/Reports'
import Customers from './pages/admin/Customers'
import UserManagement from './pages/admin/UserManagement'
import Products from './pages/admin/Products'
import Vendors from './pages/admin/Vendors'
import Delivery from './pages/admin/Delivery'
import Payments from './pages/admin/Payments'
import Shopkeeper from './pages/admin/Shopkeeper'

// Customer Pages
import Overview from './pages/customer/Overview'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import Finance from './pages/customer/Finance'
import CalendarReport from './pages/customer/CalendarReport'
import ContactUs from './pages/customer/ContactUs'

// Protected Route Component
function ProtectedRoute({ children }) {
    const currentUser = useDataStore(state => state.currentUser)

    if (!currentUser) {
        return <Navigate to="/login" replace />
    }

    return children
}

// Loading Component
function LoadingScreen() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
            color: '#00d4ff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid rgba(0, 212, 255, 0.2)',
                    borderTopColor: '#00d4ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: '18px', opacity: 0.8 }}>Loading Devine Water...</p>
            </div>
        </div>
    )
}

function App() {
    const initialize = useDataStore(state => state.initialize)
    const isInitialized = useDataStore(state => state.isInitialized)
    const isLoading = useDataStore(state => state.isLoading)
    const currentUser = useDataStore(state => state.currentUser)

    // Initialize data on app mount
    useEffect(() => {
        initialize()
    }, [initialize])

    // Show loading screen while initializing
    if (!isInitialized || isLoading) {
        return <LoadingScreen />
    }

    return (
        <Routes>
            {/* Login Route - Default */}
            <Route path="/login" element={
                currentUser ? (
                    currentUser.role === 'customer' ? <Navigate to="/customer" replace /> : <Navigate to="/admin" replace />
                ) : <Login />
            } />

            {/* Redirect root to login or admin based on auth */}
            <Route path="/" element={
                currentUser ? (
                    currentUser.role === 'customer' ? <Navigate to="/customer" replace /> : <Navigate to="/admin" replace />
                ) : <Navigate to="/login" replace />
            } />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="customers" element={<Customers />} />
                <Route path="orders" element={<OrdersBilling />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="delivery" element={<Delivery />} />
                <Route path="payments" element={<Payments />} />
                <Route path="shopkeeper" element={<Shopkeeper />} />
                <Route path="finance" element={<FinanceModule />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Customer Routes - Protected */}
            <Route path="/customer" element={
                <ProtectedRoute>
                    <CustomerLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Overview />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="finance" element={<Finance />} />
                <Route path="calendar" element={<CalendarReport />} />
                <Route path="support" element={<ContactUs />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
