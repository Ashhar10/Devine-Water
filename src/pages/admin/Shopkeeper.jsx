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
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import styles from './Shopkeeper.module.css'

const CACHE_KEY_PRODUCT = 'devine_shopkeeper_product_cache'
const CACHE_KEY_WATER = 'devine_shopkeeper_water_cache'

const getEmptyProductForm = () => ({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    type: 'in', // 'in' or 'out'
    remarks: ''
})

const getEmptyWaterForm = () => ({
    productId: '', // For preset water products
    customLiters: '', // For custom liter entry
    liters: 0,
    unitPrice: 0,
    amount: 0,
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

    // Delete dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [entryToDelete, setEntryToDelete] = useState(null)

    const shopkeeperEntries = useDataStore(state => state.shopkeeperEntries) || []
    const products = useDataStore(state => state.products) || []
    const addShopkeeperEntry = useDataStore(state => state.addShopkeeperEntry)
    const updateShopkeeperEntry = useDataStore(state => state.updateShopkeeperEntry)
    const deleteShopkeeperEntry = useDataStore(state => state.deleteShopkeeperEntry)



    // Filter products - show ONLY products assigned to Shopkeeper
    const shopkeeperProducts = products.filter(p =>
        p.designations && Array.isArray(p.designations) && p.designations.includes('Shopkeeper')
    )

    const waterProducts = shopkeeperProducts.filter(p =>
        p.bottleType === '19L' || p.bottleType === '6L' ||
        p.name.toLowerCase().includes('water') ||
        p.name.toLowerCase().includes('aqua')
    )
    const otherProducts = shopkeeperProducts.filter(p => !waterProducts.includes(p))

    // Draft persistence for Product Entry
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY_PRODUCT)
        if (cached && !showProductModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.productId || parsed.quantity) {
                    setProductForm(parsed)
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY_PRODUCT)
            }
        }
    }, [showProductModal])

    useEffect(() => {
        if (showProductModal && !editingEntry) {
            const hasData = productForm.productId || productForm.quantity > 1
            if (hasData) {
                localStorage.setItem(CACHE_KEY_PRODUCT, JSON.stringify(productForm))
            }
        }
    }, [productForm, showProductModal, editingEntry])

    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY_WATER)
        if (cached && !showWaterModal) {
            try {
                const parsed = JSON.parse(cached)
                if (parsed.productId || parsed.customLiters) {
                    setWaterForm(parsed)
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY_WATER)
            }
        }
    }, [showWaterModal])

    useEffect(() => {
        if (showWaterModal && !editingEntry) {
            const hasData = waterForm.productId || waterForm.customLiters
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

    // Product Sale handlers
    const handleProductSelect = (productId) => {
        const product = otherProducts.find(p => p.id === productId)
        if (product) {
            const amount = productForm.quantity * parseFloat(product.price || 0)
            setProductForm({
                ...productForm,
                productId,
                unitPrice: parseFloat(product.price || 0),
                amount
            })
        }
    }

    const handleQuantityChange = (quantity) => {
        const qty = parseFloat(quantity) || 0
        const amount = qty * productForm.unitPrice
        setProductForm({
            ...productForm,
            quantity: qty,
            amount
        })
    }

    // Water Sale handlers
    const handleWaterProductSelect = (productId) => {
        if (productId === 'custom') {
            // Switch to custom liter input
            setWaterForm({
                ...waterForm,
                productId: 'custom',
                liters: 0,
                unitPrice: 0,
                amount: 0
            })
        } else {
            const product = waterProducts.find(p => p.id === productId)
            if (product) {
                // Extract liters from bottle type (e.g., "19L" -> 19)
                const liters = parseFloat(product.bottleType) || 0
                const amount = parseFloat(product.price || 0)
                setWaterForm({
                    ...waterForm,
                    productId,
                    customLiters: '',
                    liters,
                    unitPrice: amount / (liters || 1),
                    amount
                })
            }
        }
    }

    const handleCustomLitersChange = (liters) => {
        const literValue = parseFloat(liters) || 0
        // Calculate average water price per liter from existing water products
        const avgPricePerLiter = waterProducts.length > 0
            ? waterProducts.reduce((sum, p) => {
                const pLiters = parseFloat(p.bottleType) || 1
                return sum + (parseFloat(p.price || 0) / pLiters)
            }, 0) / waterProducts.length
            : 0

        setWaterForm({
            ...waterForm,
            customLiters: liters,
            liters: literValue,
            unitPrice: avgPricePerLiter,
            amount: literValue * avgPricePerLiter
        })
    }

    const handleProductSubmit = (e) => {
        e.preventDefault()

        const selectedProduct = otherProducts.find(p => p.id === productForm.productId)

        const entry = {
            entryType: productForm.type === 'in' ? 'product_in' : 'product_out',
            productId: productForm.productId,
            productName: selectedProduct?.name || '',
            quantity: parseFloat(productForm.quantity),
            unitPrice: productForm.unitPrice,
            amount: productForm.amount,
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

        const selectedProduct = waterForm.productId !== 'custom'
            ? waterProducts.find(p => p.id === waterForm.productId)
            : null

        const entry = {
            entryType: 'water_sale',
            productId: waterForm.productId !== 'custom' ? waterForm.productId : null,
            productName: selectedProduct?.name || `Custom ${waterForm.liters}L`,
            liters: waterForm.liters,
            unitPrice: waterForm.unitPrice,
            amount: waterForm.amount,
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

    const handleDelete = (entry) => {
        setEntryToDelete(entry)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (entryToDelete) {
            await deleteShopkeeperEntry(entryToDelete.id)
            setShowDeleteDialog(false)
            setEntryToDelete(null)
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
                                <span className={styles.statValue}>Rs {(stats.avgPrice || 0).toFixed(2)}</span>
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
                                            onClick={() => handleDelete(entry)}
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
                                <label>Select Product *</label>
                                <select
                                    value={productForm.productId}
                                    onChange={(e) => handleProductSelect(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a product...</option>
                                    {otherProducts.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - Rs {product.price} / {product.bottleType}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={productForm.quantity}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        placeholder="1"
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
                                <label>Total Amount (Rs)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(productForm.amount || 0).toFixed(2)}
                                    readOnly
                                    className={styles.readOnlyInput}
                                    placeholder="0.00"
                                />
                                <small className={styles.helpText}>
                                    Calculated: {productForm.quantity || 0} × Rs {(productForm.unitPrice || 0).toFixed(2)}
                                </small>
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
                            <div className={styles.formGroup}>
                                <label>Water Product *</label>
                                <select
                                    value={waterForm.productId}
                                    onChange={(e) => handleWaterProductSelect(e.target.value)}
                                    required
                                >
                                    <option value="">Choose water product...</option>
                                    {waterProducts.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {product.bottleType} - Rs {product.price}
                                        </option>
                                    ))}
                                    <option value="custom">Custom Liters</option>
                                </select>
                            </div>

                            {waterForm.productId === 'custom' && (
                                <div className={styles.formGroup}>
                                    <label>Custom Liters *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={waterForm.customLiters}
                                        onChange={(e) => handleCustomLitersChange(e.target.value)}
                                        placeholder="Enter liters..."
                                        required
                                    />
                                    <small className={styles.helpText}>
                                        Avg price: Rs {(waterForm.unitPrice || 0).toFixed(2)}/liter
                                    </small>
                                </div>
                            )}

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Liters</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={(waterForm.liters || 0).toFixed(2)}
                                        readOnly
                                        className={styles.readOnlyInput}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Amount (Rs)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={(waterForm.amount || 0).toFixed(2)}
                                        readOnly
                                        className={styles.readOnlyInput}
                                        placeholder="0.00"
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
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Entry"
                message={`Are you sure you want to delete this ${entryToDelete?.entryType === 'water_sale' ? 'water sale' : 'product entry'}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

        </div>
    )
}

export default Shopkeeper
