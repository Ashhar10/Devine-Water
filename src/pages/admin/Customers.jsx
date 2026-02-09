import { useState, useEffect, useMemo } from 'react'
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
    Package,
    RotateCcw,
    Map,
    Settings,
    Eye,
    EyeOff,
    FileText,
    TrendingUp,
    User,
    LayoutGrid,
    ArrowUpDown,
    List,
    Download,
    ChevronDown
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { downloadAsExcel, downloadAsSQL } from '../../utils/exportUtils'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import StatSlider from '../../components/dashboard/StatSlider'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import styles from './Customers.module.css'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CACHE_KEY = 'devine_customer_form_cache'

const getEmptyFormData = () => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    latitude: null,
    longitude: null,
    areaId: '',
    status: 'active',
    deliveryDays: [],
    assignedProducts: [],
    requiredBottles: 1,
    securityDeposit: 0,
    securityRemarks: '',
    openingBalance: 0,
    openingBottles: 0
})

function Customers() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('customers') // 'customers' or 'areas'
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [hasCachedData, setHasCachedData] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState(getEmptyFormData())
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null) // For details modal
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const [dateFilter, setDateFilter] = useState('all') // all, current_month, last_month, week, custom
    const [sortMethod, setSortMethod] = useState('name') // 'name', 'id', 'area_id'
    const [customDates, setCustomDates] = useState({
        start: '',
        end: ''
    })
    const [detailsView, setDetailsView] = useState('info') // 'info' or 'calendar'
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const customers = useDataStore(state => state.customers)
    const currentUser = useDataStore(state => state.currentUser)
    const products = useDataStore(state => state.products)
    const orders = useDataStore(state => state.orders)
    const deliveries = useDataStore(state => state.deliveries)
    const [showAreaModal, setShowAreaModal] = useState(false)
    const [areaForm, setAreaForm] = useState({
        name: '',
        description: '',
        priority: 0,
        deliveryDays: []
    })
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger'
    })

    const areas = useDataStore(state => state.areas)
    const addCustomer = useDataStore(state => state.addCustomer)
    const addArea = useDataStore(state => state.addArea)
    const updateArea = useDataStore(state => state.updateArea)
    const deleteArea = useDataStore(state => state.deleteArea)
    const updateCustomer = useDataStore(state => state.updateCustomer)
    const deleteCustomer = useDataStore(state => state.deleteCustomer)
    const addUser = useDataStore(state => state.addUser)

    // Check for cached data on mount
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached)
                // Check if cache has meaningful data
                if (parsedCache.name || parsedCache.phone || parsedCache.address) {
                    setHasCachedData(true)
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY)
            }
        }
    }, [])

    // Save form data to cache whenever it changes (only when modal is open)
    useEffect(() => {
        if (showAddModal && !editingCustomer) {
            // Only cache for new customers, not edits
            const hasData = formData.name || formData.phone || formData.address
            if (hasData) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(formData))
                setHasCachedData(true)
            }
        }
    }, [formData, showAddModal, editingCustomer])

    // Restore cached data when opening modal for new customer
    const openAddModal = () => {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached)
                setFormData(parsedCache)
            } catch (e) {
                setFormData(getEmptyFormData())
            }
        } else {
            setFormData(getEmptyFormData())
        }
        setEditingCustomer(null)
        setShowAddModal(true)
    }


    const handleAreaSubmit = async (e) => {
        e.preventDefault()
        if (editingCustomer) { // Reusing editingCustomer for editing Area to save state vars
            await updateArea(editingCustomer.id, areaForm)
            setEditingCustomer(null)
        } else {
            await addArea(areaForm)
        }
        setShowAreaModal(false)
        setAreaForm({ name: '', description: '', priority: 0, deliveryDays: [] })
    }

    const editArea = (area) => {
        setAreaForm({
            name: area.name,
            description: area.description || '',
            priority: area.priority || 0,
            deliveryDays: area.deliveryDays || []
        })
        setEditingCustomer({ id: area.id }) // Hack: using editingCustomer to track editing area ID
        setShowAreaModal(true)
    }

    const removeArea = (id) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Area',
            message: 'Are you sure you want to delete this area? This action cannot be undone.',
            onConfirm: () => {
                deleteArea(id)
            },
            variant: 'danger'
        })
    }

    // Clear cache
    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY)
        setFormData(getEmptyFormData())
        setHasCachedData(false)
    }

    // Toggle delivery day
    const toggleDeliveryDay = (day) => {
        setFormData(prev => ({
            ...prev,
            deliveryDays: prev.deliveryDays.includes(day)
                ? prev.deliveryDays.filter(d => d !== day)
                : [...prev.deliveryDays, day]
        }))
    }
    // Filter logic
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

    const filteredCustomers = useMemo(() => {
        let result = customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm) ||
                (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesDate = isDateInRange(customer.createdAt)
            return matchesSearch && matchesDate
        })

        // Sorting Logic
        return result.sort((a, b) => {
            if (sortMethod === 'name') {
                return a.name.localeCompare(b.name)
            } else if (sortMethod === 'id') {
                // Extract numeric part of ID (e.g. C1 -> 1)
                const numA = parseInt((a.id || '').replace(/\D/g, '')) || 0
                const numB = parseInt((b.id || '').replace(/\D/g, '')) || 0
                return numA - numB
            } else if (sortMethod === 'area_id') {
                // Sort by Area Name then by ID
                const areaA = areas.find(area => area.uuid === a.areaId)?.name || ''
                const areaB = areas.find(area => area.uuid === b.areaId)?.name || ''

                if (areaA !== areaB) {
                    return areaA.localeCompare(areaB)
                }

                // If areas are same, sort by ID
                const numA = parseInt((a.id || '').replace(/\D/g, '')) || 0
                const numB = parseInt((b.id || '').replace(/\D/g, '')) || 0
                return numA - numB
            }
            return 0
        })

    }, [customers, searchTerm, dateFilter, customDates, sortMethod, areas])

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Slides Configuration
    const customerSlides = [
        {
            title: 'Active Customers',
            value: customers.filter(c => c.status === 'active').length,
            icon: User,
            color: 'success'
        },
        {
            title: 'Inactive Customers',
            value: customers.filter(c => c.status === 'inactive').length,
            icon: User,
            color: 'warning'
        },
        {
            title: 'Total Customers',
            value: customers.length,
            icon: User,
            color: 'teal'
        }
    ]

    const areaSlides = [
        {
            title: 'Total Areas',
            value: areas.length,
            icon: MapPin,
            color: 'cyan'
        },
        {
            title: 'Active Areas',
            value: areas.filter(a => customers.some(c => c.areaId === a.uuid)).length,
            icon: MapPin,
            color: 'success'
        },
        {
            title: 'Inactive Areas',
            value: areas.filter(a => !customers.some(c => c.areaId === a.uuid)).length,
            icon: MapPin,
            color: 'warning'
        }
    ]

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser')
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
            console.log('No location available for this customer')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (editingCustomer) {
            await updateCustomer(editingCustomer.id, formData)
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
        // Clear cache on successful save
        localStorage.removeItem(CACHE_KEY)
        setHasCachedData(false)
        setFormData(getEmptyFormData())
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
            status: customer.status || 'active',
            deliveryDays: customer.deliveryDays || [],
            assignedProducts: Array.isArray(customer.assignedProducts)
                ? customer.assignedProducts
                : (typeof customer.assignedProducts === 'string' ? JSON.parse(customer.assignedProducts || '[]') : []),
            requiredBottles: customer.requiredBottles || 1,
            securityDeposit: customer.securityDeposit || 0,
            securityRemarks: customer.securityRemarks || '',
            openingBalance: customer.openingBalance || 0,
            openingBottles: customer.openingBottles || 0
        })
        setShowAddModal(true)
    }

    const handleDelete = (id) => {
        // Delete without confirmation (can add custom modal later)
        deleteCustomer(id)
    }

    const resetForm = () => {
        setShowAddModal(false)
        setEditingCustomer(null)
        setFormData(getEmptyFormData())
    }

    return (
        <div className={styles.customers}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
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

                    <div className={styles.dateSelector} style={{ marginLeft: '10px' }}>
                        <ArrowUpDown size={18} className={styles.filterIcon} />
                        <select
                            value={sortMethod}
                            onChange={(e) => setSortMethod(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="id">Sort by ID</option>
                            <option value="area_id">Sort by Area + ID</option>
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

                <div className={styles.headerActions}>
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
                    <Button variant="secondary" icon={Map} onClick={() => {
                        setEditingCustomer(null) // Reset edit state
                        setAreaForm({ name: '', description: '', priority: 0, deliveryDays: [] })
                        setShowAreaModal(true)
                    }}>
                        Add Area
                    </Button>
                    <Button variant="primary" icon={Plus} onClick={openAddModal}>
                        Add Customer {hasCachedData && '(Draft)'}
                    </Button>
                </div>
            </div>


            {/* Stats Sliders */}
            <div className={styles.statsRow}>
                <StatSlider
                    slides={customerSlides}
                    interval={4000}
                />
                <StatSlider
                    slides={areaSlides}
                    interval={5000}
                />
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'areas' ? styles.active : ''}`}
                    onClick={() => setActiveTab('areas')}
                >
                    Areas
                </button>
            </div>

            {/* Content Based on Tab */}
            {activeTab === 'customers' ? (
                viewMode === 'grid' ? (
                    <div className={styles.customersGrid}>
                        {filteredCustomers.map((customer, index) => (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCustomerDetails(customer)}
                                style={{ cursor: 'pointer' }}
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
                                        <div className={styles.stat}>
                                            <Wallet size={16} className={styles.statIcon} />
                                            <div>
                                                <span className={`${styles.statNumber} ${customer.currentBalance > 0 ? styles.pending : ''}`}>
                                                    {customer.currentBalance?.toLocaleString() || 0}
                                                </span>
                                                <span className={styles.statText}>Balance</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <button
                                            className={styles.directionsBtn}
                                            onClick={(e) => { e.stopPropagation(); openDirections(customer); }}
                                            title="Get Directions"
                                        >
                                            <Navigation size={16} />
                                            <span>Directions</span>
                                        </button>
                                        <div className={styles.actionBtns}>
                                            <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.listView}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Area & Address</th>
                                    <th>Stats</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer, index) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setSelectedCustomerDetails(customer)}
                                        className={styles.tableRow}
                                    >
                                        <td>
                                            <div className={styles.tableCustomerInfo}>
                                                <div className={styles.tableAvatar}>
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={styles.tableName}>{customer.name}</div>
                                                    <div className={styles.tableId}>{customer.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.tablePhone}>{customer.phone}</div>
                                            <div className={styles.tableEmail}>{customer.email}</div>
                                        </td>
                                        <td>
                                            <div className={styles.tableArea}>{areas.find(a => a.uuid === customer.areaId)?.name || 'N/A'}</div>
                                            <div className={styles.tableAddress}>{customer.address}</div>
                                        </td>
                                        <td>
                                            <div className={styles.tableStats}>
                                                <span>Orders: {customer.totalOrders}</span>
                                                <span>Spent: Rs {customer.totalSpent?.toLocaleString() || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`${styles.tableBalance} ${customer.currentBalance > 0 ? styles.pending : ''}`}>
                                                Rs {customer.currentBalance?.toLocaleString() || 0}
                                            </div>
                                        </td>
                                        <td><StatusBadge status={customer.status} size="sm" /></td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); openDirections(customer); }} title="Directions">
                                                    <Navigation size={14} />
                                                </button>
                                                <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}>
                                                    <Edit size={14} />
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}>
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                viewMode === 'grid' ? (
                    <div className={styles.areasGrid}>
                        {filteredAreas.map((area, index) => (
                            <motion.div
                                key={area.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard className={styles.areaCard}>
                                    <div>
                                        <div className={styles.areaHeader}>
                                            <span className={styles.areaName}>{area.name}</span>
                                            <span className={styles.customerId}>Priority: {area.priority}</span>
                                        </div>
                                        <p className={styles.areaDesc}>{area.description || 'No description provided'}</p>

                                        <div className={styles.areaStats}>
                                            <div className={styles.areaStat}>
                                                <User size={16} />
                                                <span>{customers.filter(c => c.areaId === area.uuid).length} Customers</span>
                                            </div>
                                        </div>

                                        {area.deliveryDays && area.deliveryDays.length > 0 && (
                                            <div className={styles.daysTags}>
                                                {area.deliveryDays.map(day => (
                                                    <span key={day} className={styles.dayTag}>
                                                        {day.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <div className={styles.actionBtns}>
                                            <button className={styles.actionBtn} onClick={() => editArea(area)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => removeArea(area.id)}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.listView}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Area Name</th>
                                    <th>Description</th>
                                    <th>Priority</th>
                                    <th>Customers</th>
                                    <th>Delivery Days</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAreas.map((area, index) => (
                                    <motion.tr
                                        key={area.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={styles.tableRow}
                                    >
                                        <td className={styles.tableName}>{area.name}</td>
                                        <td className={styles.tableAddress}>{area.description || '---'}</td>
                                        <td>{area.priority}</td>
                                        <td>{customers.filter(c => c.areaId === area.uuid).length}</td>
                                        <td>
                                            <div className={styles.daysTags}>
                                                {area.deliveryDays?.map(day => (
                                                    <span key={day} className={styles.dayTag}>
                                                        {day.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <button className={styles.actionBtn} onClick={() => editArea(area)}>
                                                    <Edit size={14} />
                                                </button>
                                                <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => removeArea(area.id)}>
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}


            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
                            <div className={styles.headerActions}>
                                {!editingCustomer && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={clearCache}
                                        title="Clear form"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={resetForm}>
                                    <X size={20} />
                                </button>
                            </div>
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

                            {editingCustomer && (
                                <div className={styles.formGroup}>
                                    <label>Account Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{
                                            borderColor: formData.status === 'active' ? '#10b981' : '#ef4444',
                                            color: formData.status === 'active' ? '#10b981' : '#ef4444',
                                            fontWeight: 500
                                        }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}

                            {/* Password field for new customers */}
                            {!editingCustomer && (
                                <div className={styles.formGroup}>
                                    <label>Login Password *</label>
                                    <div className={styles.inputWithIcon}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Password for customer login"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex="-1"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
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
                                    onChange={(e) => {
                                        const selectedAreaId = e.target.value
                                        const selectedArea = areas.find(a => a.uuid === selectedAreaId)
                                        setFormData({
                                            ...formData,
                                            areaId: selectedAreaId,
                                            // Auto-select delivery days from area if available
                                            deliveryDays: selectedArea?.deliveryDays || formData.deliveryDays
                                        })
                                    }}
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

                            {/* Assigned Products Only */}
                            <div className={styles.formGroup}>
                                <label>Assigned Products (Optional)</label>
                                <div className={styles.daysGrid}>
                                    {products.filter(p => p.status === 'active').map(product => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            className={`${styles.dayBtn} ${formData.assignedProducts?.includes(product.uuid) ? styles.selected : ''}`}
                                            onClick={() => {
                                                if (!product.uuid) {
                                                    console.error('Product missing UUID:', product)
                                                    return
                                                }
                                                setFormData(prev => {
                                                    const current = prev.assignedProducts || []
                                                    const newAssigned = current.includes(product.uuid)
                                                        ? current.filter(id => id !== product.uuid)
                                                        : [...current, product.uuid]
                                                    console.log('Updating assigned products:', newAssigned)
                                                    return { ...prev, assignedProducts: newAssigned }
                                                })
                                            }}
                                            style={{ minWidth: 'auto', padding: '8px 12px' }}
                                        >
                                            {product.name}
                                        </button>
                                    ))}
                                </div>
                                <small className={styles.inputHint}>Select products visible to this customer. Leave empty to allow all.</small>
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

            {/* Area Modal */}
            {showAreaModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAreaModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingCustomer && activeTab === 'areas' ? 'Edit Area' : 'Add New Area'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAreaModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAreaSubmit}>
                            <div className={styles.formGroup}>
                                <label>Area Name *</label>
                                <input
                                    type="text"
                                    value={areaForm.name}
                                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                                    placeholder="e.g. Orangi Town"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={areaForm.description}
                                    onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                                    placeholder="Sector A, B, C..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Route Priority (Sequence)</label>
                                <input
                                    type="number"
                                    value={areaForm.priority}
                                    onChange={(e) => setAreaForm({ ...areaForm, priority: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    min="0"
                                />
                                <small className={styles.inputHint}>Lower numbers (0, 1, 2) are served first</small>
                            </div>

                            {/* Area Delivery Days */}
                            <div className={styles.formGroup}>
                                <label>Area Delivery Days</label>
                                <div className={styles.daysGrid}>
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`${styles.dayBtn} ${areaForm.deliveryDays.includes(day) ? styles.selected : ''}`}
                                            onClick={() => setAreaForm(prev => ({
                                                ...prev,
                                                deliveryDays: prev.deliveryDays.includes(day)
                                                    ? prev.deliveryDays.filter(d => d !== day)
                                                    : [...prev.deliveryDays, day]
                                            }))}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" variant="primary" fullWidth>
                                {editingCustomer && activeTab === 'areas' ? 'Update Area' : 'Create Area'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomerDetails && (() => {
                // Filter customer's orders and deliveries
                const customerOrders = orders.filter(o => o.customerId === selectedCustomerDetails.id)
                const customerDeliveries = deliveries.filter(d => d.customerId === selectedCustomerDetails.id)

                return (
                    <div className={styles.modalOverlay} onClick={() => setSelectedCustomerDetails(null)}>
                        <GlassCard className={`${styles.modal} ${styles.detailsModal}`} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.detailsTitle}>
                                    <div className={styles.avatarLarge}>
                                        {selectedCustomerDetails.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{selectedCustomerDetails.name}</h3>
                                        <span className={styles.detailsSubtitle}>
                                            {selectedCustomerDetails.id} • {selectedCustomerDetails.areaId ? areas.find(a => a.uuid === selectedCustomerDetails.areaId)?.name : 'No Area'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.headerActions}>
                                    <div className={styles.viewToggle} style={{ marginRight: '10px' }}>
                                        <button
                                            className={`${styles.viewBtn} ${detailsView === 'info' ? styles.active : ''}`}
                                            onClick={() => setDetailsView('info')}
                                            title="Information"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            className={`${styles.viewBtn} ${detailsView === 'calendar' ? styles.active : ''}`}
                                            onClick={() => setDetailsView('calendar')}
                                            title="Calendar View"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                    </div>
                                    <button className={styles.closeBtn} onClick={() => {
                                        setSelectedCustomerDetails(null)
                                        setDetailsView('info')
                                    }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.detailsContent}>
                                {detailsView === 'info' ? (
                                    <>
                                        {/* Biography Section */}
                                        <div className={styles.detailsSection}>
                                            <h4><User size={18} /> Personal Information</h4>
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailItem}>
                                                    <Phone size={14} />
                                                    <span className={styles.detailLabel}>Phone:</span>
                                                    <span className={styles.detailValue}>{selectedCustomerDetails.phone}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <MapPin size={14} />
                                                    <span className={styles.detailLabel}>Address:</span>
                                                    <span className={styles.detailValue}>{selectedCustomerDetails.address}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <Calendar size={14} />
                                                    <span className={styles.detailLabel}>Joined:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedCustomerDetails.createdAt ? new Date(selectedCustomerDetails.createdAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <Droplets size={14} />
                                                    <span className={styles.detailLabel}>Delivery Days:</span>
                                                    <span className={styles.detailValue}>
                                                        {selectedCustomerDetails.deliveryDays?.length > 0
                                                            ? selectedCustomerDetails.deliveryDays.map(d => d.slice(0, 3)).join(', ')
                                                            : 'Not set'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {currentUser?.designation === 'Administrator' && (
                                            /* Financial Summary */
                                            <div className={styles.detailsSection}>
                                                <h4><Wallet size={18} /> Financial Summary</h4>
                                                <div className={styles.statsRow}>
                                                    <div className={styles.statBox}>
                                                        <span className={styles.statValue}>Rs {selectedCustomerDetails.totalSpent?.toLocaleString() || 0}</span>
                                                        <span className={styles.statLabel}>Total Spent</span>
                                                    </div>
                                                    <div className={styles.statBox}>
                                                        <span className={`${styles.statValue} ${selectedCustomerDetails.currentBalance > 0 ? styles.warning : ''}`}>
                                                            Rs {selectedCustomerDetails.currentBalance?.toLocaleString() || 0}
                                                        </span>
                                                        <span className={styles.statLabel}>Current Balance</span>
                                                    </div>
                                                    <div className={styles.statBox}>
                                                        <span className={styles.statValue}>Rs {selectedCustomerDetails.securityDeposit?.toLocaleString() || 0}</span>
                                                        <span className={styles.statLabel}>Security Deposit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order History */}
                                        <div className={styles.detailsSection}>
                                            <h4><FileText size={18} /> Recent Orders</h4>
                                            {customerOrders.length > 0 ? (
                                                <div className={styles.ordersList}>
                                                    {customerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 5).map(order => (
                                                        <div key={order.id} className={styles.orderItem}>
                                                            <div>
                                                                <span className={styles.orderId}>{order.id}</span>
                                                                <span className={styles.orderDate}>{new Date(order.orderDate).toLocaleDateString()}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <StatusBadge status={order.status} size="sm" />
                                                                {currentUser?.designation === 'Administrator' && (
                                                                    <span className={styles.orderTotal}>Rs {order.total}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={styles.emptyText}>No orders yet</p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className={styles.detailsSection}>
                                            <h4><TrendingUp size={18} /> Statistics</h4>
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Total Orders:</span>
                                                    <span className={styles.detailValue}>{customerOrders.length || 0}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Required Bottles:</span>
                                                    <span className={styles.detailValue}>{selectedCustomerDetails.requiredBottles || 1}/delivery</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span className={styles.detailLabel}>Status:</span>
                                                    <StatusBadge status={selectedCustomerDetails.status} size="sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.calendarContainer}>
                                        <div className={styles.calendarHeader}>
                                            <button
                                                className={styles.calendarNav}
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                            >
                                                &larr;
                                            </button>
                                            <h3>{currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h3>
                                            <button
                                                className={styles.calendarNav}
                                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                            >
                                                &rarr;
                                            </button>
                                        </div>

                                        <div className={styles.calendarGrid}>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className={styles.calendarWeekday}>{day}</div>
                                            ))}

                                            {(() => {
                                                const year = currentMonth.getFullYear()
                                                const month = currentMonth.getMonth()
                                                const firstDay = new Date(year, month, 1).getDay()
                                                const daysInMonth = new Date(year, month + 1, 0).getDate()
                                                const today = new Date()
                                                today.setHours(0, 0, 0, 0)

                                                const cells = []
                                                for (let i = 0; i < firstDay; i++) {
                                                    cells.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>)
                                                }

                                                for (let d = 1; d <= daysInMonth; d++) {
                                                    const date = new Date(year, month, d)
                                                    const dateStr = date.toISOString().split('T')[0]
                                                    const isToday = date.getTime() === today.getTime()

                                                    // Find events for this day
                                                    const dayDeliveries = customerDeliveries.filter(del =>
                                                        del.deliveryDate?.split('T')[0] === dateStr
                                                    )
                                                    const dayOrders = customerOrders.filter(ord =>
                                                        ord.orderDate?.split('T')[0] === dateStr
                                                    )

                                                    cells.push(
                                                        <div key={d} className={`${styles.calendarDay} ${isToday ? styles.calendarToday : ''}`}>
                                                            <span className={styles.dayNumber}>{d}</span>
                                                            <div className={styles.dayEvents}>
                                                                {dayDeliveries.map((del, idx) => (
                                                                    <div
                                                                        key={`del-${idx}`}
                                                                        className={`${styles.eventDot} ${styles[del.status]}`}
                                                                        title={`Delivery: ${del.status}`}
                                                                    ></div>
                                                                ))}
                                                                {dayOrders.map((ord, idx) => (
                                                                    <div
                                                                        key={`ord-${idx}`}
                                                                        className={`${styles.eventDot} ${styles.order}`}
                                                                        title={`Order: ${ord.id}`}
                                                                    ></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return cells
                                            })()}
                                        </div>

                                        <div className={styles.calendarLegend}>
                                            <div className={styles.legendItem}>
                                                <div className={`${styles.eventDot} ${styles.delivered}`}></div>
                                                <span>Delivered</span>
                                            </div>
                                            <div className={styles.legendItem}>
                                                <div className={`${styles.eventDot} ${styles.skipped}`}></div>
                                                <span>Skipped</span>
                                            </div>
                                            <div className={styles.legendItem}>
                                                <div className={`${styles.eventDot} ${styles.order}`}></div>
                                                <span>Order</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                )
            })()}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
            />
        </div>
    )
}

export default Customers
