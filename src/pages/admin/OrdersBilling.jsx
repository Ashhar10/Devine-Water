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
    const updateOrderStatus = useDataStore(state => state.updateOrderStatus)
    const updateOrderPayment = useDataStore(state => state.updateOrderPayment)

    // Get salesmen (staff/admin)
    const salesmen = users.filter(u => u.role === 'admin' || u.role === 'staff')

    // Get selected product for price calculation
    const selectedProduct = products.find(p => p.id === newOrder.productId)

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
        const product = products.find(p => p.id === newOrder.productId)
        if (!customer || !product) return

        const subtotal = parseInt(newOrder.quantity) * product.price
        const total = subtotal - (parseFloat(newOrder.discount) || 0)

        addOrder({
            customerId: newOrder.customerId,        // Local ID for store lookup
            customerUuid: customer.uuid,             // UUID for Supabase
            salesmanId: newOrder.salesmanId || null,
            orderDate: newOrder.orderDate,           // Order date
            items: [{
                name: product.name,
                productId: product.uuid,  // Use UUID instead of local ID
                qty: parseInt(newOrder.quantity),
                returnQty: parseInt(newOrder.returnQuantity) || 0,
                price: product.price
            }],
            total: total,
            discount: parseFloat(newOrder.discount) || 0,
            notes: newOrder.notes
        })

        setShowNewOrderModal(false)
        setNewOrder({ customerId: '', productId: '', quantity: 1, returnQuantity: 0, salesmanId: '', discount: 0, notes: '', orderDate: new Date().toISOString().split('T')[0] })
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
