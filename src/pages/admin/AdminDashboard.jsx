import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Droplets,
    Users,
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import KPICard from '../../components/ui/KPICard'
import StatusBadge from '../../components/ui/StatusBadge'
import DataChart from '../../components/charts/DataChart'
import styles from './AdminDashboard.module.css'

function AdminDashboard() {
    // Get raw data from store - stable references
    const customers = useDataStore(state => state.customers)
    const orders = useDataStore(state => state.orders)
    const waterProduction = useDataStore(state => state.waterProduction)
    const transactions = useDataStore(state => state.transactions)

    // Compute stats with useMemo to avoid recalculation
    const stats = useMemo(() => {
        const activeCustomers = customers.filter(c => c.status === 'active').length
        const todayStr = new Date().toISOString().split('T')[0]
        const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr)).length
        const pendingOrders = orders.filter(o => o.status === 'pending').length

        const totalProduction = waterProduction.reduce((acc, r) => ({
            produced: acc.produced + r.produced,
            consumed: acc.consumed + r.consumed,
        }), { produced: 0, consumed: 0 })

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

        return {
            totalCustomers: activeCustomers,
            totalOrders: orders.length,
            pendingOrders,
            todayOrders,
            totalWaterProduced: totalProduction.produced,
            totalWaterConsumed: totalProduction.consumed,
            revenue: income,
            expenses: expenses,
            profit: income - expenses,
        }
    }, [customers, orders, waterProduction, transactions])

    // Transform water production data for chart
    const waterFlowData = useMemo(() => waterProduction.map(wp => ({
        name: new Date(wp.date).toLocaleString('default', { month: 'short' }),
        produced: wp.produced,
        consumed: wp.consumed,
    })), [waterProduction])

    // Group transactions by month for revenue chart
    const revenueData = useMemo(() => {
        const monthly = {}
        transactions.forEach(t => {
            const month = new Date(t.createdAt).toLocaleString('default', { month: 'short' })
            if (!monthly[month]) monthly[month] = { revenue: 0, expenses: 0 }
            if (t.type === 'income') monthly[month].revenue += t.amount
            else monthly[month].expenses += t.amount
        })
        return Object.entries(monthly).map(([name, data]) => ({ name, ...data }))
    }, [transactions])

    // Get recent orders (last 5)
    const recentOrders = useMemo(() => orders.slice(0, 5).map(order => ({
        ...order,
        date: new Date(order.createdAt).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    })), [orders])

    return (
        <div className={styles.dashboard}>
            {/* KPI Cards */}
            <section className={styles.kpiGrid}>
                <KPICard
                    title="Total Water Produced"
                    value={stats.totalWaterProduced}
                    unit=" L"
                    icon={Droplets}
                    trend="up"
                    trendValue={12.5}
                    color="cyan"
                    delay={0}
                />
                <KPICard
                    title="Total Consumption"
                    value={stats.totalWaterConsumed}
                    unit=" L"
                    icon={TrendingUp}
                    trend="up"
                    trendValue={8.2}
                    color="teal"
                    delay={0.1}
                />
                <KPICard
                    title="Active Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    trend="up"
                    trendValue={5.3}
                    color="success"
                    delay={0.2}
                />
                <KPICard
                    title="Monthly Revenue"
                    value={stats.revenue}
                    prefix="Rs "
                    icon={DollarSign}
                    trend="up"
                    trendValue={15.7}
                    color="income"
                    delay={0.3}
                />
            </section>

            {/* Charts Row */}
            <section className={styles.chartsRow}>
                <DataChart
                    title="Water Production vs Consumption"
                    subtitle="Monthly overview in liters"
                    data={waterFlowData}
                    type="area"
                    dataKeys={['produced', 'consumed']}
                    colors={['#00d4ff', '#00ffc8']}
                    height={280}
                    showLegend
                    className={styles.chartCard}
                />
                <DataChart
                    title="Revenue vs Expenses"
                    subtitle="Financial overview"
                    data={revenueData}
                    type="bar"
                    dataKeys={['revenue', 'expenses']}
                    colors={['#00e5a0', '#ff6b6b']}
                    height={280}
                    showLegend
                    className={styles.chartCard}
                />
            </section>

            {/* Quick Stats & Recent Orders */}
            <section className={styles.bottomRow}>
                {/* Quick Stats */}
                <GlassCard className={styles.quickStats}>
                    <h3 className={styles.sectionTitle}>Quick Stats</h3>
                    <div className={styles.statsList}>
                        <div className={styles.statItem}>
                            <div className={styles.statIconUp}>
                                <ArrowUpRight size={18} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Today's Orders</span>
                                <span className={styles.statValue}>{stats.todayOrders}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statIconDown}>
                                <ArrowDownRight size={18} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Pending Orders</span>
                                <span className={styles.statValue}>{stats.pendingOrders}</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statIconUp}>
                                <ArrowUpRight size={18} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Net Profit</span>
                                <span className={styles.statValue}>Rs {stats.profit.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Recent Orders */}
                <GlassCard className={styles.recentOrders}>
                    <div className={styles.ordersHeader}>
                        <h3 className={styles.sectionTitle}>Recent Orders</h3>
                        <motion.a
                            href="/admin/orders"
                            className={styles.viewAllBtn}
                            whileHover={{ x: 4 }}
                        >
                            View All →
                        </motion.a>
                    </div>
                    <div className={styles.ordersList}>
                        {recentOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                className={styles.orderItem}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className={styles.orderIcon}>
                                    <ShoppingCart size={16} />
                                </div>
                                <div className={styles.orderInfo}>
                                    <span className={styles.orderCustomer}>{order.customerName}</span>
                                    <span className={styles.orderId}>{order.id} • {order.date}</span>
                                </div>
                                <div className={styles.orderRight}>
                                    <span className={styles.orderAmount}>Rs {order.total.toLocaleString()}</span>
                                    <StatusBadge status={order.status} size="sm" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </section>
        </div>
    )
}

export default AdminDashboard
