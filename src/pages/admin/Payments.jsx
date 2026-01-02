import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    Wallet,
    User,
    Calendar,
    CreditCard,
    Banknote,
    X,
    FileText,
    TrendingUp,
    Clock
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Payments.module.css'

const PAYMENT_MODES = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'cheque', label: 'Cheque', icon: FileText },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
    { id: 'online', label: 'Online', icon: CreditCard }
]

function Payments() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [filterType, setFilterType] = useState('all')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBalance, setSelectedBalance] = useState(0)
    const [formData, setFormData] = useState({
        paymentType: 'customer',
        referenceId: '',
        amount: '',
        paymentMode: 'cash',
        bankId: '',
        chequeNo: '',
        remarks: '',
        paymentDate: new Date().toISOString().split('T')[0]  // Default to today
    })

    const customers = useDataStore(state => state.customers)
    const vendors = useDataStore(state => state.vendors)
    const banks = useDataStore(state => state.banks)
    const payments = useDataStore(state => state.payments)
    const addPayment = useDataStore(state => state.addPayment)

    const filteredPayments = payments.filter(p => {
        const matchesType = filterType === 'all' || p.paymentType === filterType
        const matchesSearch = searchTerm === '' ||
            (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesType && matchesSearch
    })

    const stats = useMemo(() => ({
        totalReceived: payments.filter(p => p.paymentType === 'customer').reduce((sum, p) => sum + p.amount, 0),
        totalPaid: payments.filter(p => p.paymentType === 'vendor').reduce((sum, p) => sum + p.amount, 0),
        todayCount: payments.filter(p => p.paymentDate === new Date().toISOString().split('T')[0]).length
    }), [payments])

    // Calculate change amount
    const changeAmount = useMemo(() => {
        const amount = parseFloat(formData.amount) || 0
        if (formData.paymentType === 'customer') {
            // For customer payments, change = amount paid - balance owed
            return amount > selectedBalance ? amount - selectedBalance : 0
        }
        return 0
    }, [formData.amount, selectedBalance, formData.paymentType])

    // Handle reference selection and auto-fill balance
    const handleReferenceChange = (e) => {
        const referenceId = e.target.value
        setFormData({ ...formData, referenceId })

        if (referenceId) {
            const referenceList = formData.paymentType === 'customer' ? customers : vendors
            const selected = referenceList.find(r => r.uuid === referenceId)
            setSelectedBalance(selected?.currentBalance || 0)
        } else {
            setSelectedBalance(0)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await addPayment(formData)
            setShowPaymentModal(false)
            resetForm()
        } catch (error) {
            console.error('Error recording payment:', error)
            alert('Failed to record payment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            paymentType: 'customer',
            referenceId: '',
            amount: '',
            paymentMode: 'cash',
            bankId: '',
            chequeNo: '',
            remarks: '',
            paymentDate: new Date().toISOString().split('T')[0]
        })
        setSelectedBalance(0)
    }

    // Get reference list based on payment type
    const referenceList = formData.paymentType === 'customer' ? customers : vendors

    return (
        <div className={styles.payments}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>
                        <Wallet size={28} />
                        Payments
                    </h1>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setShowPaymentModal(true)}>
                    Record Payment
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard}>
                    <TrendingUp size={24} className={`${styles.statIcon} ${styles.income}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.income}`}>Rs {stats.totalReceived.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Received</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Wallet size={24} className={`${styles.statIcon} ${styles.expense}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.expense}`}>Rs {stats.totalPaid.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Paid</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Clock size={24} className={styles.statIcon} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.todayCount}</span>
                        <span className={styles.statLabel}>Today's Transactions</span>
                    </div>
                </GlassCard>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterTab} ${filterType === 'all' ? styles.active : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterType === 'customer' ? styles.active : ''}`}
                        onClick={() => setFilterType('customer')}
                    >
                        Received
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterType === 'vendor' ? styles.active : ''}`}
                        onClick={() => setFilterType('vendor')}
                    >
                        Paid
                    </button>
                </div>
            </div>

            {/* Payments List */}
            <GlassCard className={styles.paymentsTable}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Mode</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((payment, index) => {
                            // Use referenceName if available, otherwise lookup
                            let referenceName = payment.referenceName
                            if (!referenceName || referenceName === 'Unknown') {
                                if (payment.paymentType === 'customer') {
                                    const customer = customers.find(c => c.uuid === payment.referenceId)
                                    referenceName = customer?.name || 'Unknown Customer'
                                } else {
                                    const vendor = vendors.find(v => v.uuid === payment.referenceId)
                                    referenceName = vendor?.name || 'Unknown Vendor'
                                }
                            }

                            return (
                                <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <td className={styles.paymentId}>{payment.id}</td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${styles[payment.paymentType]}`}>
                                            {payment.paymentType === 'customer' ? 'Received' : 'Paid'}
                                        </span>
                                    </td>
                                    <td className={styles.nameCell}>
                                        <User size={14} />
                                        {referenceName}
                                    </td>
                                    <td className={`${styles.amount} ${payment.paymentType === 'customer' ? styles.income : styles.expense}`}>
                                        {payment.paymentType === 'customer' ? '+' : '-'} Rs {payment.amount.toLocaleString()}
                                    </td>
                                    <td className={styles.modeCell}>
                                        {payment.paymentMode ? payment.paymentMode.replace('_', ' ') : 'N/A'}
                                    </td>
                                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td>
                                        <StatusBadge status={payment.status} size="sm" />
                                    </td>
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredPayments.length === 0 && (
                    <div className={styles.emptyState}>
                        <Wallet size={48} />
                        <h3>No payments found</h3>
                        <p>Record your first payment to get started</p>
                    </div>
                )}
            </GlassCard>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Record Payment</h3>
                            <button className={styles.closeBtn} onClick={() => setShowPaymentModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Payment Type */}
                            <div className={styles.formGroup}>
                                <label>Payment Type</label>
                                <div className={styles.typeSelector}>
                                    <button
                                        type="button"
                                        className={`${styles.typeBtn} ${formData.paymentType === 'customer' ? styles.activeReceive : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentType: 'customer', referenceId: '' })}
                                    >
                                        <TrendingUp size={18} />
                                        Receive from Customer
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.typeBtn} ${formData.paymentType === 'vendor' ? styles.activePay : ''}`}
                                        onClick={() => setFormData({ ...formData, paymentType: 'vendor', referenceId: '' })}
                                    >
                                        <Wallet size={18} />
                                        Pay to Vendor
                                    </button>
                                </div>
                            </div>

                            {/* Reference Selection */}
                            <div className={styles.formGroup}>
                                <label>{formData.paymentType === 'customer' ? 'Customer' : 'Vendor'} *</label>
                                <select
                                    value={formData.referenceId}
                                    onChange={handleReferenceChange}
                                    required
                                >
                                    <option value="">Select {formData.paymentType}</option>
                                    {referenceList.filter(r => r.status === 'active').map(r => (
                                        <option key={r.id} value={r.uuid}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Current Balance Display */}
                            {formData.referenceId && (
                                <div className={styles.balanceDisplay}>
                                    <div className={styles.balanceInfo}>
                                        <span className={styles.balanceLabel}>Current Balance:</span>
                                        <span className={styles.balanceAmount}>Rs {selectedBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <div className={styles.formGroup}>
                                <label>Amount (Rs) *</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Change/Remaining Display for Customer Payments */}
                            {formData.paymentType === 'customer' && formData.amount && formData.referenceId && (
                                <div className={styles.calculationDisplay}>
                                    {changeAmount > 0 ? (
                                        <div className={styles.changeInfo}>
                                            <span className={styles.changeLabel}>Change to Return:</span>
                                            <span className={styles.changeAmount}>Rs {changeAmount.toLocaleString()}</span>
                                        </div>
                                    ) : parseFloat(formData.amount) < selectedBalance ? (
                                        <div className={styles.remainingInfo}>
                                            <span className={styles.remainingLabel}>Remaining Balance:</span>
                                            <span className={styles.remainingAmount}>
                                                Rs {(selectedBalance - parseFloat(formData.amount)).toLocaleString()}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={styles.paidInfo}>
                                            <span className={styles.paidLabel}>✓ Fully Paid</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Mode */}
                            <div className={styles.formGroup}>
                                <label>Payment Mode</label>
                                <div className={styles.modeGrid}>
                                    {PAYMENT_MODES.map(mode => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            className={`${styles.modeBtn} ${formData.paymentMode === mode.id ? styles.selected : ''}`}
                                            onClick={() => setFormData({ ...formData, paymentMode: mode.id })}
                                        >
                                            <mode.icon size={16} />
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bank Selection for non-cash */}
                            {formData.paymentMode !== 'cash' && (
                                <div className={styles.formGroup}>
                                    <label>Bank Account</label>
                                    <select
                                        value={formData.bankId}
                                        onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                                    >
                                        <option value="">Select bank</option>
                                        {banks.map(bank => (
                                            <option key={bank.id} value={bank.id}>{bank.bankName} - {bank.accountTitle}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Cheque Number */}
                            {formData.paymentMode === 'cheque' && (
                                <div className={styles.formGroup}>
                                    <label>Cheque Number</label>
                                    <input
                                        type="text"
                                        value={formData.chequeNo}
                                        onChange={(e) => setFormData({ ...formData, chequeNo: e.target.value })}
                                        placeholder="Enter cheque number"
                                    />
                                </div>
                            )}

                            {/* Payment Date */}
                            <div className={styles.formGroup}>
                                <label>Payment Date</label>
                                <input
                                    type="date"
                                    value={formData.paymentDate}
                                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                />
                            </div>

                            {/* Remarks */}
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Optional notes"
                                />
                            </div>

                            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (formData.paymentType === 'customer' ? 'Receive Payment' : 'Make Payment')}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Payments
