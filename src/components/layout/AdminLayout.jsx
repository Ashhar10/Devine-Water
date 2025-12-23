import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import TopHeader from './TopHeader'
import styles from './AdminLayout.module.css'

const pageTitles = {
    '/admin': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your water management overview.' },
    '/admin/finance': { title: 'Finance', subtitle: 'Track your income and expenses' },
    '/admin/orders': { title: 'Orders & Billing', subtitle: 'Manage customer orders and invoices' },
    '/admin/reports': { title: 'Reports', subtitle: 'Analytics and insights' },
    '/admin/customers': { title: 'Customers', subtitle: 'Manage customer accounts' },
}

function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const location = useLocation()

    const currentPage = pageTitles[location.pathname] || { title: 'Admin', subtitle: '' }

    return (
        <div className={styles.layout}>
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className={`${styles.main} ${sidebarCollapsed ? styles.collapsed : ''}`}>
                <TopHeader
                    title={currentPage.title}
                    subtitle={currentPage.subtitle}
                    onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
