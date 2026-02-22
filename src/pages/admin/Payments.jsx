import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
    Clock,
    Edit,
    Trash2,
    RotateCcw
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useDisableBodyScroll } from '../../hooks/useDisableBodyScroll'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import styles from './Payments.module.css'

const PAYMENT_MODES = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'cheque', label: 'Cheque', icon: FileText },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
    { id: 'online', label: 'Online', icon: CreditCard }
]

const CACHE_KEY = 'devine_payment_form_cache'
const getEmptyPaymentData = () => ({
    paymentType: 'customer',
    referenceId: '',
    amount: '',
    paymentMode: 'cash',
    bankId: '',
    chequeNo: '',
    remarks: '',
    paymentDate: new Date().toISOString().split('T')[0]
})

function Payments() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [editingPayment, setEditingPayment] = useState(null)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    })
    const [filterType, setFilterType] = useState('all')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBalance, setSelectedBalance] = useState(0)
    const [formData, setFormData] = useState(getEmptyPaymentData())

    const customers = useDataStore(state => state.customers)
    const vendors = useDataStore(state => state.vendors)
    const banks = useDataStore(state => state.banks)
    const payments = useDataStore(state => state.payments)
    const addPayment = useDataStore(state => state.addPayment)
    const updatePayment = useDataStore(state => state.updatePayment)
    const deletePayment = useDataStore(state => state.deletePayment)

    // Handle body scroll locking
    useDisableBodyScroll(showPaymentModal || confirmModal.isOpen)

    const location = useLocation()

    // Handle pre-selected vendor/customer from navigation state
    useEffect(() => {
        if (location.state?.vendorUuid) {
            setFormData(prev => ({
                ...prev,
                paymentType: 'vendor',
                referenceId: location.state.vendorUuid
            }))

            const vendor = vendors.find(v => v.uuid === location.state.vendorUuid)
            if (vendor) {
                setSelectedBalance(vendor.currentBalance || 0)
            }

            setShowPaymentModal(true)
            // Clear state to avoid re-opening on manual refresh but keep navigation history clean
            // window.history.replaceState({}, document.title)
        } else if (location.state?.customerUuid) {
            setFormData(prev => ({
                ...prev,
                paymentType: 'customer',
                referenceId: location.state.customerUuid
            }))

            const customer = customers.find(c => c.uuid === location.state.customerUuid)
            if (customer) {
                setSelectedBalance(customer.currentBalance || 0)
            }

            setShowPaymentModal(true)
        }
    }, [location.state, vendors, customers])

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

    // Draft persistence effects
    useEffect(() => {
        // Only load draft if there's no navigation state
        if (location.state?.vendorUuid || location.state?.customerUuid) return

        const cached = localStorage.getItem(CACHE_KEY)
        if (cached && !showPaymentModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.referenceId || parsed.amount) {
                    setFormData(parsed)
                    // Also try to restore balance if reference is present
                    if (parsed.referenceId) {
                        const referenceList = parsed.paymentType === 'customer' ? customers : vendors
                        const selected = referenceList.find(r => r.uuid === parsed.referenceId)
                        setSelectedBalance(selected?.currentBalance || 0)
                    }
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY)
            }
        }
    }, [showPaymentModal, location.state, customers, vendors])

    useEffect(() => {
        if (showPaymentModal && !editingPayment) {
            const hasData = formData.referenceId || formData.amount || formData.remarks
            if (hasData) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
            }
        }
    }, [formData, showPaymentModal, editingPayment])

    const clearDraft = () => {
        localStorage.removeItem(CACHE_KEY)
        setFormData(getEmptyPaymentData())
        setSelectedBalance(0)
    }

    const resetForm = () => {
        setFormData(getEmptyPaymentData())
        setSelectedBalance(0)
        setShowPaymentModal(false)
        setEditingPayment(null)
    }

    const handleCloseModal = () => {
        resetForm()
    }

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
            if (editingPayment) {
                await updatePayment(editingPayment.id, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            } else {
                await addPayment(formData)
            }
            localStorage.removeItem(CACHE_KEY)
            resetForm()
        } catch (error) {
            console.error('Error recording payment:', error)
            alert('Failed to record payment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditPayment = (payment) => {
        setEditingPayment(payment)
        setFormData({
            paymentType: payment.paymentType,
            referenceId: payment.referenceId,
            amount: payment.amount,
            paymentMode: payment.paymentMode,
            bankId: payment.bankId || '',
            chequeNo: payment.chequeNo || '',
            remarks: payment.remarks || '',
            paymentDate: payment.paymentDate
        })
        setShowPaymentModal(true)
    }

    const handleDeletePayment = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Payment',
            message: 'Are you sure you want to delete this payment record? This will adjust the balance accordingly. This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deletePayment(id)
                } catch (error) {
                    console.error('Error deleting payment:', error)
                }
            }
        })
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
                            <th>Actions</th>
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
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleEditPayment(payment)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDeletePayment(payment.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingPayment ? 'Edit Payment' : 'New Payment'}</h3>
                            <div className={styles.headerActions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {!editingPayment && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={clearDraft}
                                        title="Clear form"
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={handleCloseModal}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.modalBody}>
                            <form id="paymentForm" onSubmit={handleSubmit}>
                                <div className={styles.formRow}>
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

                                    placeholder="Optional notes"
                                />
                                </div>
                            </form>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                variant="secondary"
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                form="paymentForm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : (formData.paymentType === 'customer' ? 'Receive Payment' : 'Make Payment')}
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    )
}

export default Payments
