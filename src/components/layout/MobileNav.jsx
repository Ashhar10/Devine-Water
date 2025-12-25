import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Store,
    Truck,
    Banknote,
    Wallet,
    BarChart3,
    UserCog,
    Menu,
    X,
    Droplets
} from 'lucide-react'
import styles from './MobileNav.module.css'

const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/vendors', icon: Store, label: 'Vendors' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/payments', icon: Banknote, label: 'Payments' },
    { path: '/admin/finance', icon: Wallet, label: 'Finance' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/users', icon: UserCog, label: 'Users' },
]

// Quick access items for bottom bar (most used)
const quickNavItems = navItems.slice(0, 4)

function MobileNav({ isOpen, onClose, onOpen }) {
    return (
        <>
            {/* Floating Menu Button - shows when menu is closed */}
            <button
                className={`${styles.menuButton} ${isOpen ? styles.hidden : ''}`}
                onClick={onOpen}
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Bottom Sheet Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
                onClick={onClose}
            />

            {/* Bottom Sheet Menu */}
            <div className={`${styles.bottomSheet} ${isOpen ? styles.open : ''}`}>
                {/* Handle bar */}
                <div className={styles.handle}>
                    <div className={styles.handleBar} />
                </div>

                {/* Header */}
                <div className={styles.sheetHeader}>
                    <div className={styles.brand}>
                        <div className={styles.brandIcon}>
                            <Droplets size={20} />
                        </div>
                        <span>Devine Water</span>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Grid */}
                <nav className={styles.navGrid}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                            onClick={onClose}
                        >
                            <div className={styles.navIcon}>
                                <item.icon size={22} />
                            </div>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    )
}

export default MobileNav
