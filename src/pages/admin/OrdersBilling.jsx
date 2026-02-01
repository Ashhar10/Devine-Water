import { useState, useEffect, useMemo, useTransition } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    AlertTriangle,
    ChevronDown,
    FileText,
    Download,
    X,
    Check,
    Trash2,
    Edit,
    Calendar
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './OrdersBilling.module.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])  // Date picker like Delivery
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        items: [{ productId: '', quantity: 1, returnQuantity: 0 }],
        salesmanId: '',
        discount: 0,
        notes: '',
        orderDate: new Date().toISOString().split('T')[0]
    })

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
        return orders
            .filter(o => {
                if (!o.orderDate) return false

                if (activeTab === 'delivered') {
                    const isDelivered = o.status === 'delivered'
                    const isSelectedDate = o.orderDate === selectedDate
                    return isDelivered && isSelectedDate
                }
                if (activeTab === 'pending') {
                    const isPending = o.status === 'pending'
                    const isSelectedDate = o.orderDate === selectedDate
                    return isPending && isSelectedDate
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
    }, [orders, activeTab, selectedDate, filterStatus, searchTerm])

    // Memoize Pending Items for the selected date - Optimized
    const { pendingItems, skippedItems } = useMemo(() => {
        if (activeTab !== 'pending') return { pendingItems: [], skippedItems: [] }

        const scheduledCustomers = customers.filter(c => {
            const hasDeliveryToday = deliveries.some(d => d.customerId === c.id && (d.deliveryDate === selectedDate || d.deliveryDate?.startsWith(selectedDate)));
            const matchesDay = !c.deliveryDays || c.deliveryDays.length === 0 ||
                c.deliveryDays.some(day => day.toLowerCase() === selectedDay.toLowerCase());
            return (matchesDay || hasDeliveryToday) && c.status === 'active';
        });

        const pItems = [];
        scheduledCustomers.forEach(customer => {
            const customerDeliveries = deliveries.filter(d =>
                d.customerId === customer.id &&
                (d.deliveryDate === selectedDate || d.deliveryDate?.startsWith(selectedDate))
            );

            if (customerDeliveries.length === 0) {
                pItems.push({
                    id: `scheduled-${customer.id}`,
                    customerName: customer.name,
                    notes: `Scheduled for ${new Date(selectedDate).toLocaleDateString()}`,
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

        const sItems = deliveries.filter(d =>
            d.status === 'skipped' &&
            (d.deliveryDate === selectedDate || d.deliveryDate?.startsWith(selectedDate))
        );

        return { pendingItems: pItems, skippedItems: sItems };
    }, [activeTab, customers, deliveries, selectedDate, selectedDay])




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
        // Simple print window for now
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Devine Water</h1>
                        <h2>Invoice</h2>
                        <p>Order ID: ${order.id}</p>
                        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p><strong>Customer:</strong> ${order.customerName}</p>
                        <p><strong>Status:</strong> ${order.status} / ${order.paymentStatus}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td>Rs ${item.price}</td>
                                    <td>Rs ${(item.price * item.qty).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                             <tr>
                                <td colspan="3" style="text-align:right"><strong>Total:</strong></td>
                                <td><strong>Rs ${order.total.toLocaleString()}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus)
    }

    const handlePaymentChange = (orderId) => {
        updateOrderPayment(orderId, 'paid')
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
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.actions}>
                    {/* Date Picker (like Delivery panel) */}
                    <div className={styles.datePickerWrapper}>
                        <Calendar size={18} className={styles.calendarIcon} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    <select
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="primary" icon={Plus} onClick={() => setShowNewOrderModal(true)}>
                        New Order
                    </Button>
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
                            <h4>Scheduled Deliveries ({new Date(selectedDate).toLocaleDateString()})</h4>
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
                                                                    orderDate: selectedDate
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
                <div className={styles.modalOverlay} onClick={() => setShowNewOrderModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{isEditing ? 'Edit Order' : 'Create New Order'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowNewOrderModal(false)}>
                                <X size={20} />
                            </button>
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
        </div>
    )
}

export default OrdersBilling
