import React, { useState, useMemo, useRef } from 'react'
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
    Plus,
    ChevronDown,
    ChevronUp
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
    const [rowActionModal, setRowActionModal] = useState({
        isOpen: false,
        customer: null,
        deliveries: []
    })

    const customers = useDataStore(state => state.customers)
    const users = useDataStore(state => state.users)
    const areas = useDataStore(state => state.areas)
    const products = useDataStore(state => state.products)
    const deliveries = useDataStore(state => state.deliveries) // Subscribe to deliveries for reactivity
    const addDelivery = useDataStore(state => state.addDelivery)
    const updateDelivery = useDataStore(state => state.updateDelivery)
    const getDeliveryForCustomer = useDataStore(state => state.getDeliveryForCustomer)
    const getDeliveriesForCustomer = useDataStore(state => state.getDeliveriesForCustomer) // Fix ReferenceError
    const addOrder = useDataStore(state => state.addOrder)
    const updateOrderStatus = useDataStore(state => state.updateOrderStatus)
    const updateOrder = useDataStore(state => state.updateOrder)
    const updateCustomer = useDataStore(state => state.updateCustomer)
    const deleteOrder = useDataStore(state => state.deleteOrder)
    const deleteDelivery = useDataStore(state => state.deleteDelivery)

    // State for expanded rows
    const [expandedCustomers, setExpandedCustomers] = useState(new Set())
    const autoCloseTimers = useRef({})

    const toggleExpand = (customerId) => {
        setExpandedCustomers(prev => {
            const next = new Set(prev)
            if (next.has(customerId)) {
                next.delete(customerId)
            } else {
                next.add(customerId)
            }
            return next
        })
    }

    const handleRowMouseEnter = (customerId) => {
        if (autoCloseTimers.current[customerId]) {
            clearTimeout(autoCloseTimers.current[customerId])
            delete autoCloseTimers.current[customerId]
        }
    }

    const handleRowMouseLeave = (customerId) => {
        if (expandedCustomers.has(customerId)) {
            autoCloseTimers.current[customerId] = setTimeout(() => {
                setExpandedCustomers(prev => {
                    const next = new Set(prev)
                    next.delete(customerId)
                    return next
                })
            }, 5000) // 5 seconds auto-close
        }
    }

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
            productId: defaultProduct ? defaultProduct.id : '',
            deliveryDate: selectedDate || todayDate
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
            productId: defaultProduct ? defaultProduct.id : '', // Ideally we'd have the product ID from delivery, but current schema doesn't store it. Defaulting.
            deliveryDate: delivery.deliveryDate || selectedDate || todayDate
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
            productId: defaultProduct ? defaultProduct.id : '',
            deliveryDate: selectedDate || todayDate // Use selected filter date as default
        })
        setShowDeliveryModal(true)
    }


    const handleDeliverySubmit = async (e) => {
        e.preventDefault()
        if (!selectedCustomer) return

        const bottlesDelivered = parseInt(deliveryForm.bottlesDelivered)
        const receiveBottles = parseInt(deliveryForm.receiveBottles) || 0
        const submissionDate = deliveryForm.deliveryDate || todayDate

        // Find selected product
        const selectedProduct = products.find(p => p.id === deliveryForm.productId)

        if (!selectedProduct) {
            alert('Please select a product.')
            return
        }

        const unitPrice = selectedProduct.price || 0
        const total = bottlesDelivered * unitPrice

        // Helper function to process submission logic
        const processSubmission = async () => {
            // Update or Create delivery
            if (editingDelivery) {
                // Calculate new total based on edited bottles
                const newTotal = bottlesDelivered * unitPrice

                // Find the original order for this delivery (by date and customer)
                const orders = useDataStore.getState().orders
                const originalOrder = orders.find(o =>
                    o.customerId === selectedCustomer.id &&
                    (o.orderDate === submissionDate || o.createdAt?.startsWith(submissionDate))
                )

                // Debug log to check why it might be failing


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

                } else {
                    // Was likely SKIPPED (so order deleted), now marked delivered again.
                    // We must create a NEW order to register the sale and update balance.

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
                        orderDate: submissionDate,
                        deliveryDate: submissionDate,
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
                    deliveryDate: submissionDate,
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
                    orderDate: submissionDate,  // FIXED: Use orderDate instead of deliveryDate
                    deliveryDate: submissionDate,
                    notes: deliveryForm.notes || null
                })

                // Mark order as delivered immediately
                if (newOrder) {
                    await updateOrderStatus(newOrder.id, 'delivered')
                }

                await addDelivery({
                    customerId: selectedCustomer.id,
                    customerName: selectedCustomer.name,
                    deliveryDate: submissionDate,
                    bottlesDelivered: bottlesDelivered,
                    receiveBottles: receiveBottles,
                    notes: deliveryForm.notes,
                    deliveryDay: selectedDay,
                    status: 'delivered'
                })
            } // End processSubmission
        }

        // Check for duplicates if NEW delivery
        if (!editingDelivery) {
            const existingDeliveries = getDeliveriesForCustomer(selectedCustomer.id, submissionDate)
            if (existingDeliveries.length > 0) {
                setConfirmModal({
                    isOpen: true,
                    title: 'Possible Duplicate',
                    message: `This customer already has ${existingDeliveries.length} delivery(ies) for this date. Add another separate delivery?`,
                    type: 'warning',
                    confirmText: 'Yes, Add Another',
                    onConfirm: async () => {
                        await processSubmission()
                        setConfirmModal(prev => ({ ...prev, isOpen: false }))
                    }
                })
                return
            }
        }

        await processSubmission()

        setShowDeliveryModal(false)
        setSelectedCustomer(null)
        setEditingDelivery(null)
        setDeliveryForm({ bottlesDelivered: '', receiveBottles: '', notes: '', productId: '', deliveryDate: '' })
    }

    const handleSkipDelivery = (customer, deliveryToSkip = null) => {
        setConfirmModal({
            isOpen: true,
            title: 'Skip Customer Delivery',
            message: `Are you sure you want to skip delivery for ${customer.name}? This will remove any existing order for this delivery and revert balance.`,
            type: 'warning',
            confirmText: 'Skip',
            onConfirm: async () => {
                const targetDate = deliveryToSkip?.deliveryDate || todayDate

                // 1. Update/Add Delivery Record
                if (deliveryToSkip) {
                    await updateDelivery(deliveryToSkip.id, {
                        status: 'skipped',
                        bottlesDelivered: 0,
                        receiveBottles: 0,
                        notes: 'Skipped'
                    })
                } else {
                    // Try to find if one exists for today anyway to update instead of add duplicate
                    const existing = getDeliveryForCustomer(customer.id, todayDate)
                    if (existing) {
                        await updateDelivery(existing.id, { status: 'skipped', bottlesDelivered: 0, receiveBottles: 0, notes: 'Skipped' })
                    } else {
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
                }

                // 2. Handle Linked Order Cleanup & Balance Revert
                const orders = useDataStore.getState().orders
                // Find order matching the delivery date
                const originalOrder = orders.find(o =>
                    o.customerId === customer.id &&
                    (o.orderDate === targetDate || o.createdAt?.startsWith(targetDate))
                    // If deliveryToSkip has ID, ideally we link by ID, but we don't have that link. Date is best proxy.
                )

                if (originalOrder) {


                    // Revert balance if it was delivered
                    if (originalOrder.status === 'delivered') {
                        await updateOrderStatus(originalOrder.id, 'pending') // Reverts balance

                    }

                    // Delete order
                    await deleteOrder(originalOrder.id)

                } else {

                }

                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }

    const handleDeleteDelivery = (delivery, customer) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Delivery',
            message: `Are you sure you want to delete this delivery? It will be reverted to 'Pending' status.`,
            type: 'danger',
            confirmText: 'Delete & Revert',
            onConfirm: async () => {
                const orders = useDataStore.getState().orders

                // Enhanced Order Finding Logic
                let orderToDelete = null;

                // 1. Filter candidates by customer
                // Robust: Check matches on YYYY-MM-DD of local time
                const candidates = orders.filter(o => {
                    if (o.customerId !== customer.id) return false;

                    // Direct date match
                    if (o.orderDate === delivery.deliveryDate) return true;

                    // CreatedAt match (first 10 chars)
                    if (o.createdAt && o.createdAt.startsWith(delivery.deliveryDate)) return true;

                    // Fallback: If orderDate is close?
                    return false;
                })

                if (candidates.length === 1) {
                    orderToDelete = candidates[0]
                } else if (candidates.length > 1) {
                    // Ambiguous! Priority: Match exact bottle count
                    orderToDelete = candidates.find(o => o.bottlesDelivered === delivery.bottlesDelivered)

                    // Fallback to last created
                    if (!orderToDelete) {
                        orderToDelete = candidates[candidates.length - 1]
                    }
                }

                if (orderToDelete) {

                    // 1. Revert Balance (if delivered)
                    if (orderToDelete.status === 'delivered') {
                        await updateOrderStatus(orderToDelete.id, 'pending')
                    }
                    // 2. Delete Order
                    await deleteOrder(orderToDelete.id)
                } else {
                    console.warn('Deleting Delivery but NO matching order found. Proceeding to delete Delivery record.')
                }

                // 3. Delete Delivery Record
                await deleteDelivery(delivery.id)
                setConfirmModal(prev => ({ ...prev, isOpen: false }))
            }
        })
    }
    const handleCloseModal = () => {
        setShowDeliveryModal(false)
        setSelectedCustomer(null)
        setDeliveryForm({ bottlesDelivered: '', receiveBottles: '', notes: '', productId: '', deliveryDate: '' })
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
                bottlesDelivered: customer.requiredBottles || 1,
                deliveryDate: selectedDate || todayDate // Reset date to selected when changing customer
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
                                const customerDeliveries = getDeliveriesForCustomer(customer.id, todayDate)
                                const hasMultiple = customerDeliveries.length > 1
                                const isExpanded = expandedCustomers.has(customer.id)

                                // Handlers for auto-close behavior
                                const mouseHandlers = hasMultiple ? {
                                    onMouseEnter: () => handleRowMouseEnter(customer.id),
                                    onMouseLeave: () => handleRowMouseLeave(customer.id)
                                } : {}

                                if (hasMultiple) {
                                    // GROUP VIEW
                                    const totalBottles = customerDeliveries.reduce((sum, d) => sum + (d.bottlesDelivered || 0), 0)
                                    // Status is mixed if different? Or just show "Multiple"
                                    const allDelivered = customerDeliveries.every(d => d.status === 'delivered')
                                    const anySkipped = customerDeliveries.some(d => d.status === 'skipped')
                                    const groupStatus = allDelivered ? 'delivered' : (anySkipped ? 'partial' : 'pending')

                                    return (
                                        <React.Fragment key={customer.id}>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                onClick={() => setRowActionModal({ isOpen: true, customer, deliveries: customerDeliveries })}
                                                {...mouseHandlers}
                                                style={{ cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                            >
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        onClick={(e) => { e.stopPropagation(); toggleExpand(customer.id) }}
                                                    >
                                                        {index + 1}
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.customerCell}>
                                                        <span className={styles.customerName}>{customer.name}</span>
                                                        <span className={styles.customerId} style={{ color: '#fbbf24', fontSize: '0.8em' }}>
                                                            {customerDeliveries.length} Deliveries
                                                        </span>
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
                                                        {totalBottles} (Total)
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`${styles.balance} ${customer.currentBalance > 0 ? styles.hasBalance : ''}`}>
                                                        Rs {customer.currentBalance?.toLocaleString() || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusBadge status="delivered" label="Multiple" size="sm" />
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleAddNewDelivery()
                                                            setSelectedCustomer(customer)
                                                            setDeliveryForm(prev => ({ ...prev, bottlesDelivered: 1 }))
                                                            setShowDeliveryModal(true)
                                                        }}>
                                                            <Plus size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* EXPANDED CHILD ROWS */}
                                            {isExpanded && customerDeliveries.map((delivery, dIndex) => (
                                                <motion.tr
                                                    key={`${customer.id}-${delivery.id || dIndex}`}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className={`${delivery.status === 'delivered' ? styles.deliveredRow : ''} ${delivery.status === 'skipped' ? styles.skippedRow : ''}`}
                                                    {...mouseHandlers}
                                                    onClick={() => setRowActionModal({ isOpen: true, customer, deliveries: [delivery] })}
                                                    style={{ backgroundColor: 'rgba(0,0,0,0.1)', cursor: 'pointer' }} // Dimmer bg for children
                                                >
                                                    <td style={{ paddingLeft: '40px' }}>↳ {dIndex + 1}</td>
                                                    <td colSpan={3} style={{ opacity: 0.7 }}>
                                                        <span style={{ fontSize: '0.9em' }}>Delivery #{dIndex + 1} - {delivery.notes || 'No notes'}</span>
                                                    </td>
                                                    <td>
                                                        <span className={styles.bottleCount}>{delivery.bottlesDelivered}</span>
                                                    </td>
                                                    <td>-</td>{/* Balance is cumulative */}
                                                    <td>
                                                        <StatusBadge status={delivery.status || 'delivered'} size="sm" />
                                                    </td>
                                                    <td>
                                                        <div className={styles.actionBtns}>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.delivered}`}
                                                                title="Edit"
                                                                onClick={(e) => { e.stopPropagation(); handleEditDelivery(customer, delivery) }}
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.skipped}`}
                                                                title="Delete/Skip"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (delivery.status === 'delivered') {
                                                                        handleDeleteDelivery(delivery, customer)
                                                                    } else {
                                                                        handleSkipDelivery(customer, delivery)
                                                                    }
                                                                }}
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </React.Fragment>
                                    )
                                }

                                // SINGLE ROW (Default View) Or Pending
                                const delivery = customerDeliveries[0]
                                const isDelivered = !!delivery
                                const status = delivery?.status || (isDelivered ? 'delivered' : 'pending')

                                return (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`${status === 'delivered' ? styles.deliveredRow : ''} ${status === 'skipped' ? styles.skippedRow : ''}`}
                                        onClick={() => setRowActionModal({ isOpen: true, customer, deliveries: customerDeliveries })}
                                        style={{ cursor: 'pointer' }}
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
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        isDelivered ? handleEditDelivery(customer, delivery) : handleMarkDelivered(customer)
                                                    }}
                                                    disabled={!isDelivered && status === 'skipped'}
                                                >
                                                    {isDelivered && status === 'delivered' ? <Edit size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.skipped}`}
                                                    title={isDelivered && status === 'delivered' ? "Delete/Revert" : "Skip"}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (isDelivered && status === 'delivered') {
                                                            handleDeleteDelivery(delivery, customer)
                                                        } else {
                                                            handleSkipDelivery(customer)
                                                        }
                                                    }}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr >
                                )
                            })}
                        </tbody>
                    </table >

                    {
                        deliveryList.length === 0 && (
                            <div className={styles.emptyState}>
                                <Truck size={48} />
                                <h3>No deliveries scheduled</h3>
                                <p>No deliveries found for the selected criteria.</p>
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
                                <div className={styles.modalBody}>
                                    <div className={styles.formGroup}>
                                        <label>Select Customer</label>
                                        <select
                                            className={styles.formInput}
                                            onChange={handleCustomerSelect}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Choose a customer...</option>
                                            {customers
                                                .filter(c => c.status === 'active')
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name} - {c.address}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <p className={styles.helpText}>Search for a customer to add a delivery</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleDeliverySubmit} className={styles.modalBody}>
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
                                        <label>Delivery Date</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                            <input
                                                type="date"
                                                className={styles.formInput}
                                                style={{ paddingLeft: '35px' }}
                                                value={deliveryForm.deliveryDate}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Select Product</label>
                                        <select
                                            value={deliveryForm.productId}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, productId: e.target.value })}
                                            className={styles.formInput}
                                            required
                                        >
                                            <option value="" disabled>Select Product</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - Rs {p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Bottles Delivered</label>
                                            <input
                                                type="number"
                                                value={deliveryForm.bottlesDelivered}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, bottlesDelivered: e.target.value })}
                                                className={styles.formInput}
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Empty Received</label>
                                            <input
                                                type="number"
                                                value={deliveryForm.receiveBottles}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, receiveBottles: e.target.value })}
                                                className={styles.formInput}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Notes</label>
                                        <textarea
                                            value={deliveryForm.notes}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                                            className={styles.formTextarea}
                                            placeholder="Any delivery notes..."
                                            rows="3"
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
                                        <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                                            Cancel
                                        </button>
                                        <button type="submit" className={styles.submitBtn}>
                                            <CheckCircle size={18} />
                                            Confirm Delivery
                                        </button>
                                        {editingDelivery && (
                                            <button
                                                type="button"
                                                className={styles.cancelBtn}
                                                style={{ marginLeft: 'auto', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                                                onClick={() => {
                                                    handleCloseModal()
                                                    handleDeleteDelivery(editingDelivery, selectedCustomer)
                                                }}
                                            >
                                                <XCircle size={18} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }
            {/* Row Action Modal (Pop-up) */}
            {
                rowActionModal.isOpen && (
                    <div className={styles.modalOverlay} onClick={() => setRowActionModal({ ...rowActionModal, isOpen: false })}>
                        <div className={styles.modalContent} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Actions for {rowActionModal.customer?.name}</h2>
                                <button className={styles.closeBtn} onClick={() => setRowActionModal({ ...rowActionModal, isOpen: false })}>
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className={styles.modalBody} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Button
                                    variant="primary"
                                    icon={Plus}
                                    onClick={() => {
                                        setRowActionModal({ ...rowActionModal, isOpen: false })
                                        handleAddNewDelivery()
                                        setSelectedCustomer(rowActionModal.customer)
                                        setDeliveryForm(prev => ({ ...prev, bottlesDelivered: 1 }))
                                        setShowDeliveryModal(true)
                                    }}
                                >
                                    Add New Delivery
                                </Button>

                                <Button
                                    variant="outline"
                                    icon={XCircle}
                                    onClick={() => {
                                        setRowActionModal({ ...rowActionModal, isOpen: false })
                                        // If single delivery, pass it to skip
                                        const deliveryToSkip = rowActionModal.deliveries?.length === 1 ? rowActionModal.deliveries[0] : null
                                        handleSkipDelivery(rowActionModal.customer, deliveryToSkip)
                                    }}
                                >
                                    Skip Customer
                                </Button>

                                {/* Show Edit button if Single Delivered Delivery */}
                                {rowActionModal.deliveries?.length === 1 && rowActionModal.deliveries[0].status === 'delivered' && (
                                    <Button
                                        variant="secondary"
                                        icon={Edit}
                                        onClick={() => {
                                            setRowActionModal({ ...rowActionModal, isOpen: false })
                                            handleEditDelivery(rowActionModal.customer, rowActionModal.deliveries[0])
                                        }}
                                    >
                                        Edit Delivery
                                    </Button>
                                )}

                                {/* Show Delete button for existing deliveries */}
                                {rowActionModal.deliveries?.length === 1 && (
                                    <Button
                                        variant="danger"
                                        icon={XCircle}
                                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                                        onClick={() => {
                                            setRowActionModal({ ...rowActionModal, isOpen: false })
                                            handleDeleteDelivery(rowActionModal.deliveries[0], rowActionModal.customer)
                                        }}
                                    >
                                        Delete Delivery
                                    </Button>
                                )}

                                {/* Show Mark Delivered button if no deliveries (pending) */}
                                {rowActionModal.deliveries?.length === 0 && (
                                    <Button
                                        variant="primary"
                                        icon={CheckCircle}
                                        onClick={() => {
                                            setRowActionModal({ ...rowActionModal, isOpen: false })
                                            handleMarkDelivered(rowActionModal.customer)
                                        }}
                                    >
                                        Mark Delivered
                                    </Button>
                                )}
                            </div>
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
