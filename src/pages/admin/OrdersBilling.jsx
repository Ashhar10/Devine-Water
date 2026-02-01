import { useState, useEffect } from 'react'
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

function OrdersBilling() {
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [activeTab, setActiveTab] = useState('all')  // 'delivered', 'pending', 'all'
    const [filterStatus, setFilterStatus] = useState('all')
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingOrderId, setEditingOrderId] = useState(null)
    const [orderToDelete, setOrderToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])  // Date picker like Delivery
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        productId: '',
        quantity: 1,
        returnQuantity: 0,
        salesmanId: '',
        discount: 0,
        notes: '',
        orderDate: new Date().toISOString().split('T')[0]  // Default to today
    })

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

    // Get salesmen (staff/admin)
    const salesmen = users.filter(u => u.role === 'admin' || u.role === 'staff')

    // Get selected product for price calculation
    const selectedProduct = products.find(p => p.id === newOrder.productId)

    // Auto-update price when product changes
    useEffect(() => {
        if (selectedProduct && newOrder.quantity) {
            // Recalculate total whenever product or quantity changes
            const subtotal = parseInt(newOrder.quantity) * selectedProduct.price
            // Don't update state in a way that causes infinite loop
            // Just let the form display the updated calculation
        }
    }, [selectedProduct, newOrder.quantity])

    // Filter by tab with date filtering for pending/delivered (using selected date)
    const filteredOrders = orders
        .filter(o => {
            // Defensive check: Log orders with missing orderDate
            if (!o.orderDate) {
                console.warn('Order missing orderDate:', o.id, 'Status:', o.status)
            }

            if (activeTab === 'delivered') {
                // Delivered tab: show selected date's delivered orders
                const isDelivered = o.status === 'delivered'
                const isSelectedDate = o.orderDate === selectedDate

                return isDelivered && isSelectedDate
            }
            if (activeTab === 'pending') {
                // Pending tab: show selected date's pending orders
                const isPending = o.status === 'pending'
                const isSelectedDate = o.orderDate === selectedDate

                return isPending && isSelectedDate
            }
            // Customer Orders tab: show all orders (no date filter)
            return true
        })
        .filter(o => filterStatus === 'all' || o.status === filterStatus)
        .filter(o =>
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase())
        )


    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    const handleCreateOrder = (e) => {
        e.preventDefault()
        const customer = customers.find(c => c.id === newOrder.customerId)
        const product = products.find(p => p.id === newOrder.productId)
        if (!customer || !product) return

        const subtotal = parseInt(newOrder.quantity) * product.price
        const total = subtotal - (parseFloat(newOrder.discount) || 0)

        if (isEditing && editingOrderId) {
            updateOrder(editingOrderId, {
                customerId: newOrder.customerId,
                salesmanId: newOrder.salesmanId || null,
                orderDate: newOrder.orderDate,
                items: [{
                    name: product.name,
                    productId: product.uuid,
                    qty: parseInt(newOrder.quantity),
                    returnQty: parseInt(newOrder.returnQuantity) || 0,
                    price: product.price
                }],
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
                items: [{
                    name: product.name,
                    productId: product.uuid,  // Use UUID instead of local ID (fixed comment)
                    qty: parseInt(newOrder.quantity),
                    returnQty: parseInt(newOrder.returnQuantity) || 0,
                    price: product.price
                }],
                total: total,
                discount: parseFloat(newOrder.discount) || 0,
                notes: newOrder.notes
            })
        }

        setShowNewOrderModal(false)
        setNewOrder({ customerId: '', productId: '', quantity: 1, returnQuantity: 0, salesmanId: '', discount: 0, notes: '', orderDate: new Date().toISOString().split('T')[0] })
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

        // Populate form (simplified for single item orders as per current logic)
        // Find product ID based on name or UUID if available in items
        const item = order.items[0]
        const product = products.find(p => p.uuid === item.productId) || products.find(p => p.name === item.name)

        setNewOrder({
            customerId: order.customerId,
            productId: product?.id || '',
            quantity: item?.qty || 1,
            returnQuantity: item?.returnQty || 0,
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
                    className={`${styles.tab} ${activeTab === 'skipped' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('skipped')}
                >
                    Skipped
                    <span className={styles.tabCount}>{useDataStore.getState().deliveries.filter(d => d.status === 'skipped').length}</span>
                </button>
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
                {activeTab === 'all' ? (
                    /* GROUPED VIEW for 'All' */
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
                ) : activeTab === 'skipped' ? (
                    /* SKIPPED VIEW */
                    (() => {
                        const skipped = deliveries.filter(d => d.status === 'skipped');
                        console.log('DEBUG: Skipped Deliveries:', skipped, 'All Deliveries:', deliveries);
                        if (skipped.length === 0) return <div style={{ padding: '20px', color: '#888' }}>No skipped deliveries found.</div>;
                        return skipped.map((delivery, index) => (

                            <motion.div
                                key={delivery.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard className={styles.orderCard} hover={false} animate={false}>
                                    <div className={styles.orderMain}>
                                        <div className={styles.orderInfo}>
                                            <span className={styles.orderId}>Skipped</span>
                                            <span className={styles.orderCustomer}>{delivery.customerName}</span>
                                            <span className={styles.orderDate}>{new Date(delivery.deliveryDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles.orderMeta}>
                                            <span className={styles.orderTotal} style={{ color: '#aaa', fontStyle: 'italic' }}>
                                                {delivery.notes || 'No notes'}
                                            </span>
                                            <StatusBadge status="skipped" />
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                icon={Plus}
                                                onClick={() => {
                                                    setNewOrder({
                                                        ...newOrder,
                                                        customerId: delivery.customerId,
                                                        notes: delivery.notes || ''
                                                    })
                                                    setShowNewOrderModal(true)
                                                }}
                                            >
                                                Create Order
                                            </Button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    })()
                ) : activeTab === 'pending' ? (
                    /* PENDING VIEW (Mixed: Orders + Deliveries) */
                    <div className={styles.pendingContainer}>
                        {/* Pending Deliveries Section */}
                        <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
                            <h4>Scheduled Deliveries ({new Date(selectedDate).toLocaleDateString()})</h4>
                        </div>
                        {(() => {
                            const pendingDeliveries = deliveries.filter(d =>
                                d.status === 'pending' &&
                                (d.deliveryDate === selectedDate || d.deliveryDate?.startsWith(selectedDate))
                            );

                            if (pendingDeliveries.length === 0) {
                                return <div style={{ padding: '10px 0', color: '#888', fontStyle: 'italic', marginBottom: '20px' }}>No pending deliveries for this date.</div>
                            }

                            return pendingDeliveries.map((delivery, index) => (
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
                                                <span className={styles.orderId} style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>Delivery</span>
                                                <span className={styles.orderCustomer}>{delivery.customerName}</span>
                                            </div>
                                            <div className={styles.orderMeta}>
                                                <span className={styles.orderTotal} style={{ color: '#aaa' }}>
                                                    {delivery.notes || 'No notes'}
                                                </span>
                                                <StatusBadge status="pending" />
                                                {/* No action button here yet - user should go to Delivery page to fulfill */}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        })()}

                        {/* Pending Manual Orders Section */}
                        <div className={styles.sectionHeader}>
                            <h4>Manual Orders</h4>
                        </div>
                        {filteredOrders.length === 0 ? (
                            <div style={{ padding: '10px 0', color: '#888', fontStyle: 'italic' }}>No pending manual orders for this date.</div>
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
                            ))
                        )}
                    </div>
                ) : (
                    /* DELIVERED FLAT VIEW */
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

                            <div className={styles.formGroup}>
                                <label>Product *</label>
                                <select
                                    value={newOrder.productId}
                                    onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
                                    required
                                >
                                    <option value="">Select product</option>
                                    {products.filter(p => p.status === 'active').map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - Rs {p.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Sold Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newOrder.quantity}
                                        onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Return Bottles</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newOrder.returnQuantity}
                                        onChange={(e) => setNewOrder({ ...newOrder, returnQuantity: e.target.value })}
                                        placeholder="Empty bottles"
                                    />
                                </div>
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

                            <div className={styles.orderSummary}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal:</span>
                                    <span>Rs {((parseInt(newOrder.quantity) || 0) * (selectedProduct?.price || 0)).toLocaleString()}</span>
                                </div>
                                {parseFloat(newOrder.discount) > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Discount:</span>
                                        <span className={styles.discount}>- Rs {parseFloat(newOrder.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                    <span>Total:</span>
                                    <span>Rs {(((parseInt(newOrder.quantity) || 0) * (selectedProduct?.price || 0)) - (parseFloat(newOrder.discount) || 0)).toLocaleString()}</span>
                                </div>
                            </div>

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
