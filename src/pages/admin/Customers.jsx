import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    Phone,
    MapPin,
    Calendar,
    Droplets,
    X,
    Edit,
    Trash,
    Lock,
    Navigation,
    Crosshair,
    Wallet,
    Package
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import styles from './Customers.module.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Customers() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        latitude: null,
        longitude: null,
        areaId: '',
        deliveryDays: [],
        requiredBottles: 1,
        securityDeposit: 0,
        securityRemarks: '',
        openingBalance: 0,
        openingBottles: 0
    })

    const customers = useDataStore(state => state.customers)
    const areas = useDataStore(state => state.areas)
    const addCustomer = useDataStore(state => state.addCustomer)
    const updateCustomer = useDataStore(state => state.updateCustomer)
    const deleteCustomer = useDataStore(state => state.deleteCustomer)
    const addUser = useDataStore(state => state.addUser)

    // Toggle delivery day
    const toggleDeliveryDay = (day) => {
        setFormData(prev => ({
            ...prev,
            deliveryDays: prev.deliveryDays.includes(day)
                ? prev.deliveryDays.filter(d => d !== day)
                : [...prev.deliveryDays, day]
        }))
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        totalDeposits: customers.reduce((sum, c) => sum + (c.securityDeposit || 0), 0),
        totalOutstanding: customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0)
    }

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }))
                setGettingLocation(false)
                // Also get address from coordinates (reverse geocoding)
                fetchAddressFromCoords(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                console.error('Location error:', error)
                alert('Unable to get location. Please enable location services.')
                setGettingLocation(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    // Reverse geocoding to get address
    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            )
            const data = await response.json()
            if (data.display_name) {
                setFormData(prev => ({ ...prev, address: data.display_name }))
            }
        } catch (error) {
            console.error('Geocoding error:', error)
        }
    }

    // Open Google Maps directions
    const openDirections = (customer) => {
        if (customer.latitude && customer.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`,
                '_blank'
            )
        } else if (customer.address) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customer.address)}`,
                '_blank'
            )
        } else {
            alert('No location available for this customer')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (editingCustomer) {
            updateCustomer(editingCustomer.id, formData)
        } else {
            // Add customer
            const newCustomer = await addCustomer(formData)

            // Also create user account for customer login
            if (formData.password) {
                await addUser({
                    name: formData.name,
                    email: formData.email || `${formData.phone.replace(/\s+/g, '')}@customer.local`,
                    phone: formData.phone,
                    password: formData.password,
                    role: 'customer',
                    designation: 'Customer',
                    customerId: newCustomer?.uuid
                })
            }
        }

        setShowAddModal(false)
        setEditingCustomer(null)
        setFormData({ name: '', email: '', phone: '', address: '', password: '', latitude: null, longitude: null, areaId: '', deliveryDays: [], requiredBottles: 1, securityDeposit: 0, securityRemarks: '', openingBalance: 0, openingBottles: 0 })
    }

    const handleEdit = (customer) => {
        setEditingCustomer(customer)
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone,
            address: customer.address,
            password: '',
            latitude: customer.latitude || null,
            longitude: customer.longitude || null,
            areaId: customer.areaId || '',
            deliveryDays: customer.deliveryDays || [],
            requiredBottles: customer.requiredBottles || 1,
            securityDeposit: customer.securityDeposit || 0,
            securityRemarks: customer.securityRemarks || '',
            openingBalance: customer.openingBalance || 0,
            openingBottles: customer.openingBottles || 0
        })
        setShowAddModal(true)
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer(id)
        }
    }

    const resetForm = () => {
        setShowAddModal(false)
        setEditingCustomer(null)
        setFormData({ name: '', email: '', phone: '', address: '', password: '', latitude: null, longitude: null, areaId: '', deliveryDays: [], requiredBottles: 1, securityDeposit: 0, securityRemarks: '', openingBalance: 0, openingBottles: 0 })
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
                                        <span className={styles.statNumber}>{customer.totalSpent?.toLocaleString() || 0}</span>
                                        <span className={styles.statText}>Total Spent</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <button
                                    className={styles.directionsBtn}
                                    onClick={() => openDirections(customer)}
                                    title="Get Directions"
                                >
                                    <Navigation size={16} />
                                    <span>Directions</span>
                                </button>
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
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
                            <button className={styles.closeBtn} onClick={resetForm}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Full Name *</label>
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
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+92 300 1234567"
                                    required
                                />
                            </div>

                            {/* Password field for new customers */}
                            {!editingCustomer && (
                                <div className={styles.formGroup}>
                                    <label>Login Password *</label>
                                    <div className={styles.inputWithIcon}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Password for customer login"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <small className={styles.inputHint}>Customer will use phone + this password to login</small>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label>Address *</label>
                                <div className={styles.addressInput}>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Enter full address"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.locationBtn}
                                        onClick={getCurrentLocation}
                                        disabled={gettingLocation}
                                        title="Get current location"
                                    >
                                        <Crosshair size={18} className={gettingLocation ? styles.spinning : ''} />
                                    </button>
                                </div>
                                {formData.latitude && formData.longitude && (
                                    <small className={styles.coordsText}>
                                        📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                    </small>
                                )}
                            </div>

                            {/* Area Selection */}
                            <div className={styles.formGroup}>
                                <label>Delivery Area</label>
                                <select
                                    value={formData.areaId}
                                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                                >
                                    <option value="">Select Area</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.uuid}>{area.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Delivery Days */}
                            <div className={styles.formGroup}>
                                <label>Delivery Days</label>
                                <div className={styles.daysGrid}>
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`${styles.dayBtn} ${formData.deliveryDays.includes(day) ? styles.selected : ''}`}
                                            onClick={() => toggleDeliveryDay(day)}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Required Bottles */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Required Bottles</label>
                                    <input
                                        type="number"
                                        value={formData.requiredBottles}
                                        onChange={(e) => setFormData({ ...formData, requiredBottles: parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Opening Bottles</label>
                                    <input
                                        type="number"
                                        value={formData.openingBottles}
                                        onChange={(e) => setFormData({ ...formData, openingBottles: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Security Deposit */}
                            <div className={styles.formSection}>
                                <h4><Wallet size={16} /> Security Deposit</h4>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Deposit Amount (Rs)</label>
                                        <input
                                            type="number"
                                            value={formData.securityDeposit}
                                            onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Opening Balance (Rs)</label>
                                        <input
                                            type="number"
                                            value={formData.openingBalance}
                                            onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Deposit Remarks</label>
                                    <input
                                        type="text"
                                        value={formData.securityRemarks}
                                        onChange={(e) => setFormData({ ...formData, securityRemarks: e.target.value })}
                                        placeholder="e.g., 2 bottles security"
                                    />
                                </div>
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
