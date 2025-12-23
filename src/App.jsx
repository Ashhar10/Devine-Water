import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import CustomerLayout from './components/layout/CustomerLayout'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import FinanceModule from './pages/admin/FinanceModule'
import OrdersBilling from './pages/admin/OrdersBilling'
import Reports from './pages/admin/Reports'
import Customers from './pages/admin/Customers'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import BillingPayments from './pages/customer/BillingPayments'
import WaterUsage from './pages/customer/WaterUsage'
import Support from './pages/customer/Support'

function App() {
    return (
        <Routes>
            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="finance" element={<FinanceModule />} />
                <Route path="orders" element={<OrdersBilling />} />
                <Route path="reports" element={<Reports />} />
                <Route path="customers" element={<Customers />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="billing" element={<BillingPayments />} />
                <Route path="usage" element={<WaterUsage />} />
                <Route path="support" element={<Support />} />
            </Route>
        </Routes>
    )
}

export default App
