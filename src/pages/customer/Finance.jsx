import { motion } from 'framer-motion'
import { Check, Clock, Receipt, Download, CreditCard } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Finance.module.css'

function Finance() {
    const customers = useDataStore(state => state.customers)
    const bills = useDataStore(state => state.bills)
    const payBill = useDataStore(state => state.payBill)

    // Simulate logged-in customer (first active customer)
    const currentUser = useDataStore(state => state.currentUser)
    const currentCustomer = customers.find(c => c.uuid === currentUser?.customerId) ||
        customers.find(c => c.email === currentUser?.email) ||
        customers[0]

    const customerBills = bills
        .filter(b => b.customerId === currentCustomer?.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const pendingBill = customerBills.find(b => b.status === 'pending')

    const handlePayBill = (billId) => {
        payBill(billId)
    }

    return (
        <div className={styles.billing}>
            {/* Current Bill */}
            {pendingBill && (
                <GlassCard className={styles.currentBill} glow glowColor="warning">
                    <div className={styles.billHeader}>
                        <div>
                            <h2 className={styles.billTitle}>Finance Details</h2>
                            <span className={styles.billPeriod}>{pendingBill.month}</span>
                        </div>
                        <StatusBadge status="pending" />
                    </div>

                    <div className={styles.billAmount}>
                        <span className={styles.currency}>Rs</span>
                        <span className={styles.amount}>{pendingBill.amount.toLocaleString()}</span>
                    </div>

                    <div className={styles.billDetails}>
                        <div className={styles.detailItem}>
                            <Clock size={16} />
                            <span>Due: {pendingBill.dueDate}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <Receipt size={16} />
                            <span>{pendingBill.usageLiters}L used</span>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        icon={CreditCard}
                        onClick={() => handlePayBill(pendingBill.id)}
                    >
                        Pay Now
                    </Button>
                </GlassCard>
            )}

            {/* Payment History */}
            <div className={styles.historySection}>
                <h3 className={styles.sectionTitle}>Payment History</h3>

                <div className={styles.timeline}>
                    {customerBills.map((bill, index) => (
                        <motion.div
                            key={bill.id}
                            className={styles.timelineItem}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={`${styles.timelineDot} ${bill.status === 'paid' ? styles.paid : styles.pending}`}>
                                {bill.status === 'paid' ? <Check size={14} /> : <Clock size={14} />}
                            </div>

                            <GlassCard className={styles.billCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardInfo}>
                                        <span className={styles.billMonth}>{bill.month}</span>
                                        <span className={styles.billId}>{bill.id}</span>
                                    </div>
                                    <div className={styles.cardAmount}>
                                        <span className={styles.cardPrice}>Rs {bill.amount.toLocaleString()}</span>
                                        <StatusBadge status={bill.status} size="sm" />
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.cardDate}>
                                        {bill.status === 'paid'
                                            ? `Paid on ${bill.paidDate}`
                                            : `Due ${bill.dueDate}`
                                        }
                                    </span>
                                    <button className={styles.downloadBtn}>
                                        <Download size={16} />
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Finance
