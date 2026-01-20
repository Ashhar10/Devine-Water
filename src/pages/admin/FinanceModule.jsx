import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Zap,
    Beaker,
    Wrench,
    Fuel,
    Plus,
    X,
    Tag,
    Edit,
    Trash2
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import DataChart from '../../components/charts/DataChart'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import styles from './FinanceModule.module.css'

const expenseIcons = {
    'Electricity': Zap,
    'Chemicals': Beaker,
    'Maintenance': Wrench,
    'Fuel': Fuel,
}

const expenseColors = {
    'Electricity': '#ffab00',
    'Chemicals': '#00d4ff',
    'Maintenance': '#00ffc8',
    'Fuel': '#ff6b6b',
}

function FinanceModule() {
    const [showIncomeModal, setShowIncomeModal] = useState(false)
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [categoryType, setCategoryType] = useState('') // 'income' or 'expense'
    const [editingIncome, setEditingIncome] = useState(null)
    const [editingExpense, setEditingExpense] = useState(null)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]  // Default to today
    })
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        color: '#00d4ff'
    })

    // Get data from store
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const addInvestment = useDataStore(state => state.addInvestment)
    const addExpenditure = useDataStore(state => state.addExpenditure)
    const updateInvestment = useDataStore(state => state.updateInvestment)
    const updateExpenditure = useDataStore(state => state.updateExpenditure)
    const storedIncomeCategories = useDataStore(state => state.incomeCategories || [])
    const storedExpenseCategories = useDataStore(state => state.expenseCategories || [])
    const addIncomeCategory = useDataStore(state => state.addIncomeCategory)
    const addExpenseCategory = useDataStore(state => state.addExpenseCategory)
    const deleteIncomeCategory = useDataStore(state => state.deleteIncomeCategory)
    const deleteExpenseCategory = useDataStore(state => state.deleteExpenseCategory)
    const deleteInvestment = useDataStore(state => state.deleteInvestment)
    const deleteExpenditure = useDataStore(state => state.deleteExpenditure)

    // Compute financial summary with useMemo
    const { income, expenses, profit } = useMemo(() => {
        const inc = investments.reduce((sum, t) => sum + t.amount, 0)
        const exp = expenditures.reduce((sum, t) => sum + t.amount, 0)

        return {
            income: inc,
            expenses: exp,
            profit: inc - exp,
        }
    }, [investments, expenditures])

    // Group income by week for chart (using recent investments)
    const incomeData = useMemo(() => {
        return investments.slice(0, 4).map((t, i) => ({
            name: `Week ${i + 1}`,
            income: t.amount,
        }))
    }, [investments])

    // Group expenses by category
    const { expenseCategories, totalExpenses } = useMemo(() => {
        const byCategory = expenditures.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
        }, {})

        const total = Object.values(byCategory).reduce((a, b) => a + b, 0)

        const categories = Object.entries(byCategory).map(([name, amount]) => ({
            id: name.toLowerCase(),
            name,
            icon: expenseIcons[name] || Wrench,
            amount,
            color: expenseColors[name] || '#00d4ff',
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        }))

        return { expenseCategories: categories, totalExpenses: total }
    }, [expenditures])

    const handleAddIncome = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingIncome) {
                await updateInvestment(editingIncome.id, {
                    investorName: formData.category, // Using category as investorName/source
                    investmentDetail: formData.description,
                    amount: parseFloat(formData.amount),
                    investmentDate: formData.date
                })
            } else {
                await addInvestment({
                    investorName: formData.category || 'Water Sales', // Default or selected category
                    investmentDetail: formData.description,
                    amount: parseFloat(formData.amount),
                })
            }
            setShowIncomeModal(false)
            setEditingIncome(null)
            setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
        } catch (error) {
            console.error('Error adding/updating income:', error)
            alert('Failed to save income. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddExpense = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingExpense) {
                await updateExpenditure(editingExpense.id, {
                    category: formData.category,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    expenseDate: formData.date
                })
            } else {
                await addExpenditure({
                    category: formData.category,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                })
            }
            setShowExpenseModal(false)
            setEditingExpense(null)
            setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
        } catch (error) {
            console.error('Error adding/updating expense:', error)
            alert('Failed to save expense. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const categoryData = {
                name: categoryFormData.name,
                color: categoryFormData.color
            }

            if (categoryType === 'income') {
                await addIncomeCategory(categoryData)
            } else {
                await addExpenseCategory(categoryData)
            }

            setShowCategoryModal(false)
            setCategoryFormData({ name: '', color: '#00d4ff' })
        } catch (error) {
            console.error('Error adding category:', error)
            alert('Failed to add category. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }



    return (
        <div className={styles.finance}>
            {/* Summary Cards */}
            <section className={styles.summaryRow}>
                <GlassCard className={styles.summaryCard} glow glowColor="income">
                    <div className={styles.summaryIcon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Total Income</span>
                        <span className={`${styles.summaryValue} ${styles.income}`}>
                            Rs {income.toLocaleString()}
                        </span>
                    </div>
                </GlassCard>

                <GlassCard className={styles.summaryCard} glow glowColor="expense">
                    <div className={`${styles.summaryIcon} ${styles.expenseIcon}`}>
                        <TrendingDown size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Total Expenses</span>
                        <span className={`${styles.summaryValue} ${styles.expense}`}>
                            Rs {expenses.toLocaleString()}
                        </span>
                    </div>
                </GlassCard>

                <GlassCard className={styles.summaryCard} glow glowColor="cyan">
                    <div className={`${styles.summaryIcon} ${styles.profitIcon}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.summaryInfo}>
                        <span className={styles.summaryLabel}>Net Profit</span>
                        <span className={`${styles.summaryValue} ${styles.profit}`}>
                            Rs {profit.toLocaleString()}
                        </span>
                    </div>
                </GlassCard>
            </section>

            {/* Main Content */}
            <section className={styles.mainContent}>
                {/* Income Panel */}
                <div className={styles.incomePanel}>
                    <GlassCard glow glowColor="income" className={styles.panelCard}>
                        <div className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>
                                <TrendingUp size={20} className={styles.panelTitleIcon} />
                                Incoming Money
                            </h3>
                            <div className={styles.headerButtons}>
                                <Button variant="ghost" size="sm" icon={Tag} onClick={() => { setCategoryType('income'); setShowCategoryModal(true); }}>
                                    Add Category
                                </Button>
                                <Button variant="success" size="sm" icon={Plus} onClick={() => setShowIncomeModal(true)}>
                                    Add Income
                                </Button>
                            </div>
                        </div>



                        <div className={styles.transactionsList}>
                            <h4 className={styles.listTitle}>Recent Income</h4>
                            {investments.slice(0, 4).map((investment, index) => (
                                <motion.div
                                    key={investment.id}
                                    className={styles.transactionItem}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={styles.transactionInfo}>
                                        <span className={styles.transactionCategory}>{investment.investorName}</span>
                                        <span className={styles.transactionDesc}>{investment.investmentDetail}</span>
                                        <span className={styles.transactionDate}>{investment.investmentDate}</span>
                                    </div>
                                    <div className={styles.transactionActions}>
                                        <span className={`${styles.transactionAmount} ${styles.incomeAmount}`}>
                                            +Rs {investment.amount.toLocaleString()}
                                        </span>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => {
                                                setEditingIncome(investment);
                                                setFormData({
                                                    category: investment.investorName,
                                                    amount: investment.amount,
                                                    description: investment.investmentDetail || '',
                                                    date: investment.investmentDate
                                                });
                                                setShowIncomeModal(true);
                                            }}
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteInvestment(investment.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {investments.length === 0 && (
                                <p style={{ textAlign: 'center', opacity: 0.6, padding: '20px 0' }}>
                                    No income records yet
                                </p>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Expenses Panel */}
                <div className={styles.expensesPanel}>
                    <GlassCard glow glowColor="expense" className={styles.panelCard}>
                        <div className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>
                                <TrendingDown size={20} className={styles.panelTitleIcon} />
                                Outgoing Expenses
                            </h3>
                            <div className={styles.headerButtons}>
                                <Button variant="ghost" size="sm" icon={Tag} onClick={() => { setCategoryType('expense'); setShowCategoryModal(true); }}>
                                    Add Category
                                </Button>
                                <Button variant="danger" size="sm" icon={Plus} onClick={() => setShowExpenseModal(true)}>
                                    Add Expense
                                </Button>
                            </div>
                        </div>

                        {/* Expense Categories */}


                        {/* Recent Expenses */}
                        <div className={styles.transactionsList}>
                            <h4 className={styles.listTitle}>Recent Expenses</h4>
                            {expenditures.slice(0, 3).map((expenditure, index) => (
                                <motion.div
                                    key={expenditure.id}
                                    className={styles.transactionItem}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={styles.transactionInfo}>
                                        <span className={styles.transactionCategory}>{expenditure.category}</span>
                                        <span className={styles.transactionDesc}>{expenditure.description}</span>
                                        <span className={styles.transactionDate}>{expenditure.expenseDate}</span>
                                    </div>
                                    <div className={styles.transactionActions}>
                                        <span className={`${styles.transactionAmount} ${styles.expenseAmount}`}>
                                            -Rs {expenditure.amount.toLocaleString()}
                                        </span>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => {
                                                setEditingExpense(expenditure);
                                                setFormData({
                                                    category: expenditure.category,
                                                    amount: expenditure.amount,
                                                    description: expenditure.description || '',
                                                    date: expenditure.expenseDate
                                                });
                                                setShowExpenseModal(true);
                                            }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {expenditures.length === 0 && (
                                <p style={{ textAlign: 'center', opacity: 0.6, padding: '20px 0' }}>
                                    No expense records yet
                                </p>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Income Modal */}
            {showIncomeModal && (
                <div className={styles.modalOverlay} onClick={() => setShowIncomeModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingIncome ? 'Edit Income' : 'Add Income'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowIncomeModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddIncome}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {storedIncomeCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Amount (Rs)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="success" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingIncome ? 'Update Income' : 'Add Income')}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className={styles.modalOverlay} onClick={() => setShowExpenseModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowExpenseModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddExpense}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {storedExpenseCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Amount (Rs)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="danger" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
                    <GlassCard className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add {categoryType === 'income' ? 'Income' : 'Expense'} Category</h3>
                            <button className={styles.closeBtn} onClick={() => setShowCategoryModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory}>
                            <div className={styles.formGroup}>
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter category name"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Icon Color *</label>
                                <div className={styles.colorPickerGroup}>
                                    <input
                                        type="color"
                                        value={categoryFormData.color}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        className={styles.colorInput}
                                    />
                                    <div className={styles.colorPreview}>
                                        <div className={styles.sphereIcon} style={{ backgroundColor: categoryFormData.color }}></div>
                                        <span>This color will appear as a sphere icon</span>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </Button>
                        </form>

                        <div className={styles.categoryList}>
                            <h4>Existing Categories</h4>
                            <div className={styles.categoryListContent}>
                                {(categoryType === 'income' ? storedIncomeCategories : storedExpenseCategories).map(cat => (
                                    <div key={cat.id} className={styles.miniCategoryItem}>
                                        <div className={styles.miniCategoryInfo}>
                                            <div
                                                className={styles.miniSphere}
                                                style={{ backgroundColor: cat.color || '#ccc' }}
                                            />
                                            <span>{cat.name}</span>
                                        </div>
                                        <button
                                            className={styles.deleteCategoryBtn}
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            title="Delete Category"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(categoryType === 'income' ? storedIncomeCategories : storedExpenseCategories).length === 0 && (
                                    <p className={styles.noCategories}>No custom categories yet</p>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    )
}

export default FinanceModule
