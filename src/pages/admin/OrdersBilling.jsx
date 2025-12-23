import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    ChevronDown,
    FileText,
    Download,
    X,
    Check
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './OrdersBilling.module.css'

function OrdersBilling() {
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [showNewOrderModal, setShowNewOrderModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [newOrder, setNewOrder] = useState({ customerId: '', quantity: 1 })

    const orders = useDataStore(state => state.orders)
    const customers = useDataStore(state => state.customers)
    const addOrder = useDataStore(state => state.addOrder)
    const updateOrderStatus = useDataStore(state => state.updateOrderStatus)
    const updateOrderPayment = useDataStore(state => state.updateOrderPayment)

    const filteredOrders = orders
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
        if (!customer) return

        addOrder({
            customerId: newOrder.customerId,
            items: [{ name: 'Water Bottle 19L', qty: parseInt(newOrder.quantity), price: 500 }],
            total: parseInt(newOrder.quantity) * 500,
        })

        setShowNewOrderModal(false)
        setNewOrder({ customerId: '', quantity: 1 })
    }

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus)
    }

    const handlePaymentChange = (orderId) => {
        updateOrderPayment(orderId, 'paid')
    }

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

            {/* Orders List */}
            <div className={styles.ordersList}>
                {filteredOrders.map((order, index) => (
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
                                        {new Date(order.createdAt).toLocaleDateString()}
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
                                            <Button variant="ghost" size="sm" icon={FileText}>
                                                View Invoice
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* New Order Modal */}
            {showNewOrderModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNewOrderModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Order</h3>
                            <button className={styles.closeBtn} onClick={() => setShowNewOrderModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrder}>
                            <div className={styles.formGroup}>
                                <label>Customer</label>
                                <select
                                    value={newOrder.customerId}
                                    onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                                    required
                                >
                                    <option value="">Select customer</option>
                                    {customers.filter(c => c.status === 'active').map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Quantity (19L Bottles)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newOrder.quantity}
                                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Total Amount</label>
                                <div className={styles.totalDisplay}>
                                    Rs {(parseInt(newOrder.quantity || 0) * 500).toLocaleString()}
                                </div>
                            </div>
                            <Button type="submit" variant="primary" fullWidth>
                                Create Order
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default OrdersBilling
