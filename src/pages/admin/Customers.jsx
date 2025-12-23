import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    MoreVertical,
    Phone,
    MapPin,
    Calendar,
    Droplets,
    X,
    Edit,
    Trash
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Customers.module.css'

function Customers() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })

    const customers = useDataStore(state => state.customers)
    const addCustomer = useDataStore(state => state.addCustomer)
    const updateCustomer = useDataStore(state => state.updateCustomer)
    const deleteCustomer = useDataStore(state => state.deleteCustomer)

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, formData)
        } else {
            addCustomer(formData)
        }
        setShowAddModal(false)
        setEditingCustomer(null)
        setFormData({ name: '', email: '', phone: '', address: '' })
    }

    const handleEdit = (customer) => {
        setEditingCustomer(customer)
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone,
            address: customer.address,
        })
        setShowAddModal(true)
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer(id)
        }
    }

    return (
        <div className={styles.customers}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Customer
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>Total Customers</span>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <span className={`${styles.statValue} ${styles.active}`}>{stats.active}</span>
                    <span className={styles.statLabel}>Active</span>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <span className={`${styles.statValue} ${styles.inactive}`}>{stats.inactive}</span>
                    <span className={styles.statLabel}>Inactive</span>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <span className={styles.statValue}>{filteredCustomers.length}</span>
                    <span className={styles.statLabel}>Showing</span>
                </GlassCard>
            </div>

            {/* Customers Grid */}
            <div className={styles.customersGrid}>
                {filteredCustomers.map((customer, index) => (
                    <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className={styles.customerCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {customer.name.charAt(0)}
                                </div>
                                <div className={styles.headerInfo}>
                                    <span className={styles.customerName}>{customer.name}</span>
                                    <span className={styles.customerId}>{customer.id}</span>
                                </div>
                                <StatusBadge status={customer.status} size="sm" />
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <Phone size={14} />
                                    <span>{customer.phone}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <MapPin size={14} />
                                    <span>{customer.address}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <Calendar size={14} />
                                    <span>Joined {customer.createdAt}</span>
                                </div>
                            </div>

                            <div className={styles.cardStats}>
                                <div className={styles.stat}>
                                    <Droplets size={16} className={styles.statIcon} />
                                    <div>
                                        <span className={styles.statNumber}>{customer.totalOrders}</span>
                                        <span className={styles.statText}>Orders</span>
                                    </div>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statCurrency}>Rs</span>
                                    <div>
                                        <span className={styles.statNumber}>{customer.totalSpent.toLocaleString()}</span>
                                        <span className={styles.statText}>Total Spent</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.actionBtns}>
                                    <button className={styles.actionBtn} onClick={() => handleEdit(customer)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(customer.id)}>
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => { setShowAddModal(false); setEditingCustomer(null); }}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
                            <button className={styles.closeBtn} onClick={() => { setShowAddModal(false); setEditingCustomer(null); }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+92 300 1234567"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter full address"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" fullWidth>
                                {editingCustomer ? 'Update Customer' : 'Add Customer'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Customers
