import { useState } from 'react'
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
    FileText
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        openingBalance: 0,
        remarks: ''
    })

    const vendors = useDataStore(state => state.vendors)
    const addVendor = useDataStore(state => state.addVendor)
    const updateVendor = useDataStore(state => state.updateVendor)
    const deleteVendor = useDataStore(state => state.deleteVendor)

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

    const handleDelete = async (vendor) => {
        if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
            try {
                await deleteVendor(vendor.id)
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
                <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Vendor
                </Button>
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
                                    <button className={styles.quickBtn}>
                                        <FileText size={14} />
                                        <span>Ledger</span>
                                    </button>
                                    <button className={styles.quickBtn}>
                                        <Wallet size={14} />
                                        <span>Payment</span>
                                    </button>
                                </div>
                                <div className={styles.actionBtns}>
                                    <button className={styles.actionBtn} onClick={() => handleEdit(vendor)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(vendor)}>
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
        </div>
    )
}

export default Vendors
