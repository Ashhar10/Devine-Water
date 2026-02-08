import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    Store,
    Phone,
    Mail,
    MapPin,
    Edit,
    Trash,
    X,
    Wallet,
    FileText,
    AlertTriangle,
    LayoutGrid,
    List,
    Calendar,
    ChevronDown
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Vendors.module.css'

function Vendors() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingVendor, setEditingVendor] = useState(null)
    const [vendorToDelete, setVendorToDelete] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState('grid')
    const [dateFilter, setDateFilter] = useState('all') // all, current_month, last_month, week, custom
    const [customDates, setCustomDates] = useState({
        start: '',
        end: ''
    })
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        openingBalance: 0,
        remarks: ''
    })

    const [showAddBillModal, setShowAddBillModal] = useState(false)
    const [selectedVendorForBill, setSelectedVendorForBill] = useState(null)
    const [billForm, setBillForm] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        invoiceNo: '',
        billBookNo: '',
        remarks: ''
    })

    const vendors = useDataStore(state => state.vendors)
    const addVendor = useDataStore(state => state.addVendor)
    const updateVendor = useDataStore(state => state.updateVendor)
    const deleteVendor = useDataStore(state => state.deleteVendor)
    const addPurchase = useDataStore(state => state.addPurchase)
    const purchaseOrders = useDataStore(state => state.purchaseOrders)

    // Helper to check if date is in range
    const isDateInRange = (dateStr) => {
        if (dateFilter === 'all') return true
        if (!dateStr) return false

        const date = new Date(dateStr)
        const now = new Date()

        if (dateFilter === 'current_month') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }

        if (dateFilter === 'last_month') {
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
            const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
        }

        if (dateFilter === 'week') {
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(now.getDate() - 7)
            return date >= oneWeekAgo && date <= now
        }

        if (dateFilter === 'custom') {
            const start = customDates.start ? new Date(customDates.start) : null
            const end = customDates.end ? new Date(customDates.end) : null
            if (start && end) {
                return date >= start && date <= end
            }
            if (start) return date >= start
            if (end) return date <= end
            return true
        }

        return true
    }

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.phone.includes(searchTerm)
            const matchesDate = isDateInRange(v.createdAt)
            return matchesSearch && matchesDate
        })
    }, [vendors, searchTerm, dateFilter, customDates])

    // Calculate dynamic stats for each vendor based on filtered purchases
    const vendorStatsMap = useMemo(() => {
        const stats = {}
        vendors.forEach(v => {
            // Find all purchases for this vendor in the filtered range
            const vendorPurchases = purchaseOrders.filter(p =>
                p.vendorUuid === v.uuid && isDateInRange(p.date)
            )
            const spent = vendorPurchases.reduce((sum, p) => sum + p.amount, 0)
            stats[v.uuid] = { spent }
        })
        return stats
    }, [vendors, purchaseOrders, dateFilter, customDates])

    const stats = useMemo(() => {
        return {
            total: vendors.length,
            active: vendors.filter(v => v.status === 'active').length,
            totalBalance: vendors.reduce((sum, v) => sum + (v.currentBalance || 0), 0)
        }
    }, [vendors])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingVendor) {
                await updateVendor(editingVendor.id, formData)
            } else {
                await addVendor(formData)
            }
            resetForm()
        } catch (error) {
            console.error('Error saving vendor:', error)
            alert('Failed to save vendor. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor)
    }

    const confirmDelete = async () => {
        if (vendorToDelete) {
            try {
                await deleteVendor(vendorToDelete.id)
                setVendorToDelete(null)
            } catch (error) {
                console.error('Error deleting vendor:', error)
                alert('Failed to delete vendor. Please try again.')
            }
        }
    }

    const handleEdit = (vendor) => {
        setEditingVendor(vendor)
        setFormData({
            name: vendor.name,
            contactPerson: vendor.contactPerson || '',
            phone: vendor.phone,
            email: vendor.email || '',
            address: vendor.address || '',
            openingBalance: vendor.openingBalance || 0,
            remarks: vendor.remarks || ''
        })
        setShowAddModal(true)
    }

    const resetForm = () => {
        setShowAddModal(false)
        setEditingVendor(null)
        setFormData({
            name: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
            openingBalance: 0,
            remarks: ''
        })
    }

    const handleAddBillClick = (vendor) => {
        setSelectedVendorForBill(vendor)
        setBillForm({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            invoiceNo: '',
            billBookNo: '',
            remarks: ''
        })
        setShowAddBillModal(true)
    }

    const handleBillSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addPurchase({
                ...billForm,
                vendorUuid: selectedVendorForBill.uuid
            })
            setShowAddBillModal(false)
        } catch (error) {
            console.error('Error adding bill:', error)
            alert('Failed to add bill. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePaymentClick = (vendor) => {
        navigate('/admin/payments', { state: { vendorUuid: vendor.uuid } })
    }

    return (
        <div className={styles.vendors}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filterControls}>
                    <div className={styles.dateSelector}>
                        <Calendar size={18} className={styles.filterIcon} />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Time</option>
                            <option value="week">This Week</option>
                            <option value="current_month">This Month</option>
                            <option value="last_month">Last Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className={styles.customDateRange}>
                            <input
                                type="date"
                                value={customDates.start}
                                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                                className={styles.dateInput}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={customDates.end}
                                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                                className={styles.dateInput}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                        Add Vendor
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard}>
                    <Store size={24} className={styles.statIcon} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Vendors</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Store size={24} className={`${styles.statIcon} ${styles.active}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.active}`}>{stats.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Wallet size={24} className={`${styles.statIcon} ${styles.warning}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.warning}`}>Rs {stats.totalBalance.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Payable</span>
                    </div>
                </GlassCard>
            </div>

            {/* Vendors Content */}
            {viewMode === 'grid' ? (
                <div className={styles.vendorsGrid}>
                    {filteredVendors.map((vendor, index) => (
                        <motion.div
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className={styles.vendorCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.vendorIcon}>
                                        <Store size={24} />
                                    </div>
                                    <div className={styles.headerInfo}>
                                        <span className={styles.vendorName}>{vendor.name}</span>
                                        <span className={styles.vendorId}>{vendor.id}</span>
                                    </div>
                                    <StatusBadge status={vendor.status} size="sm" />
                                </div>

                                <div className={styles.cardBody}>
                                    {vendor.contactPerson && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Contact Person</span>
                                            <span className={styles.infoValue}>{vendor.contactPerson}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <Phone size={14} />
                                        <span>{vendor.phone}</span>
                                    </div>
                                    {vendor.email && (
                                        <div className={styles.infoRow}>
                                            <Mail size={14} />
                                            <span>{vendor.email}</span>
                                        </div>
                                    )}
                                    {vendor.address && (
                                        <div className={styles.infoRow}>
                                            <MapPin size={14} />
                                            <span>{vendor.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.balanceSection}>
                                    <div className={styles.balanceItem}>
                                        <span className={styles.balanceLabel}>Total Spent ({dateFilter === 'all' ? 'Overall' : 'Selected Period'})</span>
                                        <span className={styles.balanceValue}>Rs {vendorStatsMap[vendor.uuid]?.spent.toLocaleString() || 0}</span>
                                    </div>
                                    <div className={styles.balanceItem}>
                                        <span className={styles.balanceLabel}>Payable Balance</span>
                                        <span className={`${styles.balanceValue} ${styles.highlight}`}>
                                            Rs {vendor.currentBalance?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.quickActions}>
                                        <button className={styles.quickBtn} onClick={() => handleAddBillClick(vendor)}>
                                            <FileText size={14} />
                                            <span>Add Bill</span>
                                        </button>
                                        <button className={styles.quickBtn} onClick={() => handlePaymentClick(vendor)}>
                                            <Wallet size={14} />
                                            <span>Payment</span>
                                        </button>
                                    </div>
                                    <div className={styles.actionBtns}>
                                        <button className={styles.actionBtn} onClick={() => handleEdit(vendor)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteClick(vendor)}>
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}

                    {filteredVendors.length === 0 && (
                        <div className={styles.emptyState}>
                            <Store size={48} />
                            <h3>No vendors found</h3>
                            <p>Add your first vendor/supplier to get started</p>
                            <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                                Add Vendor
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.listView}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Contact Information</th>
                                <th>Address</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map((vendor, index) => (
                                <motion.tr
                                    key={vendor.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={styles.tableRow}
                                >
                                    <td>
                                        <div className={styles.tableVendorInfo}>
                                            <div className={styles.tableVendorIcon}>
                                                <Store size={18} />
                                            </div>
                                            <div>
                                                <div className={styles.tableName}>{vendor.name}</div>
                                                <div className={styles.tableId}>{vendor.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tableContactPerson}>{vendor.contactPerson || '---'}</div>
                                        <div className={styles.tablePhone}>{vendor.phone}</div>
                                        <div className={styles.tableEmail}>{vendor.email}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tableAddress}>{vendor.address || '---'}</div>
                                    </td>
                                    <td>
                                        <div className={styles.tableBalanceInfo}>
                                            <div className={styles.tableBalanceItem}>
                                                <span className={styles.tableLabel}>Spent:</span>
                                                <span>Rs {vendorStatsMap[vendor.uuid]?.spent.toLocaleString() || 0}</span>
                                            </div>
                                            <div className={styles.tableBalanceItem}>
                                                <span className={styles.tableLabel}>Payable:</span>
                                                <span className={styles.highlight}>Rs {vendor.currentBalance?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><StatusBadge status={vendor.status} size="sm" /></td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button className={styles.actionBtn} onClick={() => handleEdit(vendor)} title="Edit">
                                                <Edit size={14} />
                                            </button>
                                            <button className={styles.actionBtn} title="Add Bill" onClick={() => handleAddBillClick(vendor)}>
                                                <FileText size={14} />
                                            </button>
                                            <button className={styles.actionBtn} title="Payment" onClick={() => handlePaymentClick(vendor)}>
                                                <Wallet size={14} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteClick(vendor)} title="Delete">
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Vendor Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
                            <button className={styles.closeBtn} onClick={resetForm}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Vendor/Company Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter vendor name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contact Person</label>
                                <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    placeholder="Person to contact"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+92 300 1234567"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="vendor@email.com"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full address"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Opening Balance (Rs)</label>
                                    <input
                                        type="number"
                                        value={formData.openingBalance}
                                        onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    placeholder="Any notes about this vendor"
                                />
                            </div>
                            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingVendor ? 'Update Vendor' : 'Add Vendor')}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Add Bill Modal */}
            {showAddBillModal && selectedVendorForBill && (
                <div className={styles.modalOverlay} onClick={() => setShowAddBillModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add Bill: {selectedVendorForBill.name}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAddBillModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBillSubmit}>
                            <div className={styles.formGroup}>
                                <label>Amount *</label>
                                <input
                                    type="number"
                                    value={billForm.amount}
                                    onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Invoice No</label>
                                    <input
                                        type="text"
                                        value={billForm.invoiceNo}
                                        onChange={(e) => setBillForm({ ...billForm, invoiceNo: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={billForm.date}
                                        onChange={(e) => setBillForm({ ...billForm, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    value={billForm.remarks}
                                    onChange={(e) => setBillForm({ ...billForm, remarks: e.target.value })}
                                    placeholder="Any notes"
                                />
                            </div>
                            <div className={styles.modalActions} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAddBillModal(false)}
                                    disabled={isSubmitting}
                                    fullWidth
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                    fullWidth
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Bill'}
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {vendorToDelete && (
                <div className={styles.modalOverlay} onClick={() => setVendorToDelete(null)}>
                    <GlassCard className={`${styles.modal} ${styles.deleteModal}`} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.deleteTitle}>
                                <AlertTriangle size={24} className={styles.warningIcon} />
                                Delete Vendor
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setVendorToDelete(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            <p>Are you sure you want to delete <strong>{vendorToDelete.name}</strong>?</p>
                            <p className={styles.warningText}>This action cannot be undone.</p>
                        </div>

                        <div className={styles.modalActions} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <Button
                                variant="ghost"
                                onClick={() => setVendorToDelete(null)}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                                fullWidth
                            >
                                Delete Vendor
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Vendors
