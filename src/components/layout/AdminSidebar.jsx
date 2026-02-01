import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import ConfirmationModal from '../common/ConfirmationModal'
import {
    LayoutDashboard,
    Wallet,
    ShoppingCart,
    BarChart3,
    Users,
    UserCog,
    Droplets,
    ChevronLeft,
    ChevronRight,
    Package,
    Truck,
    Store,
    Banknote,
    LogOut
} from 'lucide-react'
import styles from './AdminSidebar.module.css'

export const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders & Billing' },
    { path: '/admin/vendors', icon: Store, label: 'Vendors' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/payments', icon: Banknote, label: 'Payments' },
    { path: '/admin/finance', icon: Wallet, label: 'Finance' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/users', icon: UserCog, label: 'Staff & Users' },
]

function AdminSidebar({ collapsed, onToggle }) {
    const closeTimeoutRef = useRef(null)
    const navigate = useNavigate()
    const currentUser = useDataStore(state => state.currentUser)
    const logout = useDataStore(state => state.logout)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const handleLogout = () => {
        setShowLogoutConfirm(true)
    }

    const confirmLogout = () => {
        logout()
        navigate('/login')
        setShowLogoutConfirm(false)
    }

    // Open sidebar on hover
    const handleMouseEnter = () => {
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        // Open if collapsed
        if (collapsed) {
            onToggle()
        }
    }

    // Close sidebar after 0.5 seconds when mouse leaves
    const handleMouseLeave = () => {
        // Only set timeout if sidebar is open
        if (!collapsed) {
            closeTimeoutRef.current = setTimeout(() => {
                onToggle()
            }, 500) // 0.5 second delay
        }
    }

    return (
        <aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Droplets size={28} />
                </div>
                <span className={styles.logoText}>Devine Water</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.filter(item => {
                    // Super Admins see everything
                    if (currentUser?.email === 'admin@devinewater.pk') return true
                    // Only show if section is in permitted list
                    return currentUser?.permittedSections?.includes(item.path)
                }).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        <div className={styles.navItemInner}>
                            <item.icon size={24} className={styles.navIcon} />
                            <span className={styles.navLabel}>{item.label}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            {/* Logout Section */}
            <div className={styles.logoutSection}>
                <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={24} className={styles.navIcon} />
                    <span className={styles.logoutLabel}>Logout</span>
                </button>
            </div>

            {/* Collapse toggle */}
            <button className={styles.toggleBtn} onClick={onToggle}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                title="Logout Confirmation"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
                type="danger"
            />
        </aside>
    )
}

export default AdminSidebar


