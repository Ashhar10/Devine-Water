import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Droplets,
    Users,
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    MapPin,
    CheckCircle,
    Clock,
    User
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import KPICard from '../../components/ui/KPICard'
import StatusBadge from '../../components/ui/StatusBadge'
import DataChart from '../../components/charts/DataChart'
import StatSlider from '../../components/dashboard/StatSlider'
import styles from './AdminDashboard.module.css'

function AdminDashboard() {
    // Get raw data from store - stable references
    const currentUser = useDataStore(state => state.currentUser)
    const customers = useDataStore(state => state.customers)
    const orders = useDataStore(state => state.orders)
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const payments = useDataStore(state => state.payments)
    const areas = useDataStore(state => state.areas)

    // Compute stats with useMemo to avoid recalculation
    const stats = useMemo(() => {
        const activeCustomers = customers.filter(c => c.status === 'active').length
        const totalOutstanding = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0)

        const todayStr = new Date().toISOString().split('T')[0]
        const todayOrdersList = orders.filter(o => o.createdAt?.startsWith(todayStr))
        const todayOrders = todayOrdersList.length
        const pendingOrders = orders.filter(o => o.status === 'pending').length

        // Calculate Areas to Deliver (Scheduled for Today)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const todayName = days[new Date().getDay()]

        const scheduledAreas = areas.filter(a => a.deliveryDays?.includes(todayName))
        const areaNames = scheduledAreas.map(a => a.name)

        // Format area names as "Area 1, Area 2 +N more" if needed
        const areasToDeliver = areaNames.length > 0
            ? areaNames.slice(0, 2).join(', ') + (areaNames.length > 2 ? ` +${areaNames.length - 2}` : '')
            : 'No Routes'

        // Calculate total bottles from orders
        const totalBottles = orders.reduce((sum, o) =>
            sum + (o.items?.reduce((s, item) => s + item.qty, 0) || 0), 0)
        const deliveredBottles = orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.items?.reduce((s, item) => s + item.qty, 0) || 0), 0)

        const totalDeliveredOrders = orders.filter(o => o.status === 'delivered').length

        const income = investments.reduce((sum, inv) => sum + inv.amount, 0)
        const expenses = expenditures.reduce((sum, exp) => sum + exp.amount, 0)

        // Calculate Monthly Revenue (Cash Flow Basis)
        // Sum of all 'customer' payments received this month + Investments this month
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const monthlyPayments = payments.filter(p => {
            const pDate = new Date(p.paymentDate)
            return p.paymentType === 'customer' &&
                pDate.getMonth() === currentMonth &&
                pDate.getFullYear() === currentYear
        }).reduce((sum, p) => sum + parseFloat(p.amount), 0)

        const monthlyInvestments = investments.filter(i => {
            const iDate = new Date(i.investmentDate || i.createdAt)
            return iDate.getMonth() === currentMonth &&
                iDate.getFullYear() === currentYear
        }).reduce((sum, i) => sum + i.amount, 0)

        const monthlyRevenue = monthlyPayments + monthlyInvestments

        return {
            totalCustomers: activeCustomers,
            totalOrders: orders.length,
            pendingOrders,
            todayOrders,
            totalDeliveredOrders,
            areasToDeliver,
            totalBottles,
            deliveredBottles,
            revenue: monthlyRevenue,
            expenses: expenses,
            profit: income - expenses,
            outstanding: totalOutstanding
        }
    }, [customers, orders, investments, expenditures, payments, areas])

    // Transform orders data for bottles chart
    const bottlesData = useMemo(() => {
        const monthly = {}
        orders.forEach(order => {
            const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' })
            const bottles = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0
            if (!monthly[month]) monthly[month] = { total: 0, delivered: 0 }
            monthly[month].total += bottles
            if (order.status === 'delivered') monthly[month].delivered += bottles
        })
        return Object.entries(monthly).map(([name, data]) => ({
            name,
            bottles: data.total,
            delivered: data.delivered
        }))
    }, [orders])

    // Group investments/expenditures by month for revenue chart
    const revenueData = useMemo(() => {
        const monthly = {}
        investments.forEach(inv => {
            const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short' })
            if (!monthly[month]) monthly[month] = { revenue: 0, expenses: 0 }
            monthly[month].revenue += inv.amount
        })
        expenditures.forEach(exp => {
            const month = new Date(exp.createdAt).toLocaleString('default', { month: 'short' })
            if (!monthly[month]) monthly[month] = { revenue: 0, expenses: 0 }
            monthly[month].expenses += exp.amount
        })
        return Object.entries(monthly).map(([name, data]) => ({ name, ...data }))
    }, [investments, expenditures])

    // Get recent orders (last 5)
    const recentOrders = useMemo(() => orders.slice(0, 5).map(order => ({
        ...order,
        date: new Date(order.createdAt).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    })), [orders])

    // Slider Data Configuration
    const revenueSlides = currentUser?.designation === 'Administrator' ? [
        {
            title: 'Monthly Revenue',
            value: stats.revenue,
            icon: DollarSign,
            color: 'income',
            prefix: 'Rs '
        },
        {
            title: 'Outstanding Balance',
            value: stats.outstanding,
            icon: Clock,
            color: 'warning',
            prefix: 'Rs ',
            link: '/admin/customers',
            linkText: 'Manage Balances'
        }
    ] : []

    const orderSlides = [
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'cyan'
        },
        {
            title: 'Delivered Orders',
            value: stats.totalDeliveredOrders,
            icon: CheckCircle,
            color: 'teal'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'orange'
        },
        {
            title: 'Areas to Deliver',
            value: stats.areasToDeliver,
            icon: MapPin,
            color: 'success'
        },
        {
            title: 'Customer Panel',
            value: 'Customer Portal',
            icon: User,
            color: 'cyan',
            link: '/customer',
            linkText: 'Switch View'
        }
    ]

    return (
        <div className={styles.dashboard}>
            {/* KPI Cards */}
            <section className={styles.kpiGrid}>
                {/* Orders Slider */}
                <StatSlider
                    slides={orderSlides}
                    interval={3000}
                />

                <KPICard
                    title="Bottles Delivered"
                    value={stats.deliveredBottles}
                    icon={Droplets}
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
                    onClick={() => window.location.href = '/admin/customers'}
                />

                {/* Revenue Slider - Only for Admin */}
                {currentUser?.designation === 'Administrator' && (
                    <StatSlider
                        slides={revenueSlides}
                        interval={3500} // Slightly offset
                    />
                )}
            </section>

            {/* Charts Row */}
            <section className={styles.chartsRow}>
                <DataChart
                    title="Orders & Delivery"
                    subtitle="Monthly bottles ordered vs delivered"
                    data={bottlesData}
                    type="area"
                    dataKeys={['bottles', 'delivered']}
                    colors={['#00d4ff', '#00ffc8']}
                    height={280}
                    showLegend
                    className={styles.chartCard}
                />
                {currentUser?.designation === 'Administrator' && (
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
                )}
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
                        {currentUser?.designation === 'Administrator' && (
                            <div className={styles.statItem}>
                                <div className={styles.statIconUp}>
                                    <ArrowUpRight size={18} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statLabel}>Net Profit</span>
                                    <span className={styles.statValue}>Rs {stats.profit.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Recent Orders */}
                <GlassCard className={styles.recentOrders}>
                    <div className={styles.ordersHeader}>
                        <h3 className={styles.sectionTitle}>Recent Orders</h3>
                        <motion.button
                            className={styles.viewAllBtn}
                            whileHover={{ x: 4 }}
                        >
                            <Link to="/admin/orders" state={{ tab: 'all' }} style={{ textDecoration: 'none', color: 'inherit' }}>
                                View All →
                            </Link>
                        </motion.button>
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
