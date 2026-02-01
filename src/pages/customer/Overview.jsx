import { motion } from 'framer-motion'
import { User, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import styles from './Overview.module.css'

function Overview() {
    const currentUser = useDataStore(state => state.currentUser)
    const customers = useDataStore(state => state.customers)

    const currentCustomer = customers.find(c => c.uuid === currentUser?.customerId) ||
        customers.find(c => c.email === currentUser?.email) ||
        customers[0]

    return (
        <div className={styles.overview}>
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className={styles.title}>Account Overview</h1>
                <p className={styles.subtitle}>Manage your profile and account settings</p>
            </motion.div>

            <div className={styles.grid}>
                <GlassCard className={styles.profileCard} delay={0.1}>
                    <div className={styles.cardHeader}>
                        <div className={styles.avatar}>
                            <User size={32} />
                        </div>
                        <div className={styles.nameGroup}>
                            <h2 className={styles.name}>{currentCustomer?.name}</h2>
                            <p className={styles.id}>{currentCustomer?.customer_id}</p>
                        </div>
                    </div>

                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <MapPin size={18} />
                            <span>{currentCustomer?.address}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <Phone size={18} />
                            <span>{currentCustomer?.phone}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <Mail size={18} />
                            <span>{currentCustomer?.email}</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className={styles.scheduleCard} delay={0.2}>
                    <h3 className={styles.sectionTitle}>Delivery Schedule</h3>
                    <div className={styles.daysGrid}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <div
                                key={day}
                                className={`${styles.day} ${currentCustomer?.deliveryDays?.includes(day) ? styles.active : ''}`}
                            >
                                {day.substring(0, 3)}
                            </div>
                        ))}
                    </div>
                    <p className={styles.scheduleInfo}>
                        <Clock size={16} />
                        Your alternate delivery days are {currentCustomer?.deliveryDays?.join(', ')}.
                    </p>
                </GlassCard>
            </div>
        </div>
    )
}

export default Overview
