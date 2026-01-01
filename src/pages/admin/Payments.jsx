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
    const [formData, setFormData] = useState({
        paymentType: 'customer',
        referenceId: '',
        amount: '',
        paymentMode: 'cash',
        bankId: '',
        chequeNo: '',
        remarks: ''
    })

    const customers = useDataStore(state => state.customers)
    const vendors = useDataStore(state => state.vendors)
    const banks = useDataStore(state => state.banks)

    // Mock payments data - will connect to real store later
    const payments = useMemo(() => [
        { id: 'PAY-001', paymentType: 'customer', referenceName: 'Ali Hassan', amount: 5000, paymentMode: 'cash', paymentDate: '2024-12-24', status: 'completed' },
        { id: 'PAY-002', paymentType: 'customer', referenceName: 'Fatima Khan', amount: 3200, paymentMode: 'bank_transfer', paymentDate: '2024-12-24', status: 'completed' },
        { id: 'PAY-003', paymentType: 'vendor', referenceName: 'ABC Supplies', amount: 15000, paymentMode: 'cheque', paymentDate: '2024-12-23', status: 'pending' },
    ], [])

    const filteredPayments = payments.filter(p => {
        const matchesType = filterType === 'all' || p.paymentType === filterType
        const matchesSearch = p.referenceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesType && matchesSearch
    })

    const stats = useMemo(() => ({
        totalReceived: payments.filter(p => p.paymentType === 'customer').reduce((sum, p) => sum + p.amount, 0),
        totalPaid: payments.filter(p => p.paymentType === 'vendor').reduce((sum, p) => sum + p.amount, 0),
        todayCount: payments.filter(p => p.paymentDate === new Date().toISOString().split('T')[0]).length
    }), [payments])

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('Submitting payment:', formData)
        setShowPaymentModal(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            paymentType: 'customer',
            referenceId: '',
            amount: '',
            paymentMode: 'cash',
            bankId: '',
            chequeNo: '',
            remarks: ''
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((payment, index) => (
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
                                    {payment.referenceName}
                                </td>
                                <td className={`${styles.amount} ${payment.paymentType === 'customer' ? styles.income : styles.expense}`}>
                                    {payment.paymentType === 'customer' ? '+' : '-'} Rs {payment.amount.toLocaleString()}
                                </td>
                                <td className={styles.modeCell}>
                                    {payment.paymentMode.replace('_', ' ')}
                                </td>
                                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                <td>
                                    <StatusBadge status={payment.status} size="sm" />
                                </td>
                            </motion.tr>
                        ))}
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
                                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                                    required
                                >
                                    <option value="">Select {formData.paymentType}</option>
                                    {referenceList.filter(r => r.status === 'active').map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} {r.currentBalance ? `(Balance: Rs ${r.currentBalance})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

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

                            {/* Remarks */}
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Any notes..."
                                />
                            </div>

                            <Button type="submit" variant="primary" fullWidth>
                                {formData.paymentType === 'customer' ? 'Receive Payment' : 'Make Payment'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Payments
