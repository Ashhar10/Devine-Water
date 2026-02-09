import { useState, useEffect, useMemo, useTransition } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Filter, Plus, MoreHorizontal, FileText, Download,
    Trash2, Edit, CheckCircle, Clock, AlertCircle, Calendar,
    User, Printer, ChevronLeft, ChevronRight, Share2, X, MessageCircle
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { downloadAsExcel, downloadAsSQL } from '../../utils/exportUtils'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import styles from './OrdersBilling.module.css'
import { RotateCcw } from 'lucide-react'

const CACHE_KEY = 'devine_order_form_cache'
const getEmptyOrderData = () => ({
    customerId: '',
    items: [{ productId: '', quantity: 1, returnQuantity: 0 }],
    salesmanId: '',
    discount: 0,
    notes: '',
    orderDate: new Date().toISOString().split('T')[0]
})

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const FILTER_MODES = {
    MONTH: 'month',
    WEEK: 'week',
    CUSTOM: 'custom'
}

function OrdersBilling() {

    const location = useLocation()
    const initialTab = location.state?.tab || 'all'

    const [expandedOrder, setExpandedOrder] = useState(null)
    const [isPendingTabSwitch, startTransition] = useTransition()
    const [activeTab, _setActiveTab] = useState(initialTab)  // 'delivered', 'pending', 'all'

    // Update activeTab if location.state changes
    useEffect(() => {
        if (location.state?.tab) {
            _setActiveTab(location.state.tab)
        }
    }, [location.state?.tab])

    const setActiveTab = (tab) => {
        startTransition(() => {
            _setActiveTab(tab)
        })
    }

    const [filterStatus, setFilterStatus] = useState('all')
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingOrderId, setEditingOrderId] = useState(null)
    const [orderToDelete, setOrderToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)

    // Date Filter State
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

    const selectedDate = useMemo(() => new Date().toISOString().split('T')[0], [])
    const [newOrder, setNewOrder] = useState(getEmptyOrderData())

    const currentUser = useDataStore(state => state.currentUser) // Add this line
    const orders = useDataStore(state => state.orders)

    const customers = useDataStore(state => state.customers)
    const products = useDataStore(state => state.products)
    const users = useDataStore(state => state.users)
    const addOrder = useDataStore(state => state.addOrder)
    const updateOrder = useDataStore(state => state.updateOrder)
    const deleteOrder = useDataStore(state => state.deleteOrder)
    const updateOrderStatus = useDataStore(state => state.updateOrderStatus)
    const updateOrderPayment = useDataStore(state => state.updateOrderPayment)
    const deliveries = useDataStore(state => state.deliveries) // Added deliveries for skipped tab

    // Derive selectedDay from selectedDate correctly
    const selectedDay = useMemo(() => {
        const dateObj = new Date(selectedDate)
        const dayIndex = dateObj.getDay()
        // JS getDay(): 0 (Sun), 1 (Mon), 2 (Tue), 3 (Wed), 4 (Thu), 5 (Fri), 6 (Sat)
        // DAYS_OF_WEEK: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const mapping = [6, 0, 1, 2, 3, 4, 5] // Map Sun->6, Mon->0, etc.
        return DAYS_OF_WEEK[mapping[dayIndex]]
    }, [selectedDate])



    // Get salesmen (staff/admin) - Memoized
    const salesmen = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'staff'), [users])

    // Draft persistence effects
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && !showNewOrderModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.customerId || parsed.items?.some(i => i.productId)) {
                    setNewOrder(parsed)
                }
            } catch (error) {
                localStorage.removeItem(CACHE_KEY)
            }
        }
    }, [showNewOrderModal])

    useEffect(() => {
        if (showNewOrderModal && !isEditing) {
            const hasData = newOrder.customerId || newOrder.items?.some(i => i.productId) || newOrder.notes
            if (hasData) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(newOrder))
            }
        }
    }, [newOrder, showNewOrderModal, isEditing])

    const clearDraft = () => {
        localStorage.removeItem(CACHE_KEY)
        setNewOrder(getEmptyOrderData())
    }

    const resetForm = () => {
        setShowNewOrderModal(false)
        setIsEditing(false)
        setEditingOrderId(null)
        setNewOrder(getEmptyOrderData())
    }


    // Get selected product for price calculation - Memoized
    // Calculate Subtotal for all items
    const calculateSubtotal = () => {
        return newOrder.items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId)
            return sum + (product ? product.price * (parseInt(item.quantity) || 0) : 0)
        }, 0)
    }

    // Filter by tab with date filtering for pending/delivered (using selected date) - Memoized
    const filteredOrders = useMemo(() => {
        const { start, end } = dateRange
        return orders
            .filter(o => {
                const date = o.orderDate ? new Date(o.orderDate) : new Date(o.createdAt)
                const isWithinRange = date >= start && date <= end

                if (!isWithinRange) return false

                if (activeTab === 'delivered') {
                    return o.status === 'delivered'
                }
                if (activeTab === 'pending') {
                    return o.status === 'pending'
                }
                if (activeTab === 'customer') {
                    // Orders placed by customers directly (salesmanId is null)
                    return o.salesmanId === null || o.salesmanId === undefined || o.salesmanId === ''
                }
                return true
            })
            .filter(o => filterStatus === 'all' || o.status === filterStatus)
            .filter(o =>
                o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
    }, [orders, activeTab, dateRange, filterStatus, searchTerm])

    // Memoize Pending Items for the selected range - Optimized
    const { pendingItems, skippedItems } = useMemo(() => {
        if (activeTab !== 'pending') return { pendingItems: [], skippedItems: [] }

        const { start, end } = dateRange
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // For scheduling context, we use TODAY if it's within range, otherwise we use the START of the range
        const focusDate = (today >= start && today <= end) ? new Date() : start
        const focusDateStr = focusDate.toISOString().split('T')[0]

        const focusDayIndex = focusDate.getDay()
        const mapping = [6, 0, 1, 2, 3, 4, 5]
        const focusDay = DAYS_OF_WEEK[mapping[focusDayIndex]]

        const scheduledCustomers = customers.filter(c => {
            const hasDeliveryInFocus = deliveries.some(d =>
                d.customerId === c.id &&
                (d.deliveryDate === focusDateStr || d.deliveryDate?.startsWith(focusDateStr))
            );
            const matchesDay = !c.deliveryDays || c.deliveryDays.length === 0 ||
                c.deliveryDays.some(day => day.toLowerCase() === focusDay.toLowerCase());
            return (matchesDay || hasDeliveryInFocus) && c.status === 'active';
        });

        const pItems = [];
        scheduledCustomers.forEach(customer => {
            const customerDeliveries = deliveries.filter(d =>
                d.customerId === customer.id &&
                (d.deliveryDate === focusDateStr || d.deliveryDate?.startsWith(focusDateStr))
            );

            if (customerDeliveries.length === 0) {
                pItems.push({
                    id: `scheduled-${customer.id}`,
                    customerName: customer.name,
                    notes: `Scheduled for ${focusDate.toLocaleDateString()}`,
                    status: 'pending'
                });
            } else {
                customerDeliveries.forEach(d => {
                    if (d.status === 'pending') {
                        pItems.push({
                            id: d.id,
                            customerName: d.customerName || customer.name,
                            notes: d.notes || 'Manual delivery',
                            status: 'pending'
                        });
                    }
                });
            }
        });

        // Skipped items now respect the WHOLE range
        const sItems = deliveries.filter(d =>
            d.status === 'skipped' &&
            new Date(d.deliveryDate) >= start && new Date(d.deliveryDate) <= end
        );

        return { pendingItems: pItems, skippedItems: sItems };
    }, [activeTab, customers, deliveries, dateRange])




    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    const handleCreateOrder = (e) => {
        e.preventDefault()
        const customer = customers.find(c => c.id === newOrder.customerId)
        if (!customer) return

        // Filter valid items
        const validItems = newOrder.items.filter(item => item.productId && item.quantity > 0)
        if (validItems.length === 0) {
            alert("Please add at least one valid product.")
            return
        }

        const itemsPayload = validItems.map(item => {
            const product = products.find(p => p.id === item.productId)
            return {
                name: product.name,
                productId: product.uuid,
                qty: parseInt(item.quantity),
                returnQty: parseInt(item.returnQuantity) || 0,
                price: product.price
            }
        })

        const subtotal = calculateSubtotal()
        const total = subtotal - (parseFloat(newOrder.discount) || 0)

        if (isEditing && editingOrderId) {
            updateOrder(editingOrderId, {
                customerId: newOrder.customerId,
                salesmanId: newOrder.salesmanId || null,
                orderDate: newOrder.orderDate,
                items: itemsPayload,
                total: total,
                discount: parseFloat(newOrder.discount) || 0,
                notes: newOrder.notes
            })
            setIsEditing(false)
            setEditingOrderId(null)
        } else {
            addOrder({
                customerId: newOrder.customerId,        // Local ID for store lookup
                customerUuid: customer.uuid,             // UUID for Supabase
                salesmanId: newOrder.salesmanId || null,
                orderDate: newOrder.orderDate,           // Order date
                items: itemsPayload,
                total: total,
                discount: parseFloat(newOrder.discount) || 0,
                notes: newOrder.notes
            })
        }

        setShowNewOrderModal(false)
        setNewOrder({ customerId: '', items: [{ productId: '', quantity: 1, returnQuantity: 0 }], salesmanId: '', discount: 0, notes: '', orderDate: new Date().toISOString().split('T')[0] })
    }

    const handleDeleteClick = (e, orderId) => {
        e.stopPropagation()
        setOrderToDelete(orderId)
    }

    const confirmDelete = () => {
        if (orderToDelete) {
            deleteOrder(orderToDelete)
            setOrderToDelete(null)
        }
    }

    const handleEditOrder = (e, order) => {
        e.stopPropagation()
        setIsEditing(true)
        setEditingOrderId(order.id)

        // Map items back to form state
        const orderItems = order.items.map(item => {
            const product = products.find(p => p.uuid === item.productId || p.name === item.name)
            return {
                productId: product?.id || '',
                quantity: item.qty || 1,
                returnQuantity: item.returnQty || 0
            }
        })

        setNewOrder({
            customerId: order.customerId,
            items: orderItems.length > 0 ? orderItems : [{ productId: '', quantity: 1, returnQuantity: 0 }],
            salesmanId: order.salesmanId || '',
            discount: order.discount || 0,
            notes: order.notes || '',
            orderDate: order.orderDate || order.createdAt.split('T')[0]
        })
        setShowNewOrderModal(true)
    }

    const handleViewInvoice = (e, order) => {
        e.stopPropagation()
        setSelectedInvoiceOrder(order)
        setShowInvoiceModal(true)
    }

    const handleShareInvoice = async (order) => {
        const shareText = `Devine Water Invoice\n` +
            `Order ID: ${order.id}\n` +
            `Customer: ${order.customerName}\n` +
            `Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}\n` +
            `Total: Rs ${order.total.toLocaleString()}\n\n` +
            `Items:\n${order.items.map(i => `- ${i.name} (${i.qty})`).join('\n')}`

        const shareData = {
            title: `Invoice #${order.id}`,
            text: shareText,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                // Call share without awaiting to avoid UI block
                navigator.share(shareData).catch(err => {
                    if (err.name !== 'AbortError') console.error('Share failed:', err)
                })
            } else {
                await navigator.clipboard.writeText(shareText)
                alert('Invoice details copied to clipboard (Native share not supported)')
            }
        } catch (err) {
            console.error('Share initialization failed:', err)
        }
    }

    const handleWhatsAppShare = (order) => {
        const shareText = encodeURIComponent(
            `*Devine Water Invoice*\n` +
            `*Order ID:* ${order.id}\n` +
            `*Customer:* ${order.customerName}\n` +
            `*Date:* ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}\n` +
            `*Total:* Rs ${order.total.toLocaleString()}\n\n` +
            `*Items:*\n${order.items.map(i => `- ${i.name} (${i.qty})`).join('\n')}`
        )

        // Universal WhatsApp link
        const whatsappUrl = `https://wa.me/?text=${shareText}`
        window.open(whatsappUrl, '_blank')
    }

    const handleDownloadPDF = () => {
        window.print()
    }

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus)
    }

    const handlePaymentChange = (orderId) => {
        updateOrderPayment(orderId, 'paid')
    }

    // STATE FOR CONFIRM DIALOG
    const [deliveryConfirmDialog, setDeliveryConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        showCancel: true,
        confirmText: 'Confirm',
        variant: 'primary'
    })

    const handleMarkDeliveredClick = (order) => {
        if (order.status === 'delivered') {
            setDeliveryConfirmDialog({
                isOpen: true,
                title: 'Already Delivered',
                message: `Order #${order.id} has already been delivered to ${order.customerName}.`,
                onConfirm: () => setDeliveryConfirmDialog({ ...deliveryConfirmDialog, isOpen: false }),
                showCancel: false,
                confirmText: 'OK',
                variant: 'info'
            })
        } else {
            handleStatusChange(order.id, 'delivered')
        }
    }

    // Helper: Group orders by date (Today, Yesterday, etc.)
    const getGroupedOrders = () => {
        const groups = {}
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        filteredOrders.forEach(order => {
            let dateKey = order.orderDate || order.createdAt?.split('T')[0] || 'Unknown Date'
            if (dateKey === today) dateKey = 'Today'
            else if (dateKey === yesterday) dateKey = 'Yesterday'

            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(order)
        })

        // Sort keys: Today, Yesterday, then desc date
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Today') return -1
            if (b === 'Today') return 1
            if (a === 'Yesterday') return -1
            if (b === 'Yesterday') return 1
            return b.localeCompare(a) // Descending date
        })

        return { groups, sortedKeys }
    }

    const { groups, sortedKeys } = getGroupedOrders()

    return (
        <div className={styles.orders}>
            {/* Unified Filter Bar */}
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
                            setSearchTerm('')
                            setFilterStatus('all')
                        }}
                    >
                        <RefreshCw size={16} />
                        <span>Reset</span>
                    </button>


                    <Button variant="primary" icon={Plus} onClick={() => {
                        setIsEditing(false)
                        setEditingOrderId(null)
                        setNewOrder({ customerId: '', items: [{ productId: '', quantity: 1, returnQuantity: 0 }], salesmanId: '', discount: 0, notes: '', orderDate: new Date().toISOString().split('T')[0] })
                        setShowNewOrderModal(true)
                    }}>
                        New Order
                    </Button>
                </div>
            </header>

            {/* Sub-header with Search and Status Filter */}
            <div className={styles.subHeader}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by customer name or ID..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.metaFilters}>
                    <select
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Orders
                    <span className={styles.tabCount}>{orders.length}</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                    <span className={styles.tabCount}>{orders.filter(o => o.status === 'pending').length}</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'delivered' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('delivered')}
                >
                    Delivered
                    <span className={styles.tabCount}>{orders.filter(o => o.status === 'delivered').length}</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'customer' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('customer')}
                >
                    Customer Orders
                    <span className={styles.tabCount}>{orders.filter(o => !o.salesmanId).length}</span>
                </button>
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
                {activeTab === 'all' ? (
                    /* ALL ORDERS - Grouped by Date */
                    sortedKeys.map(groupKey => (
                        <div key={groupKey} className={styles.groupSection}>
                            <h3 className={styles.groupTitle}>{groupKey}</h3>
                            {groups[groupKey].map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard
                                        className={styles.orderCard}
                                        hover={false}
                                        animate={false}
                                        onClick={() => toggleOrder(order.id)}
                                    >
                                        <div className={styles.orderMain}>
                                            <div className={styles.orderInfo}>
                                                <span className={styles.orderId}>{order.id}</span>
                                                <span className={styles.orderCustomer}>{order.customerName}</span>
                                                <span className={styles.orderDate}>
                                                    {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderTotal}>Rs {order.total.toLocaleString()}</span>
                                                <StatusBadge status={order.status} />
                                                <motion.div
                                                    animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                                    className={styles.expandIcon}
                                                >
                                                    <ChevronDown size={20} />
                                                </motion.div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedOrder === order.id && (
                                                <motion.div
                                                    className={styles.orderDetails}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className={styles.detailsGrid}>
                                                        <div className={styles.detailSection}>
                                                            <h4>Order Details</h4>
                                                            <p><strong>Payment:</strong> <StatusBadge status={order.paymentStatus} size="sm" /></p>
                                                            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                        </div>
                                                        <div className={styles.detailSection}>
                                                            <h4>Order Items</h4>
                                                            <table className={styles.itemsTable}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Item</th>
                                                                        <th>Qty</th>
                                                                        <th>Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {order.items.map((item, i) => (
                                                                        <tr key={i}>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.qty}</td>
                                                                            <td>Rs {item.price}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <div className={styles.detailActions}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={FileText}
                                                            onClick={(e) => handleViewInvoice(e, order)}
                                                        >
                                                            View Invoice
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={Edit}
                                                            onClick={(e) => handleEditOrder(e, order)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        {order.status !== 'cancelled' && (
                                                            <>
                                                                <Button
                                                                    variant={order.status === 'delivered' ? 'secondary' : 'success'}
                                                                    size="sm"
                                                                    icon={Check}
                                                                    onClick={() => handleMarkDeliveredClick(order)}
                                                                >
                                                                    {order.status === 'delivered' ? 'Delivered' : 'Mark Delivered'}
                                                                </Button>
                                                                {order.paymentStatus === 'pending' && (
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => handlePaymentChange(order.id)}
                                                                    >
                                                                        Mark Paid
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            icon={Trash2}
                                                            onClick={(e) => handleDeleteClick(e, order.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    ))
                ) : activeTab === 'customer' ? (
                    /* CUSTOMER REQUESTS VIEW */
                    filteredOrders.length === 0 ? (
                        <div className={styles.empty}>No customer requests found.</div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard
                                    className={styles.orderCard}
                                    hover={false}
                                    animate={false}
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className={styles.orderMain}>
                                        <div className={styles.orderInfo}>
                                            <span className={styles.orderId} style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>Pinging</span>
                                            <span className={styles.orderCustomer}>{order.customerName}</span>
                                            <span className={styles.orderDate}>
                                                {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.orderMeta}>
                                            <span className={styles.orderTotal}>Rs {order.total.toLocaleString()}</span>
                                            <StatusBadge status={order.status} />
                                            <motion.div
                                                animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                                className={styles.expandIcon}
                                            >
                                                <ChevronDown size={20} />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedOrder === order.id && (
                                            <motion.div
                                                className={styles.orderDetails}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className={styles.detailsGrid}>
                                                    <div className={styles.detailSection}>
                                                        <h4>Items Requested</h4>
                                                        <ul>
                                                            {order.items.map((item, i) => (
                                                                <li key={i}>{item.name} x {item.qty}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className={styles.detailSection}>
                                                        <h4>Customer Note</h4>
                                                        <p>{order.notes || 'No notes shared'}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.detailActions}>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        icon={Edit}
                                                        onClick={(e) => handleEditOrder(e, order)}
                                                    >
                                                        Assign Staff
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                                    >
                                                        Direct Delivery
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </GlassCard>
                            </motion.div>
                        ))
                    )
                ) : activeTab === 'pending' ? (
                    /* PENDING VIEW (Unified: Scheduled + Skipped + Manual) */
                    <div className={styles.pendingContainer}>
                        {/* Section 1: Scheduled Deliveries */}
                        <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
                            <h4>Scheduled Deliveries ({new Date().toLocaleDateString()})</h4>
                        </div>
                        {pendingItems.length === 0 ? (
                            <div style={{ padding: '10px 0', color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>No pending deliveries for this date.</div>
                        ) : (
                            pendingItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ marginBottom: '10px' }}
                                >
                                    <GlassCard className={styles.orderCard} hover={false} animate={false}>
                                        <div className={styles.orderMain}>
                                            <div className={styles.orderInfo}>
                                                <span className={styles.orderId} style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>Scheduled</span>
                                                <span className={styles.orderCustomer}>{item.customerName}</span>
                                            </div>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderTotal} style={{ color: '#aaa' }}>
                                                    {item.notes}
                                                </span>
                                                <StatusBadge status="pending" />
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}

                        {/* Section 2: Skipped Attempts */}
                        <div className={styles.sectionHeader}>
                            <h4>Skipped Attempts</h4>
                        </div>
                        {skippedItems.length === 0 ? (
                            <div style={{ padding: '10px 0', color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>No skipped attempts for this date.</div>
                        ) : (
                            skippedItems.map((delivery, index) => (
                                <motion.div
                                    key={delivery.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ marginBottom: '10px' }}
                                >
                                    <GlassCard className={styles.orderCard} hover={false} animate={false}>
                                        <div className={styles.orderMain}>
                                            <div className={styles.orderInfo}>
                                                <span className={styles.orderId} style={{ backgroundColor: '#ffebee', color: '#c62828' }}>Skipped</span>
                                                <span className={styles.orderCustomer}>{delivery.customerName}</span>
                                            </div>
                                            <div className={styles.orderMeta}>
                                                <div className={styles.actionButtons}>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        icon={Plus}
                                                        onClick={() => {
                                                            const customer = customers.find(c => c.id === delivery.customerId)
                                                            if (customer) {
                                                                setNewOrder({
                                                                    ...newOrder,
                                                                    customerId: customer.id,
                                                                    orderDate: delivery.deliveryDate?.split('T')[0] || new Date().toISOString().split('T')[0]
                                                                })
                                                                setShowNewOrderModal(true)
                                                            }
                                                        }}
                                                    >
                                                        Create Order
                                                    </Button>
                                                </div>
                                                <StatusBadge status="skipped" />
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}
                        <div className={styles.sectionHeader}>
                            <h4>Manual Orders</h4>
                        </div>
                        {(() => {
                            if (filteredOrders.length === 0) {
                                return <div style={{ padding: '10px 0', color: '#888', fontStyle: 'italic' }}>No pending manual orders for this date.</div>
                            }

                            return filteredOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard
                                        className={styles.orderCard}
                                        hover={false}
                                        animate={false}
                                        onClick={() => toggleOrder(order.id)}
                                    >
                                        <div className={styles.orderMain}>
                                            <div className={styles.orderInfo}>
                                                <span className={styles.orderId}>{order.id}</span>
                                                <span className={styles.orderCustomer}>{order.customerName}</span>
                                                <span className={styles.orderDate}>
                                                    {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderTotal}>Rs {order.total.toLocaleString()}</span>
                                                <StatusBadge status={order.status} />
                                                <motion.div
                                                    animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                                    className={styles.expandIcon}
                                                >
                                                    <ChevronDown size={20} />
                                                </motion.div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedOrder === order.id && (
                                                <motion.div
                                                    className={styles.orderDetails}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className={styles.detailsGrid}>
                                                        <div className={styles.detailSection}>
                                                            <h4>Order Details</h4>
                                                            <p><strong>Payment:</strong> <StatusBadge status={order.paymentStatus} size="sm" /></p>
                                                            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                        </div>
                                                        <div className={styles.detailSection}>
                                                            <h4>Order Items</h4>
                                                            <table className={styles.itemsTable}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Item</th>
                                                                        <th>Qty</th>
                                                                        <th>Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {order.items.map((item, i) => (
                                                                        <tr key={i}>
                                                                            <td>{item.name}</td>
                                                                            <td>{item.qty}</td>
                                                                            <td>Rs {item.price}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <div className={styles.detailActions}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={FileText}
                                                            onClick={(e) => handleViewInvoice(e, order)}
                                                        >
                                                            View Invoice
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            icon={Edit}
                                                            onClick={(e) => handleEditOrder(e, order)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            icon={Check}
                                                            onClick={() => handleStatusChange(order.id, 'delivered')}
                                                        >
                                                            Mark Delivered
                                                        </Button>
                                                        {order.paymentStatus === 'pending' && (
                                                            <Button variant="primary" size="sm" onClick={() => handlePaymentChange(order.id)}>Mark Paid</Button>
                                                        )}
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            icon={Trash2}
                                                            onClick={(e) => handleDeleteClick(e, order.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>
                                </motion.div>
                            ));
                        })()}
                    </div>
                ) : (
                    /* DELIVERED VIEW */
                    filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard
                                className={styles.orderCard}
                                hover={false}
                                animate={false}
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className={styles.orderMain}>
                                    <div className={styles.orderInfo}>
                                        <span className={styles.orderId}>{order.id}</span>
                                        <span className={styles.orderCustomer}>{order.customerName}</span>
                                        <span className={styles.orderDate}>
                                            {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={styles.orderMeta}>
                                        <span className={styles.orderTotal}>Rs {order.total.toLocaleString()}</span>
                                        <StatusBadge status={order.status} />
                                        <motion.div
                                            animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                            className={styles.expandIcon}
                                        >
                                            <ChevronDown size={20} />
                                        </motion.div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            className={styles.orderDetails}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailSection}>
                                                    <h4>Order Details</h4>
                                                    <p><strong>Payment:</strong> <StatusBadge status={order.paymentStatus} size="sm" /></p>
                                                    <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className={styles.detailSection}>
                                                    <h4>Order Items</h4>
                                                    <table className={styles.itemsTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Item</th>
                                                                <th>Qty</th>
                                                                <th>Price</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items.map((item, i) => (
                                                                <tr key={i}>
                                                                    <td>{item.name}</td>
                                                                    <td>{item.qty}</td>
                                                                    <td>Rs {item.price}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className={styles.detailActions}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={FileText}
                                                    onClick={(e) => handleViewInvoice(e, order)}
                                                >
                                                    View Invoice
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Edit}
                                                    onClick={(e) => handleEditOrder(e, order)}
                                                >
                                                    Edit
                                                </Button>
                                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                    <>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            icon={Check}
                                                            onClick={() => handleStatusChange(order.id, 'delivered')}
                                                        >
                                                            Mark Delivered
                                                        </Button>
                                                        {order.paymentStatus === 'pending' && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => handlePaymentChange(order.id)}
                                                            >
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    icon={Trash2}
                                                    onClick={(e) => handleDeleteClick(e, order.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        </motion.div>
                    ))
                )}

                {filteredOrders.length === 0 && (
                    <div className={styles.emptyState}>
                        <FileText size={48} />
                        <h3>No orders found</h3>
                        <p>Try adjusting your filters or date selection</p>
                    </div>
                )}
            </div>

            {/* New Order Modal */}
            {showNewOrderModal && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{isEditing ? 'Edit Order' : 'Create New Order'}</h3>
                            <div className={styles.headerActions}>
                                {!isEditing && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={clearDraft}
                                        title="Clear form"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={resetForm}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateOrder}>
                            <div className={styles.formGroup}>
                                <label>Customer *</label>
                                <select
                                    value={newOrder.customerId}
                                    onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">Select customer</option>
                                    {customers.filter(c => c.status === 'active').map(c => (
                                        <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.itemsSection}>
                                <label className={styles.sectionLabel}>Order Items</label>
                                {newOrder.items.map((item, index) => {
                                    const product = products.find(p => p.id === item.productId)
                                    return (
                                        <div key={index} className={styles.itemRowWrapper}>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup} style={{ flex: 2 }}>
                                                    <label>Product *</label>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => {
                                                            const updatedItems = [...newOrder.items]
                                                            updatedItems[index].productId = e.target.value
                                                            setNewOrder({ ...newOrder, items: updatedItems })
                                                        }}
                                                        required
                                                    >
                                                        <option value="">Select product</option>
                                                        {products
                                                            .filter(p => {
                                                                if (p.status !== 'active') return false
                                                                const customer = customers.find(c => c.id === newOrder.customerId)
                                                                if (customer?.assignedProducts?.length > 0) {
                                                                    return customer.assignedProducts.includes(p.uuid)
                                                                }
                                                                return true
                                                            })
                                                            .map(p => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} {currentUser?.designation === 'Administrator' ? `- Rs ${p.price}` : ''}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Qty *</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const updatedItems = [...newOrder.items]
                                                            updatedItems[index].quantity = e.target.value
                                                            setNewOrder({ ...newOrder, items: updatedItems })
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Return</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.returnQuantity}
                                                        onChange={(e) => {
                                                            const updatedItems = [...newOrder.items]
                                                            updatedItems[index].returnQuantity = e.target.value
                                                            setNewOrder({ ...newOrder, items: updatedItems })
                                                        }}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                {newOrder.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.removeBtn}
                                                        onClick={() => {
                                                            const updatedItems = newOrder.items.filter((_, i) => i !== index)
                                                            setNewOrder({ ...newOrder, items: updatedItems })
                                                        }}
                                                        style={{ alignSelf: 'flex-end', marginBottom: '5px', padding: '8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            {product && currentUser?.designation === 'Administrator' && (
                                                <div className={styles.itemPriceOffset}>
                                                    <small>Price: Rs {product.price} x {item.quantity || 0} = Rs {(product.price * (item.quantity || 0)).toLocaleString()}</small>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                <button
                                    type="button"
                                    className={styles.addMoreBtn}
                                    onClick={() => setNewOrder({
                                        ...newOrder,
                                        items: [...newOrder.items, { productId: '', quantity: 1, returnQuantity: 0 }]
                                    })}
                                    style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px dashed #ccc', color: '#00bcd4', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
                                >
                                    + Add Another Product
                                </button>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Salesman</label>
                                <select
                                    value={newOrder.salesmanId}
                                    onChange={(e) => setNewOrder({ ...newOrder, salesmanId: e.target.value })}
                                >
                                    <option value="">Select salesman</option>
                                    {salesmen.map(s => (
                                        <option key={s.id} value={s.uuid}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Order Date</label>
                                <input
                                    type="date"
                                    value={newOrder.orderDate}
                                    onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Discount (Rs)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newOrder.discount}
                                        onChange={(e) => setNewOrder({ ...newOrder, discount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Notes</label>
                                    <input
                                        type="text"
                                        value={newOrder.notes}
                                        onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                                        placeholder="Any notes..."
                                    />
                                </div>
                            </div>

                            {currentUser?.designation === 'Administrator' && (
                                <div className={styles.orderSummary}>
                                    <div className={styles.summaryRow}>
                                        <span>Subtotal:</span>
                                        <span>Rs {calculateSubtotal().toLocaleString()}</span>
                                    </div>
                                    {parseFloat(newOrder.discount) > 0 && (
                                        <div className={styles.summaryRow}>
                                            <span>Discount:</span>
                                            <span className={styles.discount}>- Rs {parseFloat(newOrder.discount).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className={`${styles.summaryRow} ${styles.total}`}>
                                        <span>Total:</span>
                                        <span>Rs {(calculateSubtotal() - (parseFloat(newOrder.discount) || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" variant="primary" fullWidth>
                                {isEditing ? 'Update Order' : 'Create Order'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Confirmation Dialog for Delivery */}
            <ConfirmDialog
                isOpen={deliveryConfirmDialog.isOpen}
                onClose={() => setDeliveryConfirmDialog({ ...deliveryConfirmDialog, isOpen: false })}
                onConfirm={deliveryConfirmDialog.onConfirm}
                title={deliveryConfirmDialog.title}
                message={deliveryConfirmDialog.message}
                variant={deliveryConfirmDialog.variant}
                showCancel={deliveryConfirmDialog.showCancel}
                confirmText={deliveryConfirmDialog.confirmText}
            />

            {/* Delete Confirmation Modal */}
            {orderToDelete && (
                <div className={styles.modalOverlay} onClick={() => setOrderToDelete(null)}>
                    <GlassCard className={`${styles.modal} ${styles.deleteModal}`} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.deleteTitle}>
                                <AlertTriangle size={24} className={styles.warningIcon} />
                                Delete Order
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setOrderToDelete(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            <p>Are you sure you want to delete order <strong>{orderToDelete}</strong>?</p>
                            <p className={styles.warningText}>This action cannot be undone.</p>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                variant="ghost"
                                onClick={() => setOrderToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                            >
                                Delete Order
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
            {/* Order Invoice Modal */}
            {showInvoiceModal && selectedInvoiceOrder && (
                <div className={`${styles.modalOverlay} ${styles.invoiceOverlay}`}>
                    <div className={styles.printableWrapper}>
                        <GlassCard className={`${styles.modal} ${styles.invoiceModal}`}>
                            <div className={`${styles.modalHeader} ${styles.noPrint}`}>
                                <h3>Invoice Request</h3>
                                <div className={styles.headerActions}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={Share2}
                                        onClick={() => handleShareInvoice(selectedInvoiceOrder)}
                                        title="Share via device"
                                    >
                                        Share
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={MessageCircle}
                                        className={styles.whatsappBtn}
                                        onClick={() => handleWhatsAppShare(selectedInvoiceOrder)}
                                        title="Share on WhatsApp"
                                    >
                                        WhatsApp
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={Download}
                                        onClick={handleDownloadPDF}
                                    >
                                        Download PDF
                                    </Button>
                                    <button className={styles.closeBtn} onClick={() => setShowInvoiceModal(false)}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.invoiceContent} id="printable-invoice">
                                <div className={styles.invoiceHeader}>
                                    <div className={styles.brandInfo}>
                                        <h1 className={styles.brandName}>DEVINE WATER</h1>
                                        <p className={styles.brandTagline}>Premium Purification Service</p>
                                    </div>
                                    <div className={styles.invoiceMeta}>
                                        <h2>INVOICE</h2>
                                        <p><strong># {selectedInvoiceOrder.id}</strong></p>
                                        <p>{new Date(selectedInvoiceOrder.orderDate || selectedInvoiceOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className={styles.invoiceBillTo}>
                                    <div className={styles.billToSection}>
                                        <h4>BILL TO</h4>
                                        <p className={styles.customerName}>{selectedInvoiceOrder.customerName}</p>
                                        <p className={styles.customerId}>ID: {selectedInvoiceOrder.customerId}</p>
                                    </div>
                                    <div className={styles.billToSection} style={{ textAlign: 'right' }}>
                                        <h4>PAYMENT STATUS</h4>
                                        <StatusBadge status={selectedInvoiceOrder.paymentStatus} size="sm" />
                                    </div>
                                </div>

                                <table className={styles.invoiceTable}>
                                    <thead>
                                        <tr>
                                            <th>ITEM DESCRIPTION</th>
                                            <th style={{ textAlign: 'center' }}>QTY</th>
                                            <th style={{ textAlign: 'right' }}>UNIT PRICE</th>
                                            <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoiceOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                                <td style={{ textAlign: 'right' }}>Rs {item.price.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right' }}>Rs {(item.price * item.qty).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className={styles.totalLabel}>Subtotal</td>
                                            <td className={styles.totalValue}>Rs {(selectedInvoiceOrder.total + (selectedInvoiceOrder.discount || 0)).toLocaleString()}</td>
                                        </tr>
                                        {selectedInvoiceOrder.discount > 0 && (
                                            <tr>
                                                <td colSpan="3" className={`${styles.totalLabel} ${styles.discountText}`}>Discount</td>
                                                <td className={`${styles.totalValue} ${styles.discountText}`}>- Rs {selectedInvoiceOrder.discount.toLocaleString()}</td>
                                            </tr>
                                        )}
                                        <tr className={styles.grandTotal}>
                                            <td colSpan="3" className={styles.totalLabel}>Grand Total</td>
                                            <td className={styles.totalValue}>Rs {selectedInvoiceOrder.total.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className={styles.invoiceFooter}>
                                    <p>Thank you for choosing Devine Water!</p>
                                    <p className={styles.footerNote}>This is a computer-generated invoice and doesn't require a signature.</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersBilling
