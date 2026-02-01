import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Edit2, Trash2, X, Shield, UserCheck } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './UserManagement.module.css'

const ROLES = ['admin', 'staff', 'customer']
const DESIGNATIONS = ['Administrator', 'Manager', 'Supervisor', 'Accountant', 'Delivery Boy', 'Receptionist', 'Customer']

// Map labels to paths as defined in AdminSidebar.jsx
const AVAILABLE_SECTIONS = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Customers', path: '/admin/customers' },
    { label: 'Orders & Billing', path: '/admin/orders' },
    { label: 'Vendors', path: '/admin/vendors' },
    { label: 'Delivery', path: '/admin/delivery' },
    { label: 'Payments', path: '/admin/payments' },
    { label: 'Finance', path: '/admin/finance' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Staff & Users', path: '/admin/users' },
    { label: 'Customer Panel', path: '/customer' },
]

function UserManagement() {
    const users = useDataStore(state => state.users)
    const customers = useDataStore(state => state.customers)
    const addUser = useDataStore(state => state.addUser)
    const updateUser = useDataStore(state => state.updateUser)
    const deleteUser = useDataStore(state => state.deleteUser)

    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('All')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        designation: '',
        phone: '',
        customerId: '',
        permittedSections: []
    })

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.designation?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTab = activeTab === 'All' || user.designation === activeTab

        return matchesSearch && matchesTab
    })

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                designation: user.designation || '',
                phone: user.phone || '',
                customerId: user.customerId || '',
                permittedSections: user.permittedSections || []
            })
        } else {
            setEditingUser(null)
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'staff',
                designation: '',
                phone: '',
                customerId: '',
                permittedSections: []
            })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (editingUser) {
            const updates = { ...formData }
            if (!updates.password) delete updates.password
            await updateUser(editingUser.id, updates)
        } else {
            await addUser(formData)
        }

        setShowModal(false)
        setEditingUser(null)
    }

    const handleDelete = async (userId) => {
        // Delete without confirmation (can add custom modal later)
        await deleteUser(userId)
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield size={16} />
            case 'staff': return <UserCheck size={16} />
            default: return <Users size={16} />
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Manage system users and access</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
                    Add User
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <GlassCard className={styles.statCard}>
                    <div className={styles.statValue}>{users.length}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <div className={styles.statValue}>{users.filter(u => u.role === 'admin').length}</div>
                    <div className={styles.statLabel}>Admins</div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <div className={styles.statValue}>{users.filter(u => u.role === 'staff').length}</div>
                    <div className={styles.statLabel}>Staff</div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <div className={styles.statValue}>{users.filter(u => u.status === 'active').length}</div>
                    <div className={styles.statLabel}>Active</div>
                </GlassCard>
            </div>

            {/* TABS */}
            <div className={styles.tabContainer}>
                <div className={styles.tabs}>
                    {['All', ...DESIGNATIONS].map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Users List */}
            <GlassCard className={styles.usersCard}>
                {filteredUsers.length === 0 ? (
                    <div className={styles.empty}>
                        <Users size={48} />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className={styles.usersList}>
                        {filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                className={styles.userItem}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={styles.userInfo}>
                                    <div className={styles.userAvatar}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.userDetails}>
                                        <div className={styles.userName}>{user.name}</div>
                                        <div className={styles.userEmail}>{user.email}</div>
                                    </div>
                                </div>
                                <div className={styles.userRole}>
                                    <span className={`${styles.roleTag} ${styles[user.role]}`}>
                                        {getRoleIcon(user.role)}
                                        {user.role}
                                    </span>
                                </div>
                                <div className={styles.userDesignation}>
                                    {user.designation || '-'}
                                </div>
                                <div className={styles.userStatus}>
                                    <StatusBadge status={user.status} />
                                </div>
                                <div className={styles.userActions}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleOpenModal(user)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.danger}`}
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                            minLength={6}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Role *</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            required
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Designation</label>
                                        <select
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        >
                                            <option value="">Select Designation</option>
                                            {DESIGNATIONS.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.role !== 'customer' && (
                                        <div className={styles.permissionsGroup}>
                                            <label className={styles.permTitle}>Section Access Permitted *</label>
                                            <div className={styles.permGrid}>
                                                {AVAILABLE_SECTIONS.map(section => (
                                                    <label key={section.path} className={styles.permItem}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permittedSections.includes(section.path)}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    permittedSections: checked
                                                                        ? [...prev.permittedSections, section.path]
                                                                        : prev.permittedSections.filter(s => s !== section.path)
                                                                }))
                                                            }}
                                                        />
                                                        <span>{section.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {formData.role === 'customer' && (
                                        <div className={styles.formGroup}>
                                            <label>Link to Customer</label>
                                            <select
                                                value={formData.customerId}
                                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            >
                                                <option value="">Select Customer</option>
                                                {customers.map(c => (
                                                    <option key={c.id} value={c.uuid}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formActions}>
                                    <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        {editingUser ? 'Update User' : 'Add User'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserManagement
