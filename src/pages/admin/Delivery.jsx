import { useState, useMemo } from 'react'
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
    Edit,
    Plus
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
    const deliveries = useDataStore(state => state.deliveries) // Subscribe to deliveries for reactivity
    const addDelivery = useDataStore(state => state.addDelivery)
    const updateDelivery = useDataStore(state => state.updateDelivery)
    const getDeliveryForCustomer = useDataStore(state => state.getDeliveryForCustomer)
    const addOrder = useDataStore(state => state.addOrder)
    const updateOrderStatus = useDataStore(state => state.updateOrderStatus)
    const updateOrder = useDataStore(state => state.updateOrder)
    const updateCustomer = useDataStore(state => state.updateCustomer)
    const deleteOrder = useDataStore(state => state.deleteOrder)

    // Calculate delivery total in real-time
    const deliveryTotal = useMemo(() => {
        const selectedProduct = products.find(p => p.id === deliveryForm.productId)
        if (!selectedProduct || !deliveryForm.bottlesDelivered) return 0
        return parseInt(deliveryForm.bottlesDelivered) * selectedProduct.price
    }, [deliveryForm.productId, deliveryForm.bottlesDelivered, products])

    // Get employees (staff)
    const employees = users.filter(u => u.role === 'staff' || u.role === 'admin')

    // Filter customers based on delivery day
    const deliveryList = customers.filter(c => {
        // Check if this customer actually HAS a delivery today (regardless of schedule)
        const hasDeliveryToday = deliveries.some(d => d.customerId === c.id && d.deliveryDate === todayDate)

        const matchesDay = !c.deliveryDays || c.deliveryDays.length === 0 || c.deliveryDays.includes(selectedDay)
        const matchesArea = !selectedArea || c.areaId === selectedArea
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            c.address.toLowerCase().includes(searchTerm.toLowerCase())

        // Show if: (Matches Scheduled Day OR Has Manual Delivery) AND Matches Search AND Active
        // Note: We keep Area filter strict for now to avoid clutter, but usually manual delivery implies we want to see it.
        // Let's make "Has Delivery Today" override Area filter too? 
        // No, let's keep area filter strict so they can still filter down. 
        // BUT, if I just added a delivery for someone in another area, I might want to see it?
        // User request: "add delivery so it add that delivery to the particular date on the delivery section"
        // Safest bet: If has delivery today, show it even if Area doesn't match? 
        // No, that breaks filtering. Let's stick to Area being a hard filter if set.

        return (matchesDay || hasDeliveryToday) && matchesArea && matchesSearch && c.status === 'active'
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

    // Calculate totals for the selected date only (excluding skipped deliveries)
    const totals = {
        // Only count customers who were delivered to (not skipped)
        customers: deliveryList.filter(c => {
            const delivery = getDeliveryForCustomer(c.id, todayDate)
            return delivery?.status === 'delivered'
        }).length,
        // Count actual bottles delivered on this date (excluding skipped)
        requiredBottles: deliveryList.reduce((sum, c) => {
            const delivery = getDeliveryForCustomer(c.id, todayDate)
            // Only count if delivered (not skipped or pending)
            if (delivery?.status === 'delivered') {
                return sum + (delivery.bottlesDelivered || 0)
            }
            // If no delivery yet (pending), count required bottles
            if (!delivery) {
                return sum + (c.requiredBottles || 1)
            }
            // If skipped, don't count
            return sum
        }, 0),
        // Sum outstanding balance for ALL customers in the list (requested by user)
        outstanding: deliveryList.reduce((sum, c) => sum + (c.currentBalance || 0), 0),

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

    const handleAddNewDelivery = () => {
        const defaultProduct = products.find(p => p.name.toLowerCase().includes('water')) || products[0]

        setSelectedCustomer(null)
        setEditingDelivery(null)
        setDeliveryForm({
            bottlesDelivered: 1,
            receiveBottles: 0,
            notes: '',
            productId: defaultProduct ? defaultProduct.id : ''
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
            // Calculate new total based on edited bottles
            const newTotal = bottlesDelivered * unitPrice

            // Find the original order for this delivery (by date and customer)
            const orders = useDataStore.getState().orders
            const originalOrder = orders.find(o =>
                o.customerId === selectedCustomer.id &&
                (o.orderDate === todayDate || o.createdAt?.startsWith(todayDate))
            )

            // Debug log to check why it might be failing
            console.log('Editing Delivery - Found Order:', originalOrder, { customerId: selectedCustomer.id, date: todayDate })

            if (originalOrder) {
                // Update the order total
                // Note: Balance update is now handled automatically in dataStore's updateOrder
                // Prepare items for update (crucial for DB persistence of total)
                const updatedItems = [{
                    productId: selectedProduct.uuid || selectedProduct.id,
                    productName: selectedProduct.name,
                    qty: bottlesDelivered,
                    price: unitPrice
                }]

                await updateOrder(originalOrder.id, {
                    total: newTotal,
                    items: updatedItems,
                    bottlesDelivered: bottlesDelivered,
                    receiveBottles: receiveBottles,
                    notes: deliveryForm.notes || null,
                    customerId: selectedCustomer.id // Ensure balance update logic has customerId
                })
                console.log('Order updated from delivery page')
            } else {
                // Was likely SKIPPED (so order deleted), now marked delivered again.
                // We must create a NEW order to register the sale and update balance.
                console.log('Editing Delivery - No Order Found (Likely Skipped). Creating new order.')
                const newOrder = await addOrder({
                    customerId: selectedCustomer.id,
                    customerUuid: selectedCustomer.uuid,
                    customerName: selectedCustomer.name,
                    customerPhone: selectedCustomer.phone,
                    customerAddress: selectedCustomer.address,
                    items: [{
                        productId: selectedProduct.uuid,
                        productName: selectedProduct.name,
                        quantity: bottlesDelivered,
                        price: unitPrice
                    }],
                    total: newTotal,
                    bottlesDelivered: bottlesDelivered,
                    receiveBottles: receiveBottles,
                    orderDate: todayDate,
                    deliveryDate: todayDate,
                    notes: deliveryForm.notes || null
                })

                // Immediately mark as delivered to trigger balance update
                if (newOrder) {
                    await updateOrderStatus(newOrder.id, 'delivered')
                }
            }

            // Update delivery record
            await updateDelivery(editingDelivery.id, {
                bottlesDelivered: bottlesDelivered,
                receiveBottles: receiveBottles,
                notes: deliveryForm.notes,
                status: 'delivered'
            })
        } else {
            // Create order as DELIVERED (since we're marking it delivered in delivery section)
            const newOrder = await addOrder({
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
                orderDate: todayDate,  // FIXED: Use orderDate instead of deliveryDate
                deliveryDate: todayDate,
                notes: deliveryForm.notes || null
            })

            // Mark order as delivered immediately
            if (newOrder) {
                await updateOrderStatus(newOrder.id, 'delivered')
            }

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
            message: `Are you sure you want to skip delivery for ${customer.name}? This will remove any existing order for today and revert balance.`,
            type: 'warning',
            confirmText: 'Skip',
            onConfirm: async () => {
                const existingDelivery = getDeliveryForCustomer(customer.id, todayDate)

                if (existingDelivery) {
                    // Update existing delivery to skipped
                    await updateDelivery(existingDelivery.id, {
                        status: 'skipped',
                        bottlesDelivered: 0,
                        receiveBottles: 0,
                        notes: 'Skipped'
                    })
                } else {
                    // New skipped delivery
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

                // Handle Linked Order Cleanup
                const orders = useDataStore.getState().orders
                // Find ANY order for this customer today
                const originalOrder = orders.find(o =>
                    o.customerId === customer.id &&
                    o.orderDate === todayDate
                )

                if (originalOrder) {
                    console.log('Skipping delivery. Cleaning up order:', originalOrder)

                    // 1. If delivered, we MUST revert balance first
                    if (originalOrder.status === 'delivered') {
                        await updateOrderStatus(originalOrder.id, 'pending')
                        console.log('Order status reverted to pending (Balance Restored)')
                    }

                    // 2. Delete the order to remove bottle counts from Dashboard stats
                    await deleteOrder(originalOrder.id)
                    console.log('Order deleted to clear stats')
                }
            }
        })
    }
    const handleCloseModal = () => {
        setShowDeliveryModal(false)
        setSelectedCustomer(null)
        setDeliveryForm({ bottlesDelivered: '', receiveBottles: '', notes: '', productId: '' })
    }

    // Handle customer selection in modal
    const handleCustomerSelect = (e) => {
        const customerId = e.target.value
        const customer = customers.find(c => c.id === customerId)
        if (customer) {
            setSelectedCustomer(customer)
            // Pre-fill form with customer preferences if any (like required bottles)
            setDeliveryForm(prev => ({
                ...prev,
                bottlesDelivered: customer.requiredBottles || 1
            }))
        }
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
                    <Button variant="primary" icon={Plus} onClick={handleAddNewDelivery}>
                        Add Delivery
                    </Button>
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
                                                    disabled={!isDelivered && status === 'skipped'}
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
                                    </motion.tr >
                                )
                            })}
                        </tbody >
                    </table >

                    {
                        deliveryList.length === 0 && (
                            <div className={styles.emptyState}>
                                <Truck size={48} />
                                <h3>No deliveries scheduled</h3>
                                <p>No customers found for {selectedDay}</p>
                            </div>
                        )
                    }
                </div >
            </GlassCard >

            {/* Delivery Modal */}
            {
                showDeliveryModal && (
                    <div className={styles.modalOverlay} onClick={handleCloseModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{editingDelivery ? 'Edit Delivery' : 'Mark Delivery'}</h2>
                                <button className={styles.closeBtn} onClick={handleCloseModal}>
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {!selectedCustomer ? (
                                // CUSTOMER SELECTION STEP
                                <div className={styles.customerSelection}>
                                    <div className={styles.formGroup}>
                                        <label>Select Customer</label>
                                        <select
                                            className={styles.formSelect}
                                            onChange={handleCustomerSelect}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Choose a customer...</option>
                                            {customers.filter(c => c.status === 'active').sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.address})
                                                </option>
                                            ))}
                                        </select>
                                        <p className={styles.helpText}>Search for a customer to add a delivery</p>
                                    </div>
                                </div>
                            ) : (
                                // DELIVERY DETAILS FORM
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

                                    {/* Total Display */}
                                    {deliveryForm.productId && deliveryForm.bottlesDelivered && (
                                        <div className={styles.totalSection}>
                                            <div className={styles.totalRow}>
                                                <span className={styles.totalLabel}>Total Amount:</span>
                                                <span className={styles.totalAmount}>Rs {deliveryTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

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
                            )}
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />
        </div >
    )
}

export default Delivery
