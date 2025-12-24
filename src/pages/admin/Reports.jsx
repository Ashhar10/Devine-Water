import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Calendar, Droplets, DollarSign, Users } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import DataChart from '../../components/charts/DataChart'
import styles from './Reports.module.css'

function Reports() {
    // Get real data from store
    const waterProduction = useDataStore(state => state.waterProduction)
    const transactions = useDataStore(state => state.transactions)
    const customers = useDataStore(state => state.customers)

    // Transform water production data for chart
    const chartData = useMemo(() => {
        if (waterProduction.length === 0) {
            return []
        }
        return waterProduction.map(wp => ({
            name: new Date(wp.date).toLocaleString('default', { month: 'short' }),
            water: wp.produced,
            consumed: wp.consumed
        }))
    }, [waterProduction])

    // Calculate revenue from transactions
    const revenueData = useMemo(() => {
        const monthly = {}
        transactions.forEach(t => {
            if (t.type === 'income') {
                const month = new Date(t.createdAt).toLocaleString('default', { month: 'short' })
                monthly[month] = (monthly[month] || 0) + t.amount
            }
        })
        return Object.entries(monthly).map(([name, revenue]) => ({ name, revenue }))
    }, [transactions])

    // Calculate totals
    const totals = useMemo(() => {
        const totalWater = waterProduction.reduce((sum, wp) => sum + wp.produced, 0)
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
        const activeCustomers = customers.filter(c => c.status === 'active').length

        return { totalWater, totalRevenue, activeCustomers }
    }, [waterProduction, transactions, customers])

    // Format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const summaryStats = [
        {
            label: 'Total Water Produced',
            value: `${formatNumber(totals.totalWater)} L`,
            icon: Droplets,
            color: 'cyan'
        },
        {
            label: 'Total Revenue',
            value: `Rs ${formatNumber(totals.totalRevenue)}`,
            icon: DollarSign,
            color: 'income'
        },
        {
            label: 'Active Customers',
            value: totals.activeCustomers.toString(),
            icon: Users,
            color: 'success'
        },
    ]

    return (
        <div className={styles.reports}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>Reports</h2>
                <div className={styles.actions}>
                    <Button variant="ghost" icon={Calendar} size="sm">
                        Custom Range
                    </Button>
                    <Button variant="primary" icon={Download} size="sm">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <section className={styles.summaryGrid}>
                {summaryStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                                <stat.icon size={22} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <span className={styles.statValue}>{stat.value}</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </section>

            {/* Main Chart */}
            <section className={styles.mainChart}>
                <DataChart
                    title="Water Production Overview"
                    subtitle={chartData.length > 0 ? `${chartData.length} months of data` : 'No data available'}
                    data={chartData}
                    type="area"
                    dataKeys={['water', 'consumed']}
                    colors={['#00d4ff', '#00ffc8']}
                    height={350}
                    showLegend
                />
            </section>

            {/* Additional Charts */}
            <section className={styles.chartsGrid}>
                <DataChart
                    title="Revenue Trend"
                    subtitle="Financial performance"
                    data={revenueData}
                    type="line"
                    dataKeys={['revenue']}
                    colors={['#00e5a0']}
                    height={250}
                />
                <GlassCard className={styles.statsCard}>
                    <h3>Quick Summary</h3>
                    <div className={styles.quickStats}>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>Total Customers</span>
                            <span className={styles.quickValue}>{customers.length}</span>
                        </div>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>Active Customers</span>
                            <span className={styles.quickValue}>{totals.activeCustomers}</span>
                        </div>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>Data Points</span>
                            <span className={styles.quickValue}>{waterProduction.length}</span>
                        </div>
                    </div>
                </GlassCard>
            </section>
        </div>
    )
}

export default Reports
