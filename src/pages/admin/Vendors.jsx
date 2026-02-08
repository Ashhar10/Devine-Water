import { useState } from 'react'
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
    List
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Vendors.module.css'

function Vendors() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingVendor, setEditingVendor] = useState(null)
    const [vendorToDelete, setVendorToDelete] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState('grid')
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        openingBalance: 0,
        remarks: ''
    })

    const navigate = useNavigate()
    const [showLedgerModal, setShowLedgerModal] = useState(false)
    const [selectedVendorForLedger, setSelectedVendorForLedger] = useState(null)
    const [ledgerTransactions, setLedgerTransactions] = useState([])
    const [isLoadingLedger, setIsLoadingLedger] = useState(false)

    const vendors = useDataStore(state => state.vendors)
    const addVendor = useDataStore(state => state.addVendor)
    const updateVendor = useDataStore(state => state.updateVendor)
    const deleteVendor = useDataStore(state => state.deleteVendor)
    const getVendorLedger = useDataStore(state => state.getVendorLedger)

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm)
    )

    const stats = {
        total: vendors.length,
        active: vendors.filter(v => v.status === 'active').length,
        totalBalance: vendors.reduce((sum, v) => sum + (v.currentBalance || 0), 0)
    }

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

    const handleLedgerClick = async (vendor) => {
        setSelectedVendorForLedger(vendor)
        setShowLedgerModal(true)
        setIsLoadingLedger(true)
        setLedgerTransactions([]) // Reset
        try {
            const data = await getVendorLedger(vendor.uuid)
            setLedgerTransactions(data)
        } catch (error) {
            console.error('Error fetching ledger:', error)
        } finally {
            setIsLoadingLedger(false)
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

            {/* Vendors Grid */}
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
                                        <span className={styles.balanceLabel}>Opening Balance</span>
                                        <span className={styles.balanceValue}>Rs {vendor.openingBalance?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className={styles.balanceItem}>
                                        <span className={styles.balanceLabel}>Current Balance</span>
                                        <span className={`${styles.balanceValue} ${styles.highlight}`}>
                                            Rs {vendor.currentBalance?.toLocaleString() || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.quickActions}>
                                        <button className={styles.quickBtn} onClick={() => handleLedgerClick(vendor)}>
                                            <FileText size={14} />
                                            <span>Ledger</span>
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
                                                <span className={styles.tableLabel}>Opening:</span>
                                                <span>Rs {vendor.openingBalance?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className={styles.tableBalanceItem}>
                                                <span className={styles.tableLabel}>Current:</span>
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
                                            <button className={styles.actionBtn} title="Ledger" onClick={() => handleLedgerClick(vendor)}>
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

            {/* Add/Edit Modal */}
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

                        <div className={styles.modalActions}>
                            <Button
                                variant="ghost"
                                onClick={() => setVendorToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                            >
                                Delete Vendor
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Vendor Ledger Modal */}
            {showLedgerModal && selectedVendorForLedger && (
                <div className={styles.modalOverlay} onClick={() => setShowLedgerModal(false)}>
                    <GlassCard className={`${styles.modal} ${styles.ledgerModal}`} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>
                                <FileText size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Vendor Ledger: {selectedVendorForLedger.name}
                            </h3>
                            <button className={styles.closeBtn} onClick={() => setShowLedgerModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.ledgerInfo}>
                            <div className={styles.infoBox}>
                                <span className={styles.infoLabel}>Opening Balance</span>
                                <span className={styles.infoValue}>Rs {selectedVendorForLedger.openingBalance?.toLocaleString()}</span>
                            </div>
                            <div className={styles.infoBox}>
                                <span className={styles.infoLabel}>Current Payable</span>
                                <span className={`${styles.infoValue} ${styles.highlight}`}>Rs {selectedVendorForLedger.currentBalance?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className={styles.ledgerTableContainer}>
                            {isLoadingLedger ? (
                                <div className={styles.ledgerLoading}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading transaction history...</p>
                                </div>
                            ) : ledgerTransactions.length === 0 ? (
                                <div className={styles.ledgerEmpty}>
                                    <FileText size={48} />
                                    <p>No transactions found for this vendor.</p>
                                </div>
                            ) : (
                                <table className={styles.ledgerTable}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th className={styles.textRight}>Debit (Purchase)</th>
                                            <th className={styles.textRight}>Credit (Payment)</th>
                                            <th className={styles.textRight}>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className={styles.openingRow}>
                                            <td>-</td>
                                            <td>Opening Balance</td>
                                            <td className={styles.textRight}>-</td>
                                            <td className={styles.textRight}>-</td>
                                            <td className={styles.textRight}>Rs {selectedVendorForLedger.openingBalance?.toLocaleString()}</td>
                                        </tr>
                                        {(() => {
                                            let currentBal = selectedVendorForLedger.openingBalance || 0;
                                            return ledgerTransactions.map((item, idx) => {
                                                if (item.type === 'debit') currentBal += item.amount;
                                                else if (item.type === 'credit') currentBal -= item.amount;

                                                return (
                                                    <tr key={idx}>
                                                        <td>{new Date(item.date).toLocaleDateString()}</td>
                                                        <td>{item.description}</td>
                                                        <td className={`${styles.textRight} ${styles.debitCol}`}>
                                                            {item.type === 'debit' ? `Rs ${item.amount.toLocaleString()}` : '-'}
                                                        </td>
                                                        <td className={`${styles.textRight} ${styles.creditCol}`}>
                                                            {item.type === 'credit' ? `Rs ${item.amount.toLocaleString()}` : '-'}
                                                        </td>
                                                        <td className={`${styles.textRight} ${styles.balanceCol}`}>
                                                            Rs {currentBal.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Vendors
