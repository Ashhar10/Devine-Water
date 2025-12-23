import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Calendar, TrendingUp, Droplets, DollarSign, Users } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import DataChart from '../../components/charts/DataChart'
import styles from './Reports.module.css'

// Mock data for different time periods
const monthlyData = [
    { name: 'Jan', water: 42500, revenue: 425000, customers: 1180 },
    { name: 'Feb', water: 45200, revenue: 452000, customers: 1195 },
    { name: 'Mar', water: 48900, revenue: 489000, customers: 1210 },
    { name: 'Apr', water: 46300, revenue: 463000, customers: 1225 },
    { name: 'May', water: 52100, revenue: 521000, customers: 1235 },
    { name: 'Jun', water: 55800, revenue: 558000, customers: 1247 },
]

const yearlyData = [
    { name: '2020', water: 480000, revenue: 4800000, customers: 980 },
    { name: '2021', water: 520000, revenue: 5200000, customers: 1050 },
    { name: '2022', water: 580000, revenue: 5800000, customers: 1120 },
    { name: '2023', water: 620000, revenue: 6200000, customers: 1180 },
    { name: '2024', water: 550000, revenue: 5500000, customers: 1247 },
]

function Reports() {
    const [timeRange, setTimeRange] = useState('monthly')
    const data = timeRange === 'monthly' ? monthlyData : yearlyData

    const summaryStats = [
        {
            label: 'Total Water Produced',
            value: timeRange === 'monthly' ? '290.8K L' : '2.75M L',
            change: '+12.5%',
            icon: Droplets,
            color: 'cyan'
        },
        {
            label: 'Total Revenue',
            value: timeRange === 'monthly' ? 'Rs 2.91M' : 'Rs 27.5M',
            change: '+18.2%',
            icon: DollarSign,
            color: 'income'
        },
        {
            label: 'Customer Growth',
            value: timeRange === 'monthly' ? '+67' : '+267',
            change: '+5.7%',
            icon: Users,
            color: 'success'
        },
    ]

    return (
        <div className={styles.reports}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.timeToggle}>
                    <button
                        className={`${styles.toggleBtn} ${timeRange === 'monthly' ? styles.active : ''}`}
                        onClick={() => setTimeRange('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${timeRange === 'yearly' ? styles.active : ''}`}
                        onClick={() => setTimeRange('yearly')}
                    >
                        Yearly
                    </button>
                </div>
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
                                <span className={styles.statChange}>{stat.change}</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </section>

            {/* Main Chart */}
            <section className={styles.mainChart}>
                <DataChart
                    title="Water Production Overview"
                    subtitle={`${timeRange === 'monthly' ? 'Last 6 months' : 'Last 5 years'} performance`}
                    data={data}
                    type="area"
                    dataKeys={['water']}
                    colors={['#00d4ff']}
                    height={350}
                />
            </section>

            {/* Additional Charts */}
            <section className={styles.chartsGrid}>
                <DataChart
                    title="Revenue Trend"
                    subtitle="Financial performance"
                    data={data}
                    type="line"
                    dataKeys={['revenue']}
                    colors={['#00e5a0']}
                    height={250}
                />
                <DataChart
                    title="Customer Growth"
                    subtitle="Active customers over time"
                    data={data}
                    type="bar"
                    dataKeys={['customers']}
                    colors={['#00ffc8']}
                    height={250}
                />
            </section>
        </div>
    )
}

export default Reports
