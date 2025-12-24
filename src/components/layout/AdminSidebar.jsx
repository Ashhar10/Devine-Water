import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Wallet,
    ShoppingCart,
    BarChart3,
    Users,
    UserCog,
    Droplets,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import styles from './AdminSidebar.module.css'

const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/finance', icon: Wallet, label: 'Finance' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders & Billing' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/users', icon: UserCog, label: 'User Management' },
]

function AdminSidebar({ collapsed, onToggle }) {
    return (
        <motion.aside
            className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {/* Logo */}
            <div className={styles.logo}>
                <motion.div
                    className={styles.logoIcon}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                >
                    <Droplets size={28} />
                </motion.div>
                {!collapsed && (
                    <motion.span
                        className={styles.logoText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Devine Water
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item, index) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        <motion.div
                            className={styles.navItemInner}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <item.icon size={20} className={styles.navIcon} />
                            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </motion.div>
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button className={styles.toggleBtn} onClick={onToggle}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </motion.aside>
    )
}

export default AdminSidebar
