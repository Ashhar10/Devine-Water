import { NavLink } from 'react-router-dom'
import { useRef } from 'react'
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
    Banknote
} from 'lucide-react'
import styles from './AdminSidebar.module.css'

const navItems = [
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
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        <div className={styles.navItemInner}>
                            <item.icon size={20} className={styles.navIcon} />
                            <span className={styles.navLabel}>{item.label}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button className={styles.toggleBtn} onClick={onToggle}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    )
}

export default AdminSidebar


