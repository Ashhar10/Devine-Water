import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Receipt, Calendar, MessageCircle, LayoutDashboard } from 'lucide-react'
import TopHeader from './TopHeader'
import styles from './CustomerLayout.module.css'

const navItems = [
    { path: '/customer', icon: Home, label: 'Overview', end: true },
    { path: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customer/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/customer/finance', icon: Receipt, label: 'Finance' },
    { path: '/customer/support', icon: MessageCircle, label: 'Contact Us' },
]

function CustomerLayout() {
    const location = useLocation()

    return (
        <div className={styles.layout}>
            {/* Header */}
            <TopHeader title="Devine Water" />

            {/* Main content */}
            <main className={styles.content}>
                <Outlet />
            </main>

            {/* Bottom navigation (mobile) */}
            <nav className={styles.bottomNav}>
                {navItems.map((item) => (
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
                            whileTap={{ scale: 0.9 }}
                        >
                            <item.icon size={22} />
                            <span className={styles.navLabel}>{item.label}</span>
                        </motion.div>
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default CustomerLayout
