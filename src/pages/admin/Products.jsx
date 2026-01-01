import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Plus,
    Package,
    Edit,
    Trash,
    X,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Droplets
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import styles from './Products.module.css'

const BOTTLE_TYPES = ['19L', '6L', '1.5L', '500ML', '330ML', 'Custom']

function Products() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showStockModal, setShowStockModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [stockMovement, setStockMovement] = useState({ type: 'in', quantity: 0, remarks: '' })
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        bottleType: '19L',
        price: '',
        purchasePrice: '',
        currentStock: 0,
        minStockAlert: 10
    })

    const products = useDataStore(state => state.products)
    const addProduct = useDataStore(state => state.addProduct)
    const updateProduct = useDataStore(state => state.updateProduct)
    const deleteProduct = useDataStore(state => state.deleteProduct)
    const updateProductStock = useDataStore(state => state.updateProductStock)

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bottleType.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        lowStock: products.filter(p => p.currentStock <= p.minStockAlert).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.currentStock), 0)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingProduct) {
                // Update existing product
                await updateProduct(editingProduct.id, {
                    ...formData,
                    price: parseFloat(formData.price),
                    purchasePrice: parseFloat(formData.purchasePrice) || 0,
                })
            } else {
                // Add new product
                await addProduct({
                    ...formData,
                    price: parseFloat(formData.price),
                    purchasePrice: parseFloat(formData.purchasePrice) || 0,
                })
            }
            resetForm()
        } catch (error) {
            console.error('Failed to save product:', error)
        }
    }

    const handleStockUpdate = async (e) => {
        e.preventDefault()

        try {
            await updateProductStock(
                selectedProduct.id,
                stockMovement.quantity,
                stockMovement.type,
                stockMovement.remarks
            )
            setShowStockModal(false)
            setSelectedProduct(null)
            setStockMovement({ type: 'in', quantity: 0, remarks: '' })
        } catch (error) {
            console.error('Failed to update stock:', error)
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            bottleType: product.bottleType,
            price: product.price,
            purchasePrice: product.purchasePrice || '',
            currentStock: product.currentStock,
            minStockAlert: product.minStockAlert
        })
        setShowAddModal(true)
    }

    const openStockModal = (product) => {
        setSelectedProduct(product)
        setShowStockModal(true)
    }

    const handleDelete = (product) => {
        setProductToDelete(product)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                await deleteProduct(productToDelete.id)
            } catch (error) {
                console.error('Failed to delete product:', error)
            }
        }
    }

    const resetForm = () => {
        setShowAddModal(false)
        setEditingProduct(null)
        setFormData({
            name: '',
            bottleType: '19L',
            price: '',
            purchasePrice: '',
            currentStock: 0,
            minStockAlert: 10
        })
    }

    return (
        <div className={styles.products}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add Product
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <GlassCard className={styles.statCard}>
                    <Package size={24} className={styles.statIcon} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Products</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <Droplets size={24} className={`${styles.statIcon} ${styles.active}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.active}`}>{stats.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <AlertTriangle size={24} className={`${styles.statIcon} ${styles.warning}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.warning}`}>{stats.lowStock}</span>
                        <span className={styles.statLabel}>Low Stock</span>
                    </div>
                </GlassCard>
                <GlassCard className={styles.statCard}>
                    <TrendingUp size={24} className={`${styles.statIcon} ${styles.success}`} />
                    <div className={styles.statContent}>
                        <span className={`${styles.statValue} ${styles.success}`}>Rs {stats.totalValue.toLocaleString()}</span>
                        <span className={styles.statLabel}>Stock Value</span>
                    </div>
                </GlassCard>
            </div>

            {/* Products Grid */}
            <div className={styles.productsGrid}>
                {filteredProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className={styles.productCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.productIcon}>
                                    <Droplets size={24} />
                                </div>
                                <div className={styles.headerInfo}>
                                    <span className={styles.productName}>{product.name}</span>
                                    <span className={styles.productId}>{product.id}</span>
                                </div>
                                <StatusBadge status={product.status} size="sm" />
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.priceRow}>
                                    <div className={styles.priceItem}>
                                        <span className={styles.priceLabel}>Sale Price</span>
                                        <span className={styles.priceValue}>Rs {product.price}</span>
                                    </div>
                                    <div className={styles.priceItem}>
                                        <span className={styles.priceLabel}>Purchase</span>
                                        <span className={styles.priceValueMuted}>Rs {product.purchasePrice || 0}</span>
                                    </div>
                                </div>

                                <div className={styles.stockSection}>
                                    <div className={styles.stockInfo}>
                                        <span className={styles.stockLabel}>Current Stock</span>
                                        <span className={`${styles.stockValue} ${product.currentStock <= product.minStockAlert ? styles.lowStock : ''}`}>
                                            {product.currentStock} units
                                        </span>
                                    </div>
                                    <div className={styles.bottleType}>
                                        <span className={styles.typeLabel}>{product.bottleType}</span>
                                    </div>
                                </div>

                                {product.currentStock <= product.minStockAlert && (
                                    <div className={styles.lowStockAlert}>
                                        <AlertTriangle size={14} />
                                        <span>Low stock! Min: {product.minStockAlert}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.stockActions}>
                                    <button
                                        className={`${styles.stockBtn} ${styles.stockIn}`}
                                        onClick={() => openStockModal(product)}
                                    >
                                        <TrendingUp size={14} />
                                        <span>Stock</span>
                                    </button>
                                </div>
                                <div className={styles.actionBtns}>
                                    <button className={styles.actionBtn} onClick={() => handleEdit(product)}>
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.danger}`}
                                        onClick={() => handleDelete(product)}
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className={styles.emptyState}>
                        <Package size={48} />
                        <h3>No products found</h3>
                        <p>Add your first product to get started</p>
                        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                            Add Product
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className={styles.closeBtn} onClick={resetForm}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., 19 Liter Bottle"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Bottle Type *</label>
                                    <select
                                        value={formData.bottleType}
                                        onChange={(e) => setFormData({ ...formData, bottleType: e.target.value })}
                                        required
                                    >
                                        {BOTTLE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Sale Price (Rs) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="100"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Purchase Price (Rs)</label>
                                    <input
                                        type="number"
                                        value={formData.purchasePrice}
                                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                        placeholder="50"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Current Stock</label>
                                    <input
                                        type="number"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Min Stock Alert</label>
                                    <input
                                        type="number"
                                        value={formData.minStockAlert}
                                        onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 10 })}
                                        placeholder="10"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="primary" fullWidth>
                                {editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Stock Movement Modal */}
            {showStockModal && selectedProduct && (
                <div className={styles.modalOverlay} onClick={() => setShowStockModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Stock IN/OUT - {selectedProduct.name}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowStockModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.currentStockDisplay}>
                            <span>Current Stock:</span>
                            <span className={styles.stockNumber}>{selectedProduct.currentStock} units</span>
                        </div>
                        <form onSubmit={handleStockUpdate}>
                            <div className={styles.formGroup}>
                                <label>Movement Type</label>
                                <div className={styles.movementTypes}>
                                    <button
                                        type="button"
                                        className={`${styles.movementBtn} ${stockMovement.type === 'in' ? styles.activeIn : ''}`}
                                        onClick={() => setStockMovement({ ...stockMovement, type: 'in' })}
                                    >
                                        <TrendingUp size={18} />
                                        Stock IN
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.movementBtn} ${stockMovement.type === 'out' ? styles.activeOut : ''}`}
                                        onClick={() => setStockMovement({ ...stockMovement, type: 'out' })}
                                    >
                                        <TrendingDown size={18} />
                                        Stock OUT
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Quantity *</label>
                                <input
                                    type="number"
                                    value={stockMovement.quantity}
                                    onChange={(e) => setStockMovement({ ...stockMovement, quantity: parseInt(e.target.value) || 0 })}
                                    placeholder="Enter quantity"
                                    required
                                    min="1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remarks</label>
                                <input
                                    type="text"
                                    value={stockMovement.remarks}
                                    onChange={(e) => setStockMovement({ ...stockMovement, remarks: e.target.value })}
                                    placeholder="e.g., New filling, Damaged bottles"
                                />
                            </div>
                            <div className={styles.newStockPreview}>
                                <span>New Stock:</span>
                                <span className={stockMovement.type === 'in' ? styles.increased : styles.decreased}>
                                    {stockMovement.type === 'in'
                                        ? selectedProduct.currentStock + (stockMovement.quantity || 0)
                                        : selectedProduct.currentStock - (stockMovement.quantity || 0)
                                    } units
                                </span>
                            </div>
                            <Button type="submit" variant="primary" fullWidth>
                                Update Stock
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    )
}

export default Products
