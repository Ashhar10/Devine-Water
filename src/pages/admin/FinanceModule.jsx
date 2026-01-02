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
    X
} from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import DataChart from '../../components/charts/DataChart'
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState('daily')
    const [currentPeriod, setCurrentPeriod] = useState(new Date())
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]  // Default to today
    })

    // Get data from store
    const investments = useDataStore(state => state.investments)
    const expenditures = useDataStore(state => state.expenditures)
    const addInvestment = useDataStore(state => state.addInvestment)
    const addExpenditure = useDataStore(state => state.addExpenditure)

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

    // Generate chart data based on view mode
    const incomeData = useMemo(() => {
        const result = []
        const now = new Date(currentPeriod)

        // Determine date range based on view mode
        let startDate = new Date(now)
        let daysToShow = 30

        if (viewMode === 'daily') {
            startDate.setDate(now.getDate() - 29)  // Last 30 days
            daysToShow = 30
        } else if (viewMode === 'weekly') {
            startDate.setDate(now.getDate() - 83)  // Last 12 weeks
            daysToShow = 84
        } else if (viewMode === 'monthly') {
            startDate.setMonth(now.getMonth() - 11)  // Last 12 months
        } else if (viewMode === 'yearly') {
            startDate.setFullYear(now.getFullYear() - 4)  // Last 5 years
        }

        // Aggregate data by period
        const aggregated = {}

        investments.forEach(inv => {
            if (!inv.date) return
            const invDate = new Date(inv.date)
            if (invDate < startDate || invDate > now) return

            let key
            if (viewMode === 'daily') {
                key = inv.date
            } else if (viewMode === 'weekly') {
                // Get Monday of the week
                const day = invDate.getDay()
                const diff = invDate.getDate() - day + (day === 0 ? -6 : 1)
                const monday = new Date(invDate)
                monday.setDate(diff)
                key = monday.toISOString().split('T')[0]
            } else if (viewMode === 'monthly') {
                key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}-01`
            } else if (viewMode === 'yearly') {
                key = `${invDate.getFullYear()}-01-01`
            }

            if (!aggregated[key]) aggregated[key] = 0
            aggregated[key] += inv.amount
        })

        // Generate labels and fill gaps
        const keys = Object.keys(aggregated).sort()

        Object.keys(aggregated).sort().forEach(key => {
            const date = new Date(key)
            let label

            if (viewMode === 'daily') {
                const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                label = `${weekday}, ${dateStr}`
            } else if (viewMode === 'weekly') {
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            } else if (viewMode === 'monthly') {
                label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            } else if (viewMode === 'yearly') {
                label = date.getFullYear().toString()
            }

            result.push({
                name: label,
                income: aggregated[key]
            })
        })

        return result.slice(-12)  // Show last 12 periods max
    }, [investments, viewMode, currentPeriod])

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
            await addInvestment({
                investorName: formData.category || 'Water Sales',
                investmentDetail: formData.description,
                amount: parseFloat(formData.amount),
            })
            setShowIncomeModal(false)
            setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
        } catch (error) {
            console.error('Error adding income:', error)
            alert('Failed to add income. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddExpense = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await addExpenditure({
                category: formData.category,
                description: formData.description,
                amount: parseFloat(formData.amount),
            })
            setShowExpenseModal(false)
            setFormData({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })
        } catch (error) {
            console.error('Error adding expense:', error)
            alert('Failed to add expense. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.finance}>
            {/* View Mode Controls */}
            <div className={styles.viewControls}>
                <div className={styles.viewModes}>
                    {['daily', 'weekly', 'monthly', 'yearly'].map(mode => (
                        <button
                            key={mode}
                            className={`${styles.viewModeBtn} ${viewMode === mode ? styles.active : ''}`}
                            onClick={() => setViewMode(mode)}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>
                <button className={styles.todayBtn} onClick={() => setCurrentPeriod(new Date())}>
                    Today
                </button>
            </div>

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
                            <Button variant="success" size="sm" icon={Plus} onClick={() => setShowIncomeModal(true)}>
                                Add Income
                            </Button>
                        </div>

                        <DataChart
                            data={incomeData}
                            type="bar"
                            dataKeys={['income']}
                            colors={['#00e5a0']}
                            height={200}
                        />

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
                                        <span className={styles.transactionDesc}>{investment.investmentDetail || investment.investorName}</span>
                                        <span className={styles.transactionDate}>{investment.investmentDate}</span>
                                    </div>
                                    <span className={`${styles.transactionAmount} ${styles.incomeAmount}`}>
                                        +Rs {investment.amount.toLocaleString()}
                                    </span>
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
                            <Button variant="danger" size="sm" icon={Plus} onClick={() => setShowExpenseModal(true)}>
                                Add Expense
                            </Button>
                        </div>

                        {/* Expense Categories */}
                        <div className={styles.expenseCategories}>
                            {expenseCategories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    className={styles.categoryCard}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div
                                        className={styles.categoryIcon}
                                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                    >
                                        <category.icon size={20} />
                                    </div>
                                    <div className={styles.categoryInfo}>
                                        <span className={styles.categoryName}>{category.name}</span>
                                        <span className={styles.categoryAmount}>Rs {category.amount.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.categoryProgress}>
                                        <div
                                            className={styles.progressBar}
                                            style={{
                                                width: `${category.percentage}%`,
                                                backgroundColor: category.color
                                            }}
                                        />
                                    </div>
                                    <span className={styles.categoryPercentage}>{category.percentage}%</span>
                                </motion.div>
                            ))}
                        </div>

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
                                        <span className={styles.transactionDesc}>{expenditure.description}</span>
                                        <span className={styles.transactionDate}>{expenditure.expenseDate}</span>
                                    </div>
                                    <span className={`${styles.transactionAmount} ${styles.expenseAmount}`}>
                                        -Rs {expenditure.amount.toLocaleString()}
                                    </span>
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
                            <h3>Add Income</h3>
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
                                    <option value="Water Sales">Water Sales</option>
                                    <option value="Bill Payment">Bill Payment</option>
                                    <option value="Other">Other</option>
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
                                {isSubmitting ? 'Adding...' : 'Add Income'}
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
                            <h3>Add Expense</h3>
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
                                    <option value="Electricity">Electricity</option>
                                    <option value="Chemicals">Chemicals</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Fuel">Fuel</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Other">Other</option>
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
                                {isSubmitting ? 'Adding...' : 'Add Expense'}
                            </Button>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}

export default FinanceModule
