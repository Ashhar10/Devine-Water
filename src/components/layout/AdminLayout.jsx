import { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import AdminSidebar, { navItems } from './AdminSidebar'
import MobileNav from './MobileNav'
import TopHeader from './TopHeader'
import { useDataStore } from '../../store/dataStore'
import styles from './AdminLayout.module.css'

const pageTitles = {
    '/admin': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your water management overview.' },
    '/admin/finance': { title: 'Finance', subtitle: 'Track your income and expenses' },
    '/admin/orders': { title: 'Orders & Billing', subtitle: 'Manage customer orders and invoices' },
    '/admin/reports': { title: 'Reports', subtitle: 'Analytics and insights' },
    '/admin/customers': { title: 'Customers', subtitle: 'Manage customer accounts' },
    '/admin/products': { title: 'Products', subtitle: 'Manage your product inventory' },
    '/admin/vendors': { title: 'Vendors', subtitle: 'Manage your suppliers' },
    '/admin/delivery': { title: 'Delivery', subtitle: 'Plan delivery routes' },
    '/admin/payments': { title: 'Payments', subtitle: 'Track payments and collections' },
    '/admin/users': { title: 'Staff & Users', subtitle: 'Manage user accounts' },
}

function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Start collapsed
    const [isMobile, setIsMobile] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const currentUser = useDataStore(state => state.currentUser)

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Permission-based redirection
    useEffect(() => {
        if (!currentUser) return

        const isSuperAdmin = currentUser.email === 'admin@devinewater.pk'
        if (isSuperAdmin) return

        const permittedSections = currentUser.permittedSections || []
        const currentPath = location.pathname

        // If at the root /admin or any subpath, check if permitted
        if (currentPath.startsWith('/admin')) {
            const isPermitted = permittedSections.includes(currentPath)

            // Special handling for the root /admin (Dashboard)
            if (currentPath === '/admin' && !isPermitted) {
                // Redirect to the first available section
                const firstAvailable = navItems.find(item => permittedSections.includes(item.path))
                if (firstAvailable) {
                    navigate(firstAvailable.path, { replace: true })
                }
            } else if (currentPath !== '/admin' && !isPermitted) {
                // If trying to access a restricted subpage, redirect to first available
                const firstAvailable = navItems.find(item => permittedSections.includes(item.path))
                if (firstAvailable) {
                    navigate(firstAvailable.path, { replace: true })
                }
            }
        }
    }, [location.pathname, currentUser, navigate])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    const currentPage = pageTitles[location.pathname] || { title: 'Admin', subtitle: '' }

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar - hidden on mobile */}
            {!isMobile && (
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            )}

            <div className={`${styles.main} ${!isMobile && sidebarCollapsed ? styles.collapsed : ''} ${isMobile ? styles.mobile : ''}`}>
                <TopHeader
                    title={currentPage.title}
                    subtitle={currentPage.subtitle}
                    onMenuClick={() => isMobile ? setMobileMenuOpen(true) : setSidebarCollapsed(!sidebarCollapsed)}
                    isMobile={isMobile}
                />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <MobileNav
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    onOpen={() => setMobileMenuOpen(true)}
                />
            )}
        </div>
    )
}

export default AdminLayout

