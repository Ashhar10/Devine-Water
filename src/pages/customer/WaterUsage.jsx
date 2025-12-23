import { useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import DataChart from '../../components/charts/DataChart'
import styles from './WaterUsage.module.css'

function WaterUsage() {
    const [timeRange, setTimeRange] = useState('monthly')

    const waterProduction = useDataStore(state => state.waterProduction)
    const customers = useDataStore(state => state.customers)
    const bills = useDataStore(state => state.bills)

    // Simulate logged-in customer
    const currentCustomer = customers.find(c => c.status === 'active') || customers[0]
    const customerBills = bills.filter(b => b.customerId === currentCustomer?.id)

    // Transform bills to usage data
    const monthlyUsage = customerBills.map(bill => ({
        name: bill.month.split(' ')[0].substring(0, 3),
        usage: bill.usageLiters,
        cost: bill.amount,
    })).slice(0, 6).reverse()

    // Simulated daily usage
    const dailyUsage = [
        { name: 'Mon', usage: 42 },
        { name: 'Tue', usage: 38 },
        { name: 'Wed', usage: 45 },
        { name: 'Thu', usage: 40 },
        { name: 'Fri', usage: 48 },
        { name: 'Sat', usage: 52 },
        { name: 'Sun', usage: 35 },
    ]

    const currentMonth = monthlyUsage[monthlyUsage.length - 1] || { usage: 285, cost: 2850 }
    const previousMonth = monthlyUsage[monthlyUsage.length - 2] || { usage: 250, cost: 2500 }
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

            {/* Time Range Toggle */}
            <div className={styles.toggleWrapper}>
                <div className={styles.toggle}>
                    <button
                        className={`${styles.toggleBtn} ${timeRange === 'daily' ? styles.active : ''}`}
                        onClick={() => setTimeRange('daily')}
                    >
                        Daily
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${timeRange === 'monthly' ? styles.active : ''}`}
                        onClick={() => setTimeRange('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Usage Chart */}
            <GlassCard className={styles.chartCard}>
                <DataChart
                    title={timeRange === 'daily' ? 'Daily Usage (This Week)' : 'Monthly Usage'}
                    subtitle="Water consumption in liters"
                    data={timeRange === 'daily' ? dailyUsage : monthlyUsage}
                    type="area"
                    dataKeys={['usage']}
                    colors={['#00d4ff']}
                    height={280}
                />
            </GlassCard>

            {/* Usage Breakdown */}
            <GlassCard className={styles.breakdownCard}>
                <h3 className={styles.sectionTitle}>Monthly Breakdown</h3>
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
                                <span className={styles.monthName}>{month.name} 2024</span>
                            </div>
                            <div className={styles.breakdownRight}>
                                <div className={styles.usageBar}>
                                    <motion.div
                                        className={styles.usageProgress}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(month.usage / 300) * 100}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    />
                                </div>
                                <span className={styles.usageValue}>{month.usage}L</span>
                                <span className={styles.costValue}>Rs {month.cost}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
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
