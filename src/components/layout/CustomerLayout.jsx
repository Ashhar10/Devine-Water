import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CustomerSidebar from './CustomerSidebar'
import MobileNav from './MobileNav'
import TopHeader from './TopHeader'
import styles from './AdminLayout.module.css' // Reuse AdminLayout styles for consistency

const pageTitles = {
    '/customer': { title: 'Account Overview', subtitle: 'Manage your profile and account settings' },
    '/customer/dashboard': { title: 'Dashboard', subtitle: 'Your water usage and orders overview' },
    '/customer/calendar': { title: 'Calendar Report', subtitle: 'Detailed usage calendar' },
    '/customer/finance': { title: 'Finance Details', subtitle: 'Billing and payment history' },
    '/customer/support': { title: 'Contact Us', subtitle: 'Get help and support' },
}

function CustomerLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    const currentPage = pageTitles[location.pathname] || { title: 'Customer Panel', subtitle: '' }

    return (
        <div className={styles.layout}>
            {/* Desktop Sidebar - hidden on mobile */}
            {!isMobile && (
                <CustomerSidebar
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

export default CustomerLayout
