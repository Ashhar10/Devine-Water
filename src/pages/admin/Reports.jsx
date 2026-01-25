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
    const orders = useDataStore(state => state.orders)
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const customers = useDataStore(state => state.customers)

    // Calculate revenue from orders
    const revenueData = useMemo(() => {
        const monthly = {}
        orders.forEach(order => {
            if (order.status === 'delivered') {
                const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' })
                monthly[month] = (monthly[month] || 0) + order.total
            }
        })
        return Object.entries(monthly).map(([name, revenue]) => ({ name, revenue }))
    }, [orders])

    // Transform orders data for bottles chart
    const chartData = useMemo(() => {
        const monthly = {}
        orders.forEach(order => {
            const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' })
            const bottles = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0
            if (!monthly[month]) {
                monthly[month] = { delivered: 0, total: 0 }
            }
            monthly[month].total += bottles
            if (order.status === 'delivered') {
                monthly[month].delivered += bottles
            }
        })
        return Object.entries(monthly).map(([name, data]) => ({
            name,
            bottles: data.total,
            delivered: data.delivered
        }))
    }, [orders])

    // Calculate totals
    const totals = useMemo(() => {
        const totalBottles = orders.reduce((sum, o) =>
            sum + (o.items?.reduce((s, item) => s + item.qty, 0) || 0), 0)
        // Fixed: Revenue should be from delivered orders, not investments
        const totalRevenue = orders.reduce((sum, o) =>
            o.status === 'delivered' ? sum + (o.total || 0) : sum, 0)
        const totalExpenses = expenditures.reduce((sum, exp) => sum + exp.amount, 0)
        const activeCustomers = customers.filter(c => c.status === 'active').length

        return { totalBottles, totalRevenue, totalExpenses, activeCustomers }
    }, [orders, investments, expenditures, customers])

    // Format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const summaryStats = [
        {
            label: 'Total Orders',
            value: orders.length.toString(),
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
                    title="Orders & Delivery Overview"
                    subtitle={chartData.length > 0 ? `${chartData.length} months of data` : 'No data available'}
                    data={chartData}
                    type="area"
                    dataKeys={['bottles', 'delivered']}
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
                            <span className={styles.quickLabel}>Total Orders</span>
                            <span className={styles.quickValue}>{orders.length}</span>
                        </div>
                    </div>
                </GlassCard>
            </section>
        </div>
    )
}

export default Reports
