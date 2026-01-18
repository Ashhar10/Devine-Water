import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import styles from './TopHeader.module.css'

function TopHeader({ title, subtitle, onMenuClick }) {
    const [showDropdown, setShowDropdown] = useState(false)
    const navigate = useNavigate()
    const logout = useAuthStore(state => state.logout)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

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

                {/* Profile with Dropdown */}
                <div className={styles.profileWrapper}>
                    <motion.button
                        className={styles.profileBtn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className={styles.avatar}>
                            <User size={18} />
                        </div>
                        <span className={styles.profileName}>Admin</span>
                        <ChevronDown size={16} className={showDropdown ? styles.chevronUp : ''} />
                    </motion.button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                className={styles.dropdown}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <button className={styles.dropdownItem} onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}

export default TopHeader
