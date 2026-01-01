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
    X
} from 'lucide-react'
import styles from './MobileNav.module.css'

const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Home', end: true },
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

function MobileNav({ isOpen, onClose, onOpen }) {
    return (
        <>
            {/* Floating Menu Button - center bottom */}
            <button
                className={`${styles.menuButton} ${isOpen ? styles.menuOpen : ''}`}
                onClick={isOpen ? onClose : onOpen}
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Horizontal Scroll Menu Bar */}
            <div className={`${styles.menuBar} ${isOpen ? styles.visible : ''}`}>
                <nav className={styles.navScroll}>
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

