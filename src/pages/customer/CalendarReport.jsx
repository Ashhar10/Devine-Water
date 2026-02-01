import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './CalendarReport.module.css'

function CalendarReport() {
    const currentUser = useDataStore(state => state.currentUser)
    const customers = useDataStore(state => state.customers)
    const orders = useDataStore(state => state.orders)

    // Find the current customer object from the store
    const currentCustomer = customers.find(c => c.uuid === currentUser?.customerId) ||
        customers.find(c => c.email === currentUser?.email) ||
        customers[0]

    const customerOrders = useMemo(() => {
        return orders
            .filter(o => o.customerId === currentCustomer?.id)
            .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    }, [orders, currentCustomer])

    const [selectedMonth, setSelectedMonth] = useState(new Date())

    const nextMonth = () => {
        const next = new Date(selectedMonth)
        next.setMonth(next.getMonth() + 1)
        setSelectedMonth(next)
    }

    const prevMonth = () => {
        const prev = new Date(selectedMonth)
        prev.setMonth(prev.getMonth() - 1)
        setSelectedMonth(prev)
    }

    const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

    const monthlyStats = useMemo(() => {
        const thisMonthOrders = customerOrders.filter(o => {
            const date = new Date(o.orderDate || o.createdAt)
            return date.getMonth() === selectedMonth.getMonth() &&
                date.getFullYear() === selectedMonth.getFullYear()
        })

        const delivered = thisMonthOrders.filter(o => o.status === 'delivered')
        const totalQty = delivered.reduce((sum, o) => {
            const bottles = o.items.reduce((s, it) => s + (parseInt(it.qty) || 0), 0)
            return sum + bottles
        }, 0)

        return {
            count: delivered.length,
            bottles: totalQty,
            amount: delivered.reduce((sum, o) => sum + (o.total || 0), 0)
        }
    }, [customerOrders, selectedMonth])

    return (
        <div className={styles.usage}>
            {/* Calendar Header */}
            <div className={styles.calendarNav}>
                <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft /></button>
                <h2 className={styles.monthTitle}>{monthName}</h2>
                <button onClick={nextMonth} className={styles.navBtn}><ChevronRight /></button>
            </div>

            {/* Monthly Stats Summary */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard} glow glowColor="cyan">
                    <div className={styles.statIcon}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{monthlyStats.count}</span>
                        <span className={styles.statLabel}>Deliveries</span>
                    </div>
                </GlassCard>

                <GlassCard className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Droplets size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{monthlyStats.bottles}</span>
                        <span className={styles.statLabel}>Bottles Total</span>
                    </div>
                </GlassCard>
            </div>

            {/* Delivery Logs */}
            <GlassCard className={styles.reportCard}>
                <div className={styles.reportHeader}>
                    <h3 className={styles.sectionTitle}>Delivery Reports</h3>
                    <div className={styles.monthTotal}>Total: Rs {monthlyStats.amount.toLocaleString()}</div>
                </div>

                <div className={styles.logsList}>
                    {customerOrders.length === 0 ? (
                        <div className={styles.emptyLogs}>No delivery reports found.</div>
                    ) : (
                        customerOrders
                            .filter(o => {
                                const date = new Date(o.orderDate || o.createdAt)
                                return date.getMonth() === selectedMonth.getMonth() &&
                                    date.getFullYear() === selectedMonth.getFullYear()
                            })
                            .map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    className={styles.logItem}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className={styles.logDate}>
                                        <Calendar size={16} />
                                        <span>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.logDetails}>
                                        <span className={styles.logItems}>
                                            {order.items.map(it => `${it.name} x ${it.qty}`).join(', ')}
                                        </span>
                                        <StatusBadge status={order.status} size="sm" />
                                    </div>
                                    <div className={styles.logPrice}>
                                        Rs {order.total.toLocaleString()}
                                    </div>
                                </motion.div>
                            ))
                    )}
                </div>
            </GlassCard>
        </div>
    )
}

export default CalendarReport
