import { useState, useMemo } from 'react'
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
    User,
    Calendar,
    Filter,
    RotateCw,
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import KPICard from '../../components/ui/KPICard'
import StatusBadge from '../../components/ui/StatusBadge'
import DataChart from '../../components/charts/DataChart'
import StatSlider from '../../components/dashboard/StatSlider'
import Button from '../../components/ui/Button'
import styles from './AdminDashboard.module.css'

const FILTER_MODES = {
    MONTH: 'month',
    WEEK: 'week',
    CUSTOM: 'custom'
}

function AdminDashboard() {
    // Get raw data from store - stable references
    const currentUser = useDataStore(state => state.currentUser)
    const customers = useDataStore(state => state.customers)
    const orders = useDataStore(state => state.orders)
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const payments = useDataStore(state => state.payments)
    const areas = useDataStore(state => state.areas)
    const products = useDataStore(state => state.products)

    const [filterMode, setFilterMode] = useState(FILTER_MODES.MONTH)
    const [customRange, setCustomRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    const dateRange = useMemo(() => {
        const now = new Date()
        let start, end

        if (filterMode === FILTER_MODES.MONTH) {
            start = new Date(now.getFullYear(), now.getMonth(), 1)
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        } else if (filterMode === FILTER_MODES.WEEK) {
            const day = now.getDay()
            const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Start from Monday
            start = new Date(now.setDate(diff))
            start.setHours(0, 0, 0, 0)
            end = new Date(start)
            end.setDate(end.getDate() + 6)
            end.setHours(23, 59, 59, 999)
        } else {
            start = new Date(customRange.startDate)
            end = new Date(customRange.endDate)
            end.setHours(23, 59, 59, 999)
        }

        return { start, end }
    }, [filterMode, customRange])

    // Compute stats with useMemo to avoid recalculation
    const stats = useMemo(() => {
        const { start, end } = dateRange

        const filteredOrders = orders.filter(o => {
            const date = new Date(o.createdAt || o.orderDate)
            return date >= start && date <= end
        })

        const filteredPayments = payments.filter(p => {
            const date = new Date(p.paymentDate || p.createdAt)
            return date >= start && date <= end
        })

        const filteredInvestments = investments.filter(i => {
            const date = new Date(i.investmentDate || i.createdAt)
            return date >= start && date <= end
        })

        const filteredExpenditures = expenditures.filter(e => {
            const date = new Date(e.date || e.createdAt)
            return date >= start && date <= end
        })

        const activeCustomers = customers.filter(c => c.status === 'active').length
        const totalOutstanding = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0)

        const todayStr = new Date().toISOString().split('T')[0]
        const todayOrdersList = filteredOrders.filter(o => (o.createdAt || o.orderDate)?.startsWith(todayStr))
        const todayOrders = todayOrdersList.length
        const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length

        // Calculate Areas to Deliver (Scheduled for Today)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const todayName = days[new Date().getDay()]

        const scheduledAreas = areas.filter(a => a.deliveryDays?.includes(todayName))
        const areaNames = scheduledAreas.map(a => a.name)

        // Format area names as "Area 1, Area 2 +N more" if needed
        const areasToDeliver = areaNames.length > 0
            ? areaNames.slice(0, 2).join(', ') + (areaNames.length > 2 ? ` +${areaNames.length - 2}` : '')
            : 'No Routes'

        // Calculate total bottles and group by product for delivered orders (in filtered range)
        const bottlesByProduct = {}
        let deliveredBottles = 0
        let totalBottles = 0

        filteredOrders.forEach(order => {
            const orderBottles = order.items?.reduce((s, item) => s + (parseInt(item.qty) || 0), 0) || 0
            totalBottles += orderBottles

            if (order.status === 'delivered') {
                deliveredBottles += orderBottles
                order.items?.forEach(item => {
                    const name = item.name || 'Unknown Item'
                    bottlesByProduct[name] = (bottlesByProduct[name] || 0) + (parseInt(item.qty) || 0)
                })
            }
        })

        const totalDeliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length

        const income = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0)
        const currentMonthRevenue = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + income
        const expenses = filteredExpenditures.reduce((sum, exp) => sum + exp.amount, 0)

        return {
            totalCustomers: activeCustomers,
            totalOrders: filteredOrders.length,
            pendingOrders,
            todayOrders,
            totalDeliveredOrders,
            areasToDeliver,
            totalBottles,
            deliveredBottles,
            bottlesByProduct,
            revenue: currentMonthRevenue,
            expenses: expenses,
            profit: income - expenses,
            outstanding: totalOutstanding
        }
    }, [customers, orders, investments, expenditures, payments, areas, dateRange])

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
            link: '/admin/payments',
            linkText: 'Manage Balances'
        }
    ] : []

    const bottleSlides = useMemo(() => {
        // Create slides ONLY for products that have deliveries > 0 in this range
        const pSlides = (products || [])
            .filter(product => (stats.bottlesByProduct?.[product.name] || 0) > 0)
            .map(product => {
                const count = stats.bottlesByProduct?.[product.name] || 0
                return {
                    title: `${product.name} Delivered`,
                    value: count,
                    icon: Droplets,
                    color: 'cyan'
                }
            })

        // If no deliveries at all, return a default slide
        if (pSlides.length === 0) {
            return [{
                title: 'Bottles Delivered',
                value: 0,
                icon: Droplets,
                color: 'teal'
            }]
        }

        return [
            ...pSlides,
            {
                title: 'Total Bottles Delivered',
                value: stats.deliveredBottles,
                icon: Droplets,
                color: 'teal'
            }
        ]
    }, [products, stats.bottlesByProduct, stats.deliveredBottles])

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
        }
    ]

    return (
        <div className={styles.dashboard}>
            {/* Date Filters */}
            <header className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <button
                        className={`${styles.filterBtn} ${filterMode === FILTER_MODES.MONTH ? styles.active : ''}`}
                        onClick={() => setFilterMode(FILTER_MODES.MONTH)}
                    >
                        This Month
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterMode === FILTER_MODES.WEEK ? styles.active : ''}`}
                        onClick={() => setFilterMode(FILTER_MODES.WEEK)}
                    >
                        This Week
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterMode === FILTER_MODES.CUSTOM ? styles.active : ''}`}
                        onClick={() => setFilterMode(FILTER_MODES.CUSTOM)}
                    >
                        Custom Range
                    </button>
                </div>

                {filterMode === FILTER_MODES.CUSTOM && (
                    <motion.div
                        className={styles.customDateRange}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={customRange.startDate}
                            onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                        />
                        <span className={styles.dateSeparator}>to</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={customRange.endDate}
                            onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                        />
                    </motion.div>
                )}

                <div className={styles.filterActions}>
                    <button
                        className={styles.resetBtn}
                        onClick={() => {
                            setFilterMode(FILTER_MODES.MONTH)
                            setCustomRange({
                                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                endDate: new Date().toISOString().split('T')[0]
                            })
                        }}
                        title="Reset to current month"
                    >
                        <RotateCw size={16} />
                        <span>Reset</span>
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <section className={styles.kpiGrid}>
                {/* Orders Slider */}
                <StatSlider
                    slides={orderSlides}
                    interval={3000}
                />

                <StatSlider
                    slides={bottleSlides}
                    interval={2500}
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
