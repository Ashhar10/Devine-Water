import { motion } from 'framer-motion'
import { Search, Bell, User, Menu } from 'lucide-react'
import styles from './TopHeader.module.css'

function TopHeader({ title, subtitle, onMenuClick }) {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button className={styles.menuBtn} onClick={onMenuClick}>
                    <Menu size={22} />
                </button>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            </div>

            <div className={styles.right}>
                {/* Search */}
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.searchInput}
                    />
                </div>

                {/* Notifications */}
                <motion.button
                    className={styles.iconBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bell size={20} />
                    <span className={styles.notificationDot} />
                </motion.button>

                {/* Profile */}
                <motion.button
                    className={styles.profileBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className={styles.avatar}>
                        <User size={18} />
                    </div>
                    <span className={styles.profileName}>Admin</span>
                </motion.button>
            </div>
        </header>
    )
}

export default TopHeader
