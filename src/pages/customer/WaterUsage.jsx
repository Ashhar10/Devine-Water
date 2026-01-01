import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Droplets, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import DataChart from '../../components/charts/DataChart'
import styles from './WaterUsage.module.css'

function WaterUsage() {
    const [timeRange, setTimeRange] = useState('monthly')

    const customers = useDataStore(state => state.customers)
    const bills = useDataStore(state => state.bills)

    // Simulate logged-in customer
    const currentCustomer = customers.find(c => c.status === 'active') || customers[0]
    const customerBills = bills.filter(b => b.customerId === currentCustomer?.id)

    // Transform bills to usage data
    const monthlyUsage = useMemo(() => {
        if (customerBills.length === 0) return []
        return customerBills.map(bill => ({
            name: bill.month?.split(' ')[0]?.substring(0, 3) || 'N/A',
            usage: bill.usageLiters || 0,
            cost: bill.amount || 0,
        })).slice(0, 6).reverse()
    }, [customerBills])

    // Calculate current and previous month stats
    const currentMonth = monthlyUsage[monthlyUsage.length - 1] || { usage: 0, cost: 0 }
    const previousMonth = monthlyUsage[monthlyUsage.length - 2] || { usage: 0, cost: 0 }
    const usageChange = previousMonth.usage > 0
        ? ((currentMonth.usage - previousMonth.usage) / previousMonth.usage) * 100
        : 0

    return (
        <div className={styles.usage}>
            {/* Header Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard} glow glowColor="cyan">
                    <div className={styles.statIcon}>
                        <Droplets size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{currentMonth.usage}L</span>
                        <span className={styles.statLabel}>This Month</span>
                    </div>
                </GlassCard>

                <GlassCard className={styles.statCard}>
                    <div className={`${styles.statIcon} ${usageChange > 0 ? styles.up : styles.down}`}>
                        {usageChange > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className={styles.statInfo}>
                        <span className={`${styles.statValue} ${usageChange > 0 ? styles.increase : styles.decrease}`}>
                            {usageChange > 0 ? '+' : ''}{usageChange.toFixed(1)}%
                        </span>
                        <span className={styles.statLabel}>vs Last Month</span>
                    </div>
                </GlassCard>
            </div>

            {/* Usage Chart */}
            <GlassCard className={styles.chartCard}>
                <DataChart
                    title="Monthly Usage"
                    subtitle={monthlyUsage.length > 0 ? "Water consumption in liters" : "No usage data available"}
                    data={monthlyUsage}
                    type="area"
                    dataKeys={['usage']}
                    colors={['#00d4ff']}
                    height={280}
                />
            </GlassCard>

            {/* Usage Breakdown */}
            <GlassCard className={styles.breakdownCard}>
                <h3 className={styles.sectionTitle}>Monthly Breakdown</h3>
                {monthlyUsage.length === 0 ? (
                    <p className={styles.noData}>No billing data available</p>
                ) : (
                    <div className={styles.breakdown}>
                        {monthlyUsage.slice().reverse().map((month, index) => (
                            <motion.div
                                key={month.name}
                                className={styles.breakdownItem}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={styles.breakdownLeft}>
                                    <Calendar size={16} className={styles.calendarIcon} />
                                    <span className={styles.monthName}>{month.name}</span>
                                </div>
                                <div className={styles.breakdownRight}>
                                    <div className={styles.usageBar}>
                                        <motion.div
                                            className={styles.usageProgress}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((month.usage / 500) * 100, 100)}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                        />
                                    </div>
                                    <span className={styles.usageValue}>{month.usage}L</span>
                                    <span className={styles.costValue}>Rs {month.cost}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Tips */}
            <GlassCard className={styles.tipsCard}>
                <h3 className={styles.sectionTitle}>💡 Water Saving Tips</h3>
                <ul className={styles.tipsList}>
                    <li>Fix leaky faucets and toilets to prevent water waste</li>
                    <li>Use a bucket instead of a running hose to wash vehicles</li>
                    <li>Water plants during early morning or evening hours</li>
                </ul>
            </GlassCard>
        </div>
    )
}

export default WaterUsage
