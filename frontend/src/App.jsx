import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Login } from '@/components/auth/Login';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

// Dashboards
import { CustomerDashboard } from '@/components/customer/dashboard/CustomerDashboard';
import { AdminDashboard } from '@/components/admin/dashboard/AdminDashboard';
import { UserDashboard } from '@/components/user/dashboard/UserDashboard';

// Customer Routes
import { BillingHistory } from '@/components/customer/billing/BillingHistory';
import { WaterConsumption } from '@/components/customer/consumption/WaterConsumption';
import { ComplaintsList } from '@/components/customer/complaints/ComplaintsList';
import { CustomerProfile } from '@/components/customer/profile/CustomerProfile';

// Admin Routes
import { CustomerManagement } from '@/components/admin/customers/CustomerManagement';
import { UserManagement } from '@/components/admin/users/UserManagement';
import { BillingManagement } from '@/components/admin/billing/BillingManagement';
import { ComplaintManagement } from '@/components/admin/complaints/ComplaintManagement';
import { ActivityLogs } from '@/components/admin/activity-logs/ActivityLogs';

// User Routes (Limited Admin)
import { ViewCustomers } from '@/components/user/customers/ViewCustomers';
import { ViewBilling } from '@/components/user/billing/ViewBilling';
import { ViewComplaints } from '@/components/user/complaints/ViewComplaints';

import config from '@/config';
import '@/styles/global.css';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        {/* Customer Routes */}
                        <Route
                            path="/customer/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.CUSTOMER]}>
                                    <CustomerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/billing"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.CUSTOMER]}>
                                    <BillingHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/consumption"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.CUSTOMER]}>
                                    <WaterConsumption />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/complaints"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.CUSTOMER]}>
                                    <ComplaintsList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/customer/profile"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.CUSTOMER]}>
                                    <CustomerProfile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/customers"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <CustomerManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/billing"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <BillingManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/complaints"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <ComplaintManagement />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/activity-logs"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.ADMIN, config.roles.SUPER_ADMIN]}>
                                    <ActivityLogs />
                                </ProtectedRoute>
                            }
                        />

                        {/* User Routes (Limited Admin) */}
                        <Route
                            path="/user/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.USER]}>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/customers"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.USER]}>
                                    <ViewCustomers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/billing"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.USER]}>
                                    <ViewBilling />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/user/complaints"
                            element={
                                <ProtectedRoute allowedRoles={[config.roles.USER]}>
                                    <ViewComplaints />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Routes */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
