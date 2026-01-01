import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Truck,
    MapPin,
    Calendar,
    User,
    Phone,
    Droplets,
    Printer,
    Filter,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Delivery.module.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Delivery() {
    const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [selectedArea, setSelectedArea] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const customers = useDataStore(state => state.customers)
    const users = useDataStore(state => state.users)
    const areas = useDataStore(state => state.areas)

    // Get employees (staff)
    const employees = users.filter(u => u.role === 'staff' || u.role === 'admin')

    // Filter customers based on delivery day
    const deliveryList = customers.filter(c => {
        const matchesDay = !c.deliveryDays || c.deliveryDays.length === 0 || c.deliveryDays.includes(selectedDay)
        const matchesArea = !selectedArea || c.areaId === selectedArea
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            c.address.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesDay && matchesArea && matchesSearch && c.status === 'active'
    })

    // Calculate totals
    const totals = {
        customers: deliveryList.length,
        requiredBottles: deliveryList.reduce((sum, c) => sum + (c.requiredBottles || 1), 0),
        outstanding: deliveryList.reduce((sum, c) => sum + (c.currentBalance || 0), 0)
    }

    const today = new Date().toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className={styles.delivery}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>
                        <Truck size={28} />
                        Delivery Routes
                    </h1>
                    <span className={styles.date}>{today}</span>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" icon={Printer}>
                        Print Route Sheet
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.daySelector}>
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day}
                            className={`${styles.dayBtn} ${selectedDay === day ? styles.active : ''}`}
                            onClick={() => setSelectedDay(day)}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.filterSelect}
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.uuid}>{emp.name}</option>
                        ))}
                    </select>

                    <select
                        className={styles.filterSelect}
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                    >
                        <option value="">All Areas</option>
                        {areas.map(area => (
                            <option key={area.id} value={area.uuid}>{area.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard}>
                    <User size={20} className={styles.statIcon} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{totals.customers}</span>
                        <span className={styles.statLabel}>Customers</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Droplets size={20} className={`${styles.statIcon} ${styles.cyan}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.cyan}`}>{totals.requiredBottles}</span>
                        <span className={styles.statLabel}>Total Bottles</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Clock size={20} className={`${styles.statIcon} ${styles.warning}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.warning}`}>Rs {totals.outstanding.toLocaleString()}</span>
                        <span className={styles.statLabel}>Outstanding</span>
                    </div>
                </GlassCard>
            </div>

            {/* Delivery List */}
            <GlassCard className={styles.deliveryList}>
                <div className={styles.listHeader}>
                    <h3>{selectedDay} Delivery List</h3>
                    <span className={styles.listCount}>{deliveryList.length} customers</span>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th>Address</th>
                                <th>Contact</th>
                                <th>Req. Bottles</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryList.map((customer, index) => (
                                <motion.tr
                                    key={customer.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.customerCell}>
                                            <span className={styles.customerName}>{customer.name}</span>
                                            <span className={styles.customerId}>{customer.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.addressCell}>
                                            <MapPin size={12} />
                                            <span>{customer.address}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.phoneCell}>
                                            <Phone size={12} />
                                            <span>{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.bottleCount}>
                                            {customer.requiredBottles || 1}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.balance} ${customer.currentBalance > 0 ? styles.hasBalance : ''}`}>
                                            Rs {customer.currentBalance?.toLocaleString() || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge status="pending" size="sm" />
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button className={`${styles.actionBtn} ${styles.delivered}`} title="Mark Delivered">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.skipped}`} title="Skip">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {deliveryList.length === 0 && (
                        <div className={styles.emptyState}>
                            <Truck size={48} />
                            <h3>No deliveries scheduled</h3>
                            <p>No customers found for {selectedDay}</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    )
}

export default Delivery
