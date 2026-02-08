import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Calendar, Droplets, DollarSign, Users, ChevronDown } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import {
    downloadAsExcel,
    downloadAsSQL,
    downloadMultipleAsExcel,
    downloadMultipleAsSQL
} from '../../utils/exportUtils'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import DataChart from '../../components/charts/DataChart'
import styles from './Reports.module.css'

function Reports() {
    // State for filtering
    const [reportPreset, setReportPreset] = useState('monthly') // 'daily', 'weekly', 'monthly', 'custom'
    const [startDate, setStartDate] = useState(() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 1)
        return d.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Get real data from store
    const orders = useDataStore(state => state.orders)
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const customers = useDataStore(state => state.customers)

    // Filter data based on date range
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const orderDate = (o.orderDate || o.createdAt)?.split('T')[0]
            return orderDate >= startDate && orderDate <= endDate
        })
    }, [orders, startDate, endDate])

    const filteredExpenditures = useMemo(() => {
        return expenditures.filter(e => {
            const expDate = (e.date || e.createdAt)?.split('T')[0]
            return expDate >= startDate && expDate <= endDate
        })
    }, [expenditures, startDate, endDate])

    const purchaseOrders = useDataStore(state => state.purchaseOrders)
    const filteredPurchases = useMemo(() => {
        return purchaseOrders.filter(p => {
            const pDate = (p.date || p.createdAt)?.split('T')[0]
            return pDate >= startDate && pDate <= endDate
        })
    }, [purchaseOrders, startDate, endDate])

    // Update preset dates
    const handlePresetChange = (preset) => {
        setReportPreset(preset)
        const end = new Date().toISOString().split('T')[0]
        let start = new Date()

        if (preset === 'daily') {
            start = new Date()
        } else if (preset === 'weekly') {
            start.setDate(start.getDate() - 7)
        } else if (preset === 'monthly') {
            start.setMonth(start.getMonth() - 1)
        }

        if (preset !== 'custom') {
            setStartDate(start.toISOString().split('T')[0])
            setEndDate(end)
            setShowDatePicker(false)
        } else {
            setShowDatePicker(true)
        }
    }


    // Calculate revenue from filtered orders
    const revenueData = useMemo(() => {
        const daily = {}
        filteredOrders.forEach(order => {
            if (order.status === 'delivered') {
                const date = (order.orderDate || order.createdAt)?.split('T')[0]
                daily[date] = (daily[date] || 0) + order.total
            }
        })
        return Object.entries(daily)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, revenue]) => ({ name: name.split('-').slice(1).join('/'), revenue }))
    }, [filteredOrders])

    // Calculate totals based on filtered data
    const totals = useMemo(() => {
        const totalBottles = filteredOrders.reduce((sum, o) =>
            sum + (o.items?.reduce((s, item) => s + item.qty, 0) || 0), 0)

        const totalRevenue = filteredOrders.reduce((sum, o) =>
            o.status === 'delivered' ? sum + (o.total || 0) : sum, 0)

        const totalExpenses = filteredExpenditures.reduce((sum, exp) => sum + exp.amount, 0)
        const activeCustomers = customers.filter(c => c.status === 'active').length

        return { totalBottles, totalRevenue, totalExpenses, activeCustomers }
    }, [filteredOrders, filteredExpenditures, customers])

    // Transform orders data for bottles chart
    const chartData = useMemo(() => {
        const daily = {}
        filteredOrders.forEach(order => {
            const date = (order.orderDate || order.createdAt)?.split('T')[0]
            const bottles = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0
            if (!daily[date]) {
                daily[date] = { delivered: 0, total: 0 }
            }
            daily[date].total += bottles
            if (order.status === 'delivered') {
                daily[date].delivered += bottles
            }
        })
        return Object.entries(daily)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, data]) => ({
                name: name.split('-').slice(1).join('/'),
                bottles: data.total,
                delivered: data.delivered
            }))
    }, [filteredOrders])

    // Format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const vendors = useDataStore(state => state.vendors)

    const handleExportData = (type, category) => {
        const allData = {
            orders: filteredOrders.map(o => ({
                'Order ID': o.id,
                'Date': o.orderDate || o.createdAt?.split('T')[0],
                'Customer': o.customerName,
                'Total': o.total,
                'Status': o.status,
                'Payment': o.paymentStatus
            })),
            customers: customers.map(c => ({
                'ID': c.id,
                'Name': c.name,
                'Phone': c.phone,
                'Balance': c.currentBalance || 0,
                'Status': c.status
            })),
            vendors: vendors.map(v => ({
                'ID': v.id,
                'Name': v.name,
                'Phone': v.phone,
                'Payable': v.currentBalance || 0,
                'Total Spent': v.totalSpent || 0
            })),
            purchases: filteredPurchases.map(p => ({
                'ID': p.po_id,
                'Invoice': p.invoice_no,
                'Vendor': vendors.find(v => v.uuid === p.vendorUuid)?.name || 'Unknown',
                'Amount': p.amount,
                'Date': p.date
            }))
        }

        if (category === 'all') {
            if (type === 'excel') {
                downloadMultipleAsExcel(allData, `Full_Report_${startDate}_to_${endDate}`)
            } else {
                downloadMultipleAsSQL({
                    orders: filteredOrders,
                    customers: customers,
                    vendors: vendors,
                    purchase_orders: filteredPurchases
                }, `Full_Dump_${startDate}_to_${endDate}`)
            }
        } else {
            const data = allData[category]
            if (type === 'excel') {
                downloadAsExcel(data, `${category}_Report_${startDate}_to_${endDate}`, category)
            } else {
                const tableMap = { orders: 'orders', customers: 'customers', vendors: 'vendors', purchases: 'purchase_orders' }
                const rawDataMap = { orders: filteredOrders, customers: customers, vendors: vendors, purchases: filteredPurchases }
                downloadAsSQL(rawDataMap[category], tableMap[category], `${category}_Dump_${startDate}_to_${endDate}`)
            }
        }
    }
    const summaryStats = [
        {
            label: 'Orders in Range',
            value: filteredOrders.length.toString(),
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
                <div className={styles.rangeSelector}>
                    <button
                        className={`${styles.presetBtn} ${reportPreset === 'daily' ? styles.active : ''}`}
                        onClick={() => handlePresetChange('daily')}
                    >
                        Daily
                    </button>
                    <button
                        className={`${styles.presetBtn} ${reportPreset === 'weekly' ? styles.active : ''}`}
                        onClick={() => handlePresetChange('weekly')}
                    >
                        Weekly
                    </button>
                    <button
                        className={`${styles.presetBtn} ${reportPreset === 'monthly' ? styles.active : ''}`}
                        onClick={() => handlePresetChange('monthly')}
                    >
                        Monthly
                    </button>
                    {showDatePicker ? (
                        <div className={styles.customDates}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.dateInput} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.dateInput} />
                        </div>
                    ) : (
                        <button
                            className={`${styles.presetBtn} ${reportPreset === 'custom' ? styles.active : ''}`}
                            onClick={() => handlePresetChange('custom')}
                        >
                            Custom
                        </button>
                    )}
                </div>
                <div className={styles.actions}>
                    <div className={styles.exportDropdown}>
                        <Button variant="primary" icon={Download} size="sm">
                            Download Data
                            <ChevronDown size={14} style={{ marginLeft: '4px' }} />
                        </Button>
                        <div className={styles.dropdownMenu}>
                            <div className={styles.menuLabel}>Excel (XLSX)</div>
                            <button onClick={() => handleExportData('excel', 'all')}>All Reports (Multi-Sheet)</button>
                            <button onClick={() => handleExportData('excel', 'orders')}>Orders Report</button>
                            <button onClick={() => handleExportData('excel', 'customers')}>Customers List</button>
                            <button onClick={() => handleExportData('excel', 'vendors')}>Vendors List</button>
                            <div className={styles.menuLabel}>SQL Queries</div>
                            <button onClick={() => handleExportData('sql', 'all')}>All Tables (Full Dump)</button>
                            <button onClick={() => handleExportData('sql', 'orders')}>Orders Table</button>
                            <button onClick={() => handleExportData('sql', 'customers')}>Customers Table</button>
                        </div>
                    </div>
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
