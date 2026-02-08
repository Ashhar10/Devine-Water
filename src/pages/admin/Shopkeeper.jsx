import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    Store,
    TrendingUp,
    TrendingDown,
    Droplets,
    DollarSign,
    Calendar,
    X,
    Edit,
    Trash,
    RotateCcw,
    LayoutGrid,
    List,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './Shopkeeper.module.css'

const CACHE_KEY_PRODUCT = 'devine_shopkeeper_product_cache'
const CACHE_KEY_WATER = 'devine_shopkeeper_water_cache'

const getEmptyProductForm = () => ({
    productName: '',
    amount: '',
    type: 'in', // 'in' or 'out'
    remarks: ''
})

const getEmptyWaterForm = () => ({
    liters: '',
    amount: '',
    remarks: ''
})

function Shopkeeper() {
    const [activeTab, setActiveTab] = useState('product') // 'product' or 'water'
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('grid')
    const [showProductModal, setShowProductModal] = useState(false)
    const [showWaterModal, setShowWaterModal] = useState(false)
    const [editingEntry, setEditingEntry] = useState(null)
    const [productForm, setProductForm] = useState(getEmptyProductForm())
    const [waterForm, setWaterForm] = useState(getEmptyWaterForm())
    const [dateFilter, setDateFilter] = useState('all')
    const [customDates, setCustomDates] = useState({
        start: '',
        end: ''
    })

    const shopkeeperEntries = useDataStore(state => state.shopkeeperEntries) || []
    const addShopkeeperEntry = useDataStore(state => state.addShopkeeperEntry)
    const updateShopkeeperEntry = useDataStore(state => state.updateShopkeeperEntry)
    const deleteShopkeeperEntry = useDataStore(state => state.deleteShopkeeperEntry)

    // Draft persistence for Product Entry
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY_PRODUCT)
        if (cached && !showProductModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.productName || parsed.amount) {
                    setProductForm(parsed)
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY_PRODUCT)
            }
        }
    }, [showProductModal])

    useEffect(() => {
        if (showProductModal && !editingEntry) {
            const hasData = productForm.productName || productForm.amount
            if (hasData) {
                localStorage.setItem(CACHE_KEY_PRODUCT, JSON.stringify(productForm))
            }
        }
    }, [productForm, showProductModal, editingEntry])

    // Draft persistence for Water Sale
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY_WATER)
        if (cached && !showWaterModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.liters || parsed.amount) {
                    setWaterForm(parsed)
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY_WATER)
            }
        }
    }, [showWaterModal])

    useEffect(() => {
        if (showWaterModal && !editingEntry) {
            const hasData = waterForm.liters || waterForm.amount
            if (hasData) {
                localStorage.setItem(CACHE_KEY_WATER, JSON.stringify(waterForm))
            }
        }
    }, [waterForm, showWaterModal, editingEntry])

    const clearProductDraft = () => {
        localStorage.removeItem(CACHE_KEY_PRODUCT)
        setProductForm(getEmptyProductForm())
    }

    const clearWaterDraft = () => {
        localStorage.removeItem(CACHE_KEY_WATER)
        setWaterForm(getEmptyWaterForm())
    }

    // Filter entries by date
    const filteredEntries = useMemo(() => {
        let entries = [...shopkeeperEntries]

        // Filter by tab
        if (activeTab === 'product') {
            entries = entries.filter(e => e.entryType === 'product_in' || e.entryType === 'product_out')
        } else {
            entries = entries.filter(e => e.entryType === 'water_sale')
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date()
            let startDate, endDate

            if (dateFilter === 'today') {
                startDate = new Date(now.setHours(0, 0, 0, 0))
                endDate = new Date(now.setHours(23, 59, 59, 999))
            } else if (dateFilter === 'week') {
                const day = now.getDay()
                const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                startDate = new Date(now.setDate(diff))
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 6)
                endDate.setHours(23, 59, 59, 999)
            } else if (dateFilter === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            } else if (dateFilter === 'custom' && customDates.start && customDates.end) {
                startDate = new Date(customDates.start)
                endDate = new Date(customDates.end)
                endDate.setHours(23, 59, 59, 999)
            }

            if (startDate && endDate) {
                entries = entries.filter(entry => {
                    const entryDate = new Date(entry.entryDate)
                    return entryDate >= startDate && entryDate <= endDate
                })
            }
        }

        // Filter by search
        if (searchTerm) {
            entries = entries.filter(entry =>
                entry.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return entries.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
    }, [shopkeeperEntries, activeTab, dateFilter, customDates, searchTerm])

    // Calculate stats
    const stats = useMemo(() => {
        if (activeTab === 'product') {
            const amountIn = filteredEntries
                .filter(e => e.entryType === 'product_in')
                .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
            const amountOut = filteredEntries
                .filter(e => e.entryType === 'product_out')
                .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
            return {
                amountIn,
                amountOut,
                netAmount: amountIn - amountOut
            }
        } else {
            const totalLiters = filteredEntries.reduce((sum, e) => sum + parseFloat(e.liters || 0), 0)
            const totalRevenue = filteredEntries.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
            return {
                totalLiters,
                totalRevenue,
                avgPrice: totalLiters > 0 ? totalRevenue / totalLiters : 0
            }
        }
    }, [filteredEntries, activeTab])

    const handleProductSubmit = (e) => {
        e.preventDefault()
        const entry = {
            entryType: productForm.type === 'in' ? 'product_in' : 'product_out',
            productName: productForm.productName,
            amount: parseFloat(productForm.amount),
            remarks: productForm.remarks,
            entryDate: new Date().toISOString().split('T')[0]
        }

        if (editingEntry) {
            updateShopkeeperEntry(editingEntry.id, entry)
        } else {
            addShopkeeperEntry(entry)
            clearProductDraft()
        }

        setShowProductModal(false)
        setProductForm(getEmptyProductForm())
        setEditingEntry(null)
    }

    const handleWaterSubmit = (e) => {
        e.preventDefault()
        const entry = {
            entryType: 'water_sale',
            liters: parseFloat(waterForm.liters),
            amount: parseFloat(waterForm.amount),
            remarks: waterForm.remarks,
            entryDate: new Date().toISOString().split('T')[0]
        }

        if (editingEntry) {
            updateShopkeeperEntry(editingEntry.id, entry)
        } else {
            addShopkeeperEntry(entry)
            clearWaterDraft()
        }

        setShowWaterModal(false)
        setWaterForm(getEmptyWaterForm())
        setEditingEntry(null)
    }

    const handleEdit = (entry) => {
        setEditingEntry(entry)
        if (entry.entryType === 'water_sale') {
            setWaterForm({
                liters: entry.liters,
                amount: entry.amount,
                remarks: entry.remarks || ''
            })
            setShowWaterModal(true)
        } else {
            setProductForm({
                productName: entry.productName,
                amount: entry.amount,
                type: entry.entryType === 'product_in' ? 'in' : 'out',
                remarks: entry.remarks || ''
            })
            setShowProductModal(true)
        }
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            deleteShopkeeperEntry(id)
        }
    }

    const resetProductForm = () => {
        setShowProductModal(false)
        setProductForm(getEmptyProductForm())
        setEditingEntry(null)
    }

    const resetWaterForm = () => {
        setShowWaterModal(false)
        setWaterForm(getEmptyWaterForm())
        setEditingEntry(null)
    }

    return (
        <div className={styles.shopkeeper}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => activeTab === 'product' ? setShowProductModal(true) : setShowWaterModal(true)}
                >
                    Add {activeTab === 'product' ? 'Product Entry' : 'Water Sale'}
                </Button>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'product' ? styles.active : ''}`}
                    onClick={() => setActiveTab('product')}
                >
                    <Store size={18} />
                    Product Entry
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'water' ? styles.active : ''}`}
                    onClick={() => setActiveTab('water')}
                >
                    <Droplets size={18} />
                    Water Sale
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsRow}>
                {activeTab === 'product' ? (
                    <>
                        <GlassCard className={styles.statCard} glow glowColor="cyan">
                            <div className={styles.statIcon}>
                                <ArrowDownRight size={24} className={styles.iconIn} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>Rs {stats.amountIn.toLocaleString()}</span>
                                <span className={styles.statLabel}>Amount In</span>
                            </div>
                        </GlassCard>
                        <GlassCard className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <ArrowUpRight size={24} className={styles.iconOut} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>Rs {stats.amountOut.toLocaleString()}</span>
                                <span className={styles.statLabel}>Amount Out</span>
                            </div>
                        </GlassCard>
                        <GlassCard className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>Rs {stats.netAmount.toLocaleString()}</span>
                                <span className={styles.statLabel}>Net Amount</span>
                            </div>
                        </GlassCard>
                    </>
                ) : (
                    <>
                        <GlassCard className={styles.statCard} glow glowColor="cyan">
                            <div className={styles.statIcon}>
                                <Droplets size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.totalLiters.toLocaleString()}</span>
                                <span className={styles.statLabel}>Total Liters</span>
                            </div>
                        </GlassCard>
                        <GlassCard className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>Rs {stats.totalRevenue.toLocaleString()}</span>
                                <span className={styles.statLabel}>Total Revenue</span>
                            </div>
                        </GlassCard>
                        <GlassCard className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <TrendingUp size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>Rs {stats.avgPrice.toFixed(2)}</span>
                                <span className={styles.statLabel}>Avg Price/Liter</span>
                            </div>
                        </GlassCard>
                    </>
                )}
            </div>

            {/* Date Filter and View Toggle */}
            <div className={styles.controls}>
                <div className={styles.dateFilter}>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    {dateFilter === 'custom' && (
                        <div className={styles.customDateInputs}>
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
                <div className={styles.viewToggle}>
                    <button
                        className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Entries Display */}
            <div className={viewMode === 'grid' ? styles.entriesGrid : styles.entriesList}>
                {filteredEntries.length === 0 ? (
                    <div className={styles.emptyState}>
                        {activeTab === 'product' ? <Store size={48} /> : <Droplets size={48} />}
                        <h3>No entries found</h3>
                        <p>Add your first {activeTab === 'product' ? 'product entry' : 'water sale'} to get started</p>
                    </div>
                ) : (
                    filteredEntries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className={styles.entryCard}>
                                <div className={styles.entryHeader}>
                                    <div className={styles.entryDate}>
                                        <Calendar size={14} />
                                        {new Date(entry.entryDate).toLocaleDateString()}
                                    </div>
                                    <div className={styles.actionBtns}>
                                        <button className={styles.actionBtn} onClick={() => handleEdit(entry)}>
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.danger}`}
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.entryContent}>
                                    {entry.entryType === 'water_sale' ? (
                                        <>
                                            <div className={styles.entryDetail}>
                                                <Droplets size={16} />
                                                <span>{entry.liters} Liters</span>
                                            </div>
                                            <div className={styles.entryDetail}>
                                                <DollarSign size={16} />
                                                <span>Rs {entry.amount.toLocaleString()}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.entryDetail}>
                                                <Store size={16} />
                                                <span>{entry.productName}</span>
                                            </div>
                                            <div className={`${styles.entryDetail} ${entry.entryType === 'product_in' ? styles.amountIn : styles.amountOut}`}>
                                                {entry.entryType === 'product_in' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                                                <span>Rs {entry.amount.toLocaleString()}</span>
                                                <span className={styles.typeLabel}>{entry.entryType === 'product_in' ? 'IN' : 'OUT'}</span>
                                            </div>
                                        </>
                                    )}
                                    {entry.remarks && (
                                        <div className={styles.entryRemarks}>{entry.remarks}</div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Product Entry Modal */}
            {showProductModal && (
                <div className={styles.modalOverlay} onClick={resetProductForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingEntry ? 'Edit Product Entry' : 'Add Product Entry'}</h3>
                            <div className={styles.headerActions}>
                                {!editingEntry && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={clearProductDraft}
                                        title="Clear form"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={resetProductForm}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleProductSubmit}>
                            <div className={styles.formGroup}>
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    value={productForm.productName}
                                    onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Amount (Rs) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.amount}
                                        onChange={(e) => setProductForm({ ...productForm, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Type *</label>
                                    <select
                                        value={productForm.type}
                                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                                    >
                                        <option value="in">Amount In</option>
                                        <option value="out">Amount Out</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <textarea
                                    value={productForm.remarks}
                                    onChange={(e) => setProductForm({ ...productForm, remarks: e.target.value })}
                                    placeholder="Optional notes..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <Button variant="ghost" onClick={resetProductForm}>Cancel</Button>
                                <Button variant="primary" type="submit">
                                    {editingEntry ? 'Update' : 'Add'} Entry
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Water Sale Modal */}
            {showWaterModal && (
                <div className={styles.modalOverlay} onClick={resetWaterForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingEntry ? 'Edit Water Sale' : 'Add Water Sale'}</h3>
                            <div className={styles.headerActions}>
                                {!editingEntry && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={clearWaterDraft}
                                        title="Clear form"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={resetWaterForm}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleWaterSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Liters *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={waterForm.liters}
                                        onChange={(e) => setWaterForm({ ...waterForm, liters: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Amount (Rs) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={waterForm.amount}
                                        onChange={(e) => setWaterForm({ ...waterForm, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <textarea
                                    value={waterForm.remarks}
                                    onChange={(e) => setWaterForm({ ...waterForm, remarks: e.target.value })}
                                    placeholder="Optional notes..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <Button variant="ghost" onClick={resetWaterForm}>Cancel</Button>
                                <Button variant="primary" type="submit">
                                    {editingEntry ? 'Update' : 'Add'} Sale
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default Shopkeeper
