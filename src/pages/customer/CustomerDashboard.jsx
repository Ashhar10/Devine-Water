import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Receipt, TrendingUp, Bell, CreditCard } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './CustomerDashboard.module.css'

function CustomerDashboard() {
    // Use real data from store
    const currentUser = useDataStore(state => state.currentUser)
    const customers = useDataStore(state => state.customers)
    const bills = useDataStore(state => state.bills)
    const orders = useDataStore(state => state.orders)
    const products = useDataStore(state => state.products)
    const addOrder = useDataStore(state => state.addOrder)

    // Find the current customer object from the store
    const currentCustomer = customers.find(c => c.uuid === currentUser?.customerId) ||
        customers.find(c => c.email === currentUser?.email) ||
        customers[0]

    const customerOrders = orders.filter(o => o.customerId === currentCustomer?.id)
    const customerBills = bills.filter(b => b.customerId === currentCustomer?.id)

    const pendingBill = customerBills.find(b => b.status === 'pending')
    const currentUsage = pendingBill?.usageLiters || 285
    const monthlyLimit = 500
    const usagePercentage = (currentUsage / monthlyLimit) * 100

    const [showOrderModal, setShowOrderModal] = useState(false)
    const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }])
    const [orderNotes, setOrderNotes] = useState('')

    const recentActivity = [
        ...customerBills.slice(0, 2).map(b => ({
            text: `Bill Generated - Rs ${b.amount.toLocaleString()}`,
            date: b.createdAt,
            type: 'bill'
        })),
        ...customerOrders.slice(0, 2).map(o => ({
            text: `Order ${o.status === 'delivered' ? 'Delivered' : 'Placed'} - Rs ${o.total.toLocaleString()}`,
            date: new Date(o.orderDate || o.createdAt).toLocaleDateString(),
            type: 'order'
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)

    const addOrderItem = () => {
        setOrderItems([...orderItems, { productId: '', quantity: 1 }])
    }

    const removeOrderItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index))
    }

    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderItems]
        newItems[index] = { ...newItems[index], [field]: value }
        if (field === 'quantity') {
            newItems[index].quantity = parseInt(value) || 1
        }
        setOrderItems(newItems)
    }

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId)
            return sum + (product ? product.price * item.quantity : 0)
        }, 0)
    }

    const handlePlaceOrder = (e) => {
        e.preventDefault()
        if (!currentCustomer) return

        // Filter out incomplete items
        const validItems = orderItems.filter(item => item.productId && item.quantity > 0)
        if (validItems.length === 0) {
            alert('Please select at least one product.')
            return
        }

        const itemsPayload = validItems.map(item => {
            const product = products.find(p => p.id === item.productId)
            return {
                name: product.name,
                productId: product.uuid,
                qty: parseInt(item.quantity),
                price: product.price
            }
        })

        const totalAmount = calculateTotal()

        addOrder({
            customerId: currentCustomer.id,
            customerUuid: currentCustomer.uuid,
            salesmanId: null, // Indicates customer placed it themselves
            orderDate: new Date().toISOString().split('T')[0],
            items: itemsPayload,
            total: totalAmount,
            notes: orderNotes
        })

        setShowOrderModal(false)
        setOrderItems([{ productId: '', quantity: 1 }])
        setOrderNotes('')
        alert('Order placed successfully!')
    }

    return (
        <div className={styles.dashboard}>
            <motion.div
                className={styles.welcome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.welcomeText}>
                    <h1 className={styles.greeting}>Welcome back, {currentCustomer?.name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p className={styles.subtitle}>Here is your dashboard for {currentCustomer?.customer_id || 'CUST-XXX'}</p>
                </div>
                <Button variant="primary" icon={TrendingUp} onClick={() => setShowOrderModal(true)}>
                    Place Order
                </Button>
            </motion.div>

            {/* Customer Info Row */}
            <div className={styles.infoRow}>
                <GlassCard className={styles.infoCard} delay={0.05}>
                    <div className={styles.infoLabel}>Account Balance</div>
                    <div className={styles.infoValue}>Rs {currentCustomer?.currentBalance?.toLocaleString() || 0}</div>
                </GlassCard>
                <GlassCard className={styles.infoCard} delay={0.1}>
                    <div className={styles.infoLabel}>Scheduled Deliveries</div>
                    <div className={styles.infoValue}>{currentCustomer?.deliveryDays?.join(', ') || 'Contact Admin'}</div>
                </GlassCard>
                <GlassCard className={styles.infoCard} delay={0.15}>
                    <div className={styles.infoLabel}>Delivery Address</div>
                    <div className={styles.infoValue} title={currentCustomer?.address}>
                        {currentCustomer?.address?.substring(0, 30)}...
                    </div>
                </GlassCard>
            </div>

            {/* Water Usage Card */}
            <GlassCard className={styles.usageCard} glow glowColor="cyan" delay={0.1}>
                <div className={styles.usageHeader}>
                    <div className={styles.usageIcon}>
                        <Droplets size={28} />
                    </div>
                    <span className={styles.usageLabel}>Current Month Usage</span>
                </div>

                <div className={styles.usageCircle}>
                    <svg viewBox="0 0 100 100" className={styles.progressRing}>
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${usagePercentage * 2.64} 264`}
                            transform="rotate(-90 50 50)"
                            initial={{ strokeDasharray: "0 264" }}
                            animate={{ strokeDasharray: `${usagePercentage * 2.64} 264` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00d4ff" />
                                <stop offset="100%" stopColor="#00ffc8" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className={styles.usageValue}>
                        <span className={styles.currentUsage}>{currentUsage}</span>
                        <span className={styles.usageUnit}>Liters</span>
                    </div>
                </div>

                <div className={styles.usageFooter}>
                    <span>{monthlyLimit - currentUsage}L remaining</span>
                    <span>{Math.round(usagePercentage)}% used</span>
                </div>
            </GlassCard>

            {/* Current Bill Card */}
            {pendingBill && (
                <GlassCard
                    className={styles.billCard}
                    glow
                    glowColor="warning"
                    delay={0.2}
                >
                    <div className={styles.billHeader}>
                        <div className={styles.billIcon}>
                            <Receipt size={24} />
                        </div>
                        <div className={styles.billInfo}>
                            <span className={styles.billLabel}>Current Bill</span>
                            <span className={styles.dueDate}>Due: {pendingBill.dueDate}</span>
                        </div>
                    </div>

                    <div className={styles.billAmount}>
                        <span className={styles.currency}>Rs</span>
                        <motion.span
                            className={styles.amount}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {pendingBill.amount.toLocaleString()}
                        </motion.span>
                    </div>

                    <Button variant="primary" fullWidth icon={CreditCard}>
                        Pay Now
                    </Button>
                </GlassCard>
            )}

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <GlassCard className={styles.actionCard} delay={0.3} onClick={() => window.location.href = '/customer/calendar'}>
                    <TrendingUp size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>Calendar Report</span>
                </GlassCard>
                <GlassCard className={styles.actionCard} delay={0.4} onClick={() => window.location.href = '/customer/finance'}>
                    <Receipt size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>Finance Details</span>
                </GlassCard>
                <GlassCard className={styles.actionCard} delay={0.5} onClick={() => window.location.href = '/customer/support'}>
                    <Bell size={24} className={styles.actionIcon} />
                    <span className={styles.actionLabel}>Contact Us</span>
                </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className={styles.activityCard} delay={0.6}>
                <h3 className={styles.sectionTitle}>Recent Activity</h3>
                <div className={styles.activityList}>
                    {recentActivity.map((activity, index) => (
                        <motion.div
                            key={index}
                            className={styles.activityItem}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                        >
                            <span className={styles.activityText}>{activity.text}</span>
                            <span className={styles.activityDate}>{activity.date}</span>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Place Order Modal */}
            <AnimatePresence>
                {showOrderModal && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Place an Order</h2>
                                <button onClick={() => setShowOrderModal(false)} className={styles.closeBtn}>×</button>
                            </div>
                            <form onSubmit={handlePlaceOrder} className={styles.form}>

                                <div className={styles.itemsList}>
                                    {orderItems.map((item, index) => (
                                        <div key={index} className={styles.itemRow}>
                                            <div className={styles.formGroup}>
                                                <label>Product</label>
                                                <select
                                                    required
                                                    value={item.productId}
                                                    onChange={e => updateOrderItem(index, 'productId', e.target.value)}
                                                >
                                                    <option value="">Select...</option>
                                                    {products
                                                        .filter(p => {
                                                            if (p.status !== 'active') return false
                                                            // Check assigned products for current customer
                                                            if (currentCustomer?.assignedProducts?.length > 0) {
                                                                return currentCustomer.assignedProducts.includes(p.uuid)
                                                            }
                                                            return true
                                                        })
                                                        .map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Qty</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={item.quantity}
                                                    onChange={e => updateOrderItem(index, 'quantity', e.target.value)}
                                                />
                                            </div>
                                            {orderItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    className={styles.removeBtn}
                                                    onClick={() => removeOrderItem(index)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button type="button" className={styles.addMoreBtn} onClick={addOrderItem}>
                                    + Add Another Product
                                </button>

                                {/* Total hidden for customers as per price hiding policy */}
                                {/* <div className={styles.totalRow}>
                                    <span>Total Amount:</span>
                                    <span>Rs {calculateTotal().toLocaleString()}</span>
                                </div> */}

                                <div className={styles.formGroup}>
                                    <label>Notes (Optional)</label>
                                    <textarea
                                        placeholder="e.g. Leave near the gate"
                                        value={orderNotes}
                                        onChange={e => setOrderNotes(e.target.value)}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <Button variant="ghost" onClick={() => setShowOrderModal(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit">Confirm Order</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CustomerDashboard
