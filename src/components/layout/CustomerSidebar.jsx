import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import ConfirmationModal from '../common/ConfirmationModal'
import {
    Home,
    LayoutDashboard,
    Calendar,
    Receipt,
    MessageCircle,
    Droplets,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react'
import styles from './AdminSidebar.module.css' // Reuse AdminSidebar styles for consistency

export const customerNavItems = [
    { path: '/customer', icon: Home, label: 'Overview', end: true },
    { path: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customer/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/customer/finance', icon: Receipt, label: 'Finance' },
    { path: '/customer/support', icon: MessageCircle, label: 'Contact Us' },
]

function CustomerSidebar({ collapsed, onToggle }) {
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
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        if (collapsed) {
            onToggle()
        }
    }

    // Close sidebar after delay
    const handleMouseLeave = () => {
        if (!collapsed) {
            closeTimeoutRef.current = setTimeout(() => {
                onToggle()
            }, 500)
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
                {customerNavItems.map((item) => (
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

export default CustomerSidebar
