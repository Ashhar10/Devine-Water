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
    XCircle,
    Edit
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import styles from './Delivery.module.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Delivery() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    // Derive selectedDay from selectedDate
    const dateObj = new Date(selectedDate)
    const dayIndex = dateObj.getDay()
    const selectedDay = DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1]

    // Use selectedDate as the "today" for all checks
    const todayDate = selectedDate

    // const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1])
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [selectedArea, setSelectedArea] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showDeliveryModal, setShowDeliveryModal] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [editingDelivery, setEditingDelivery] = useState(null)
    const [deliveryForm, setDeliveryForm] = useState({
        bottlesDelivered: '',
        receiveBottles: '',
        notes: '',
        productId: ''
    })
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    })

    const customers = useDataStore(state => state.customers)
    const users = useDataStore(state => state.users)
    const areas = useDataStore(state => state.areas)
    const products = useDataStore(state => state.products)
    const addDelivery = useDataStore(state => state.addDelivery)
    const updateDelivery = useDataStore(state => state.updateDelivery)
    const getDeliveryForCustomer = useDataStore(state => state.getDeliveryForCustomer)
    const addOrder = useDataStore(state => state.addOrder)

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

    // Sort: undelivered first, then delivered, then skipped
    const sortedDeliveryList = [...deliveryList].sort((a, b) => {
        const aDelivery = getDeliveryForCustomer(a.id, todayDate)
        const bDelivery = getDeliveryForCustomer(b.id, todayDate)

        const aStatus = aDelivery ? (aDelivery.status || 'delivered') : 'pending'
        const bStatus = bDelivery ? (bDelivery.status || 'delivered') : 'pending'

        // Priority order: pending (0), delivered (1), skipped (2)
        const getPriority = (status) => {
            if (status === 'pending') return 0
            if (status === 'delivered') return 1
            if (status === 'skipped') return 2
            return 3
        }

        return getPriority(aStatus) - getPriority(bStatus)
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

    const handleMarkDelivered = (customer) => {
        // Default to first water product or first available
        const defaultProduct = products.find(p => p.name.toLowerCase().includes('water')) || products[0]

        setSelectedCustomer(customer)
        setEditingDelivery(null)
        setDeliveryForm({
            bottlesDelivered: customer.requiredBottles || 1,
            receiveBottles: 0,
            notes: '',
            productId: defaultProduct ? defaultProduct.id : ''
        })
        setShowDeliveryModal(true)
    }

    const handleEditDelivery = (customer, delivery) => {
        // Try to find the product used in previous order, or default
        const defaultProduct = products.find(p => p.name.toLowerCase().includes('water')) || products[0]

        setSelectedCustomer(customer)
        setEditingDelivery(delivery)
        setDeliveryForm({
            bottlesDelivered: delivery.bottlesDelivered,
            receiveBottles: delivery.receiveBottles,
            notes: delivery.notes || '',
            productId: defaultProduct ? defaultProduct.id : '' // Ideally we'd have the product ID from delivery, but current schema doesn't store it. Defaulting.
        })
        setShowDeliveryModal(true)
    }

    const handleDeliverySubmit = async (e) => {
        e.preventDefault()
        if (!selectedCustomer) return

        const bottlesDelivered = parseInt(deliveryForm.bottlesDelivered)
        const receiveBottles = parseInt(deliveryForm.receiveBottles) || 0

        // Find selected product
        const selectedProduct = products.find(p => p.id === deliveryForm.productId)

        if (!selectedProduct) {
            alert('Please select a product.')
            return
        }

        const unitPrice = selectedProduct.price || 0
        const total = bottlesDelivered * unitPrice

        // Update or Create delivery
        if (editingDelivery) {
            await updateDelivery(editingDelivery.id, {
                bottlesDelivered: bottlesDelivered,
                receiveBottles: receiveBottles,
                notes: deliveryForm.notes,
                status: 'delivered'
            })
        } else {
            // Only create order if it's a new delivery
            await addOrder({
                customerId: selectedCustomer.id,
                customerUuid: selectedCustomer.uuid,
                customerName: selectedCustomer.name,
                customerPhone: selectedCustomer.phone,
                customerAddress: selectedCustomer.address,
                items: [{
                    productId: selectedProduct.uuid, // Use UUID for DB link
                    productName: selectedProduct.name,
                    quantity: bottlesDelivered,
                    price: unitPrice
                }],
                total: total,
                bottlesDelivered: bottlesDelivered,
                receiveBottles: receiveBottles,
                deliveryDate: todayDate,
                notes: deliveryForm.notes || null
            })

            await addDelivery({
                customerId: selectedCustomer.id,
                customerName: selectedCustomer.name,
                deliveryDate: todayDate,
                bottlesDelivered: bottlesDelivered,
                receiveBottles: receiveBottles,
                notes: deliveryForm.notes,
                deliveryDay: selectedDay,
                status: 'delivered'
            })
        }

        setShowDeliveryModal(false)
        setSelectedCustomer(null)
        setEditingDelivery(null)
        setDeliveryForm({ bottlesDelivered: '', receiveBottles: '', notes: '', productId: '' })
    }

    const handleSkipDelivery = (customer) => {
        setConfirmModal({
            isOpen: true,
            title: 'Skip Customer Delivery',
            message: `Are you sure you want to skip delivery for ${customer.name}? This will mark it as skipped, not delete it.`,
            type: 'warning',
            confirmText: 'Skip',
            onConfirm: async () => {
                await addDelivery({
                    customerId: customer.id,
                    customerName: customer.name,
                    deliveryDate: todayDate,
                    bottlesDelivered: 0,
                    receiveBottles: 0,
                    notes: 'Skipped',
                    deliveryDay: selectedDay,
                    status: 'skipped'
                })
            }
        })
    }

    const handleCloseModal = () => {
        setShowDeliveryModal(false)
        setSelectedCustomer(null)
        setDeliveryForm({ bottlesDelivered: '', receiveBottles: '', notes: '', productId: '' })
    }

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
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <div className={styles.dateFilter}>
                        <Calendar size={18} className={styles.filterIcon} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={styles.dateInput}
                        />
                        <span className={styles.dayLabel}>{selectedDay}</span>
                    </div>

                    <div className={styles.selectWrapper}>
                        <MapPin size={18} className={styles.filterIcon} />
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                        >
                            <option value="">All Areas</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <User size={18} className={styles.filterIcon} />
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">All Delivery Staff</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
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
                            {sortedDeliveryList.map((customer, index) => {
                                const delivery = getDeliveryForCustomer(customer.id, todayDate)
                                const isDelivered = !!delivery
                                const status = delivery?.status || (isDelivered ? 'delivered' : 'pending')

                                return (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`${status === 'delivered' ? styles.deliveredRow : ''} ${status === 'skipped' ? styles.skippedRow : ''}`}
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
                                                {isDelivered ? delivery.bottlesDelivered : (customer.requiredBottles || 1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.balance} ${customer.currentBalance > 0 ? styles.hasBalance : ''}`}>
                                                Rs {customer.currentBalance?.toLocaleString() || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={status} size="sm" />
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.delivered}`}
                                                    title={isDelivered ? "Edit Delivery" : "Mark Delivered"}
                                                    onClick={() => isDelivered ? handleEditDelivery(customer, delivery) : handleMarkDelivered(customer)}
                                                >
                                                    {isDelivered && status === 'delivered' ? <Edit size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.skipped}`}
                                                    title="Skip"
                                                    onClick={() => handleSkipDelivery(customer)}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )
                            })}
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

            {/* Delivery Modal */}
            {showDeliveryModal && selectedCustomer && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingDelivery ? 'Edit Delivery' : 'Mark Delivery'}</h2>
                            <button className={styles.closeBtn} onClick={handleCloseModal}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleDeliverySubmit} className={styles.deliveryForm}>
                            <div className={styles.customerInfo}>
                                <div className={styles.infoRow}>
                                    <User size={18} />
                                    <div>
                                        <span className={styles.infoLabel}>Customer</span>
                                        <span className={styles.infoValue}>{selectedCustomer.name}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <MapPin size={18} />
                                    <div>
                                        <span className={styles.infoLabel}>Address</span>
                                        <span className={styles.infoValue}>{selectedCustomer.address}</span>
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <Phone size={18} />
                                    <div>
                                        <span className={styles.infoLabel}>Contact</span>
                                        <span className={styles.infoValue}>{selectedCustomer.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Select Product</label>
                                <select
                                    value={deliveryForm.productId}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, productId: e.target.value })}
                                    className={styles.formSelect}
                                    required
                                >
                                    <option value="">Select Product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Rs {p.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Bottles Delivered</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={deliveryForm.bottlesDelivered}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, bottlesDelivered: e.target.value })}
                                    required
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Receive Bottles (Empty Returns)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={deliveryForm.receiveBottles}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, receiveBottles: e.target.value })}
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Notes (Optional)</label>
                                <textarea
                                    value={deliveryForm.notes}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                                    className={styles.formTextarea}
                                    rows="3"
                                    placeholder="Any additional notes..."
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    <CheckCircle size={18} />
                                    Confirm Delivery
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div>
    )
}

export default Delivery
