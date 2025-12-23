import { motion } from 'framer-motion'
import { Droplets, Receipt, TrendingUp, Bell, CreditCard } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './CustomerDashboard.module.css'

function CustomerDashboard() {
    // For demo, using first customer's data
    const customers = useDataStore(state => state.customers)
    const bills = useDataStore(state => state.bills)
    const orders = useDataStore(state => state.orders)

    // Simulate logged-in customer (first active customer)
    const currentCustomer = customers.find(c => c.status === 'active') || customers[0]
    const customerBills = bills.filter(b => b.customerId === currentCustomer?.id)
    const customerOrders = orders.filter(o => o.customerId === currentCustomer?.id)

    const pendingBill = customerBills.find(b => b.status === 'pending')
    const currentUsage = pendingBill?.usageLiters || 285
    const monthlyLimit = 500
    const usagePercentage = (currentUsage / monthlyLimit) * 100

    const recentActivity = [
        ...customerBills.slice(0, 2).map(b => ({
            text: `Bill Generated - Rs ${b.amount.toLocaleString()}`,
            date: b.createdAt,
            type: 'bill'
        })),
        ...customerOrders.slice(0, 2).map(o => ({
            text: `Order ${o.status === 'delivered' ? 'Delivered' : 'Placed'} - Rs ${o.total.toLocaleString()}`,
            date: new Date(o.createdAt).toLocaleDateString(),
            type: 'order'
        }))
    ].slice(0, 3)

    return (
        <div className={styles.dashboard}>
            {/* Welcome Section */}
            <motion.div
                className={styles.welcome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className={styles.greeting}>Welcome back, {currentCustomer?.name?.split(' ')[0] || 'User'}! 👋</h1>
                <p className={styles.subtitle}>Here's your water usage overview</p>
            </motion.div>

            {/* Water Usage Card */}
            <GlassCard className={styles.usageCard} glow glowColor="cyan" delay={0.1}>
                <div className={styles.usageHeader}>
                    <div className={styles.usageIcon}>
                        <Droplets size={28} />
                    </div>
                    <span className={styles.usageLabel}>Current Month Usage</span>
                </div>

                <div className={styles.usageCircle}>
                    <svg viewBox="0 0 100 100" className={styles.progressRing}>
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${usagePercentage * 2.64} 264`}
                            transform="rotate(-90 50 50)"
                            initial={{ strokeDasharray: "0 264" }}
                            animate={{ strokeDasharray: `${usagePercentage * 2.64} 264` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00d4ff" />
                                <stop offset="100%" stopColor="#00ffc8" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className={styles.usageValue}>
                        <span className={styles.currentUsage}>{currentUsage}</span>
                        <span className={styles.usageUnit}>Liters</span>
                    </div>
                </div>

                <div className={styles.usageFooter}>
                    <span>{monthlyLimit - currentUsage}L remaining</span>
                    <span>{Math.round(usagePercentage)}% used</span>
                </div>
            </GlassCard>

            {/* Current Bill Card */}
            {pendingBill && (
                <GlassCard
                    className={styles.billCard}
                    glow
                    glowColor="warning"
                    delay={0.2}
                >
                    <div className={styles.billHeader}>
                        <div className={styles.billIcon}>
                            <Receipt size={24} />
                        </div>
                        <div className={styles.billInfo}>
                            <span className={styles.billLabel}>Current Bill</span>
                            <span className={styles.dueDate}>Due: {pendingBill.dueDate}</span>
                        </div>
                    </div>

                    <div className={styles.billAmount}>
                        <span className={styles.currency}>Rs</span>
                        <motion.span
                            className={styles.amount}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {pendingBill.amount.toLocaleString()}
                        </motion.span>
                    </div>

                    <Button variant="primary" fullWidth icon={CreditCard}>
                        Pay Now
                    </Button>
                </GlassCard>
            )}

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <GlassCard className={styles.actionCard} delay={0.3} onClick={() => window.location.href = '/customer/usage'}>
                    <TrendingUp size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>View Usage</span>
                </GlassCard>
                <GlassCard className={styles.actionCard} delay={0.4} onClick={() => window.location.href = '/customer/billing'}>
                    <Receipt size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>Bill History</span>
                </GlassCard>
                <GlassCard className={styles.actionCard} delay={0.5} onClick={() => window.location.href = '/customer/support'}>
                    <Bell size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>Support</span>
                </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className={styles.activityCard} delay={0.6}>
                <h3 className={styles.sectionTitle}>Recent Activity</h3>
                <div className={styles.activityList}>
                    {recentActivity.map((activity, index) => (
                        <motion.div
                            key={index}
                            className={styles.activityItem}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                        >
                            <span className={styles.activityText}>{activity.text}</span>
                            <span className={styles.activityDate}>{activity.date}</span>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export default CustomerDashboard
