import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '../lib/config'
import {
    initializeAllData,
    addCustomerToDb,
    updateCustomerInDb,
    deleteCustomerFromDb,
    addOrderToDb,
    updateOrderStatusInDb,
    updateOrderPaymentInDb,
    addTransactionToDb,
    addBillToDb,
    payBillInDb,
    addWaterProductionToDb,
    addTicketToDb,
    updateTicketInDb,
    addUserToDb,
    updateUserInDb,
    deleteUserFromDb,
    addVendorToDb,
    updateVendorInDb,
    deleteVendorFromDb,
    addPaymentToDb,
    addInvestmentToDb,
    addExpenditureToDb,
    fetchPayments,
    fetchInvestments,
    fetchExpenditures,
    deleteOrderFromDb,
    updateOrderInDb
} from '../lib/supabaseService'

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Default user
const defaultUser = {
    id: 'admin-001',
    email: 'admin@devinewater.pk',
    name: 'Admin User',
    role: 'admin'
}

// Main data store
export const useDataStore = create(
    persist(
        (set, get) => ({
            // Initial state - null user requires login
            currentUser: null,
            customers: [],
            orders: [],
            transactions: [],
            bills: [],
            waterProduction: [],
            supportTickets: [],
            users: [],
            products: [],
            areas: [],
            vendors: [],
            banks: [],
            payments: [],
            investments: [],
            expenditures: [],
            isLoading: false,
            isInitialized: false,
            error: null,

            // ===== INITIALIZATION =====
            initialize: async () => {
                // Don't re-initialize if already done
                if (get().isInitialized) return

                set({ isLoading: true, error: null })

                try {
                    // Always fetch from Supabase (no mock data fallback)
                    const data = await initializeAllData()

                    // Use real data from Supabase (can be empty arrays)
                    set({
                        customers: data?.customers || [],
                        orders: data?.orders || [],
                        transactions: data?.transactions || [],
                        bills: data?.bills || [],
                        waterProduction: data?.waterProduction || [],
                        supportTickets: data?.supportTickets || [],
                        users: data?.users || [],
                        products: data?.products || [],
                        areas: data?.areas || [],
                        vendors: data?.vendors || [],
                        banks: data?.banks || [],
                        payments: data?.payments || [],
                        investments: data?.investments || [],
                        expenditures: data?.expenditures || [],
                        isLoading: false,
                        isInitialized: true
                    })
                    console.log('✅ Data loaded from Supabase')
                } catch (error) {
                    console.error('Failed to initialize:', error)
                    // On error, show empty data (NOT mock data)
                    set({
                        customers: [],
                        orders: [],
                        transactions: [],
                        bills: [],
                        waterProduction: [],
                        supportTickets: [],
                        products: [],
                        areas: [],
                        vendors: [],
                        banks: [],
                        payments: [],
                        investments: [],
                        expenditures: [],
                        isLoading: false,
                        isInitialized: true,
                        error: error.message
                    })
                }
            },

            // ===== AUTH ACTIONS =====
            setCurrentUser: (user) => set({ currentUser: user }),
            logout: () => set({ currentUser: null }),

            // ===== CUSTOMER ACTIONS =====
            getCustomers: () => get().customers,

            getCustomerById: (id) => get().customers.find(c => c.id === id),

            addCustomer: async (data) => {
                const newCustomer = {
                    ...data,
                    id: `CUS-${generateId()}`,
                    status: 'active',
                    createdAt: new Date().toISOString().split('T')[0],
                    totalOrders: 0,
                    totalSpent: 0,
                }

                // Optimistic update
                set(state => ({ customers: [...state.customers, newCustomer] }))

                // Persist to Supabase
                try {
                    const dbCustomer = await addCustomerToDb(data)
                    if (dbCustomer) {
                        set(state => ({
                            customers: state.customers.map(c =>
                                c.id === newCustomer.id ? dbCustomer : c
                            )
                        }))
                        return dbCustomer
                    }
                } catch (error) {
                    console.error('Failed to add customer to DB:', error)
                }

                return newCustomer
            },

            updateCustomer: async (id, data) => {
                const customer = get().customers.find(c => c.id === id)
                if (!customer) return

                // Optimistic update
                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === id ? { ...c, ...data } : c
                    )
                }))

                // Update in database using customer UUID
                try {
                    await updateCustomerInDb(customer.uuid, data)
                } catch (error) {
                    console.error('Failed to update customer in DB:', error)
                    // Rollback on error
                    set(state => ({
                        customers: state.customers.map(c =>
                            c.id === id ? customer : c
                        )
                    }))
                }
            },

            deleteCustomer: async (id) => {
                set(state => ({
                    customers: state.customers.filter(c => c.id !== id)
                }))

                try {
                    await deleteCustomerFromDb(id)
                } catch (error) {
                    console.error('Failed to delete customer from DB:', error)
                }
            },

            // ===== ORDER ACTIONS =====
            getOrders: () => get().orders,

            getOrdersByCustomer: (customerId) =>
                get().orders.filter(o => o.customerId === customerId),

            addOrder: async (data) => {
                const customer = get().customers.find(c => c.id === data.customerId)
                const newOrder = {
                    ...data,
                    id: `ORD-${generateId()}`,
                    customerName: customer?.name || 'Unknown',
                    status: 'pending',
                    paymentStatus: 'unpaid',  // Changed from 'pending' to match schema
                    createdAt: new Date().toISOString(),
                }

                // Optimistic update
                set(state => ({ orders: [newOrder, ...state.orders] }))

                // Use customerUuid if provided, otherwise get from customer
                const customerUuid = data.customerUuid || customer?.uuid

                if (customerUuid && customer) {
                    try {
                        const dbOrder = await addOrderToDb({
                            ...data,
                            customerUuid
                        }, customer.name, customerUuid)

                        if (dbOrder) {
                            // Replace optimistic order with DB order
                            set(state => ({
                                orders: state.orders.map(o =>
                                    o.id === newOrder.id ? dbOrder : o
                                )
                            }))

                            // Update customer stats
                            get().updateCustomer(data.customerId, {
                                totalOrders: (customer.totalOrders || 0) + 1,
                                totalSpent: (customer.totalSpent || 0) + data.total,
                            })

                            return dbOrder
                        }
                    } catch (error) {
                        console.error('Failed to add order to DB:', error)
                        // Rollback optimistic update on error
                        set(state => ({
                            orders: state.orders.filter(o => o.id !== newOrder.id)
                        }))
                        throw error
                    }
                } else {
                    console.error('No customer UUID available for order')
                    // Rollback if no UUID
                    set(state => ({
                        orders: state.orders.filter(o => o.id !== newOrder.id)
                    }))
                }

                return newOrder
            },

            updateOrderStatus: async (orderId, newStatus) => {
                const order = get().orders.find(o => o.id === orderId)
                if (!order) return

                // Update order status locally
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === orderId ? { ...o, status: newStatus } : o
                    )
                }))

                // If delivered, add order total to customer's current balance
                if (newStatus === 'delivered' && order.customerId) {
                    const customer = get().customers.find(c => c.id === order.customerId)
                    if (customer) {
                        get().updateCustomer(order.customerId, {
                            currentBalance: (customer.currentBalance || 0) + order.total
                        })
                    }
                }

                // Update in database
                try {
                    await updateOrderStatusInDb(order.uuid, newStatus)
                } catch (error) {
                    console.error('Failed to update order status:', error)
                }
            },

            updateOrderPayment: async (id, paymentStatus) => {
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, paymentStatus } : o
                    )
                }))

                try {
                    await updateOrderPaymentInDb(id, paymentStatus)
                } catch (error) {
                    console.error('Failed to update order payment in DB:', error)
                }
            },

            updateOrder: async (id, updates) => {
                const order = get().orders.find(o => o.id === id)

                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, ...updates } : o
                    )
                }))

                try {
                    await updateOrderInDb(order.uuid, updates)
                } catch (error) {
                    console.error('Failed to update order in DB:', error)
                }
            },

            deleteOrder: async (id) => {
                const order = get().orders.find(o => o.id === id)

                set(state => ({
                    orders: state.orders.filter(o => o.id !== id)
                }))

                try {
                    await deleteOrderFromDb(order.uuid)
                } catch (error) {
                    console.error('Failed to delete order from DB:', error)
                }
            },

            // ===== TRANSACTION ACTIONS =====
            getTransactions: (type = null) => {
                const transactions = get().transactions
                return type ? transactions.filter(t => t.type === type) : transactions
            },

            addTransaction: async (data) => {
                const newTransaction = {
                    ...data,
                    id: `TRX-${generateId()}`,
                    createdAt: new Date().toISOString().split('T')[0],
                }

                set(state => ({
                    transactions: [newTransaction, ...state.transactions]
                }))

                try {
                    const dbTransaction = await addTransactionToDb(data)
                    if (dbTransaction) {
                        set(state => ({
                            transactions: state.transactions.map(t =>
                                t.id === newTransaction.id ? dbTransaction : t
                            )
                        }))
                        return dbTransaction
                    }
                } catch (error) {
                    console.error('Failed to add transaction to DB:', error)
                }

                return newTransaction
            },

            getFinanceSummary: () => {
                const transactions = get().transactions
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                const expenses = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)

                return { income, expenses, profit: income - expenses }
            },

            // ===== BILL ACTIONS =====
            getBills: (customerId = null) => {
                const bills = get().bills
                return customerId ? bills.filter(b => b.customerId === customerId) : bills
            },

            addBill: async (data) => {
                const newBill = {
                    ...data,
                    id: `INV-${generateId()}`,
                    status: 'pending',
                    createdAt: new Date().toISOString().split('T')[0],
                }

                set(state => ({ bills: [newBill, ...state.bills] }))

                const customer = get().customers.find(c => c.id === data.customerId)
                if (customer?.uuid) {
                    try {
                        const dbBill = await addBillToDb(data, customer.uuid)
                        if (dbBill) {
                            set(state => ({
                                bills: state.bills.map(b =>
                                    b.id === newBill.id ? dbBill : b
                                )
                            }))
                            return dbBill
                        }
                    } catch (error) {
                        console.error('Failed to add bill to DB:', error)
                    }
                }

                return newBill
            },

            payBill: async (id) => {
                const bill = get().bills.find(b => b.id === id)

                set(state => ({
                    bills: state.bills.map(b =>
                        b.id === id ? { ...b, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : b
                    )
                }))

                if (bill) {
                    get().addTransaction({
                        type: 'income',
                        category: 'Bill Payment',
                        amount: bill.amount,
                        description: `Payment for ${bill.month}`,
                    })
                }

                try {
                    await payBillInDb(id)
                } catch (error) {
                    console.error('Failed to pay bill in DB:', error)
                }
            },

            // ===== WATER PRODUCTION ACTIONS =====
            getWaterProduction: () => get().waterProduction,

            addWaterProduction: async (data) => {
                const newRecord = {
                    ...data,
                    id: `WP-${generateId()}`,
                    date: new Date().toISOString().split('T')[0],
                }

                set(state => ({
                    waterProduction: [...state.waterProduction, newRecord]
                }))

                try {
                    const dbRecord = await addWaterProductionToDb(data)
                    if (dbRecord) {
                        set(state => ({
                            waterProduction: state.waterProduction.map(wp =>
                                wp.id === newRecord.id ? dbRecord : wp
                            )
                        }))
                        return dbRecord
                    }
                } catch (error) {
                    console.error('Failed to add water production to DB:', error)
                }

                return newRecord
            },

            getProductionSummary: () => {
                const records = get().waterProduction
                const latest = records[records.length - 1] || { produced: 0, consumed: 0 }
                const total = records.reduce((acc, r) => ({
                    produced: acc.produced + r.produced,
                    consumed: acc.consumed + r.consumed,
                }), { produced: 0, consumed: 0 })

                return { latest, total }
            },

            // ===== SUPPORT TICKET ACTIONS =====
            getTickets: (customerId = null) => {
                const tickets = get().supportTickets
                return customerId
                    ? tickets.filter(t => t.customerId === customerId)
                    : tickets
            },

            addTicket: async (data) => {
                const newTicket = {
                    ...data,
                    id: `TKT-${generateId()}`,
                    status: 'pending',
                    adminReply: null,
                    createdAt: new Date().toISOString().split('T')[0],
                }

                set(state => ({
                    supportTickets: [newTicket, ...state.supportTickets]
                }))

                const customer = get().customers.find(c => c.id === data.customerId)
                if (customer?.uuid) {
                    try {
                        const dbTicket = await addTicketToDb(data, customer.uuid)
                        if (dbTicket) {
                            set(state => ({
                                supportTickets: state.supportTickets.map(t =>
                                    t.id === newTicket.id ? dbTicket : t
                                )
                            }))
                            return dbTicket
                        }
                    } catch (error) {
                        console.error('Failed to add ticket to DB:', error)
                    }
                }

                return newTicket
            },

            updateTicketStatus: async (id, status, adminReply = null) => {
                set(state => ({
                    supportTickets: state.supportTickets.map(t =>
                        t.id === id ? { ...t, status, adminReply: adminReply || t.adminReply } : t
                    )
                }))

                try {
                    await updateTicketInDb(id, status, adminReply)
                } catch (error) {
                    console.error('Failed to update ticket in DB:', error)
                }
            },

            // ===== DASHBOARD STATS =====
            getDashboardStats: () => {
                const { customers, orders } = get()
                const { income, expenses, profit } = get().getFinanceSummary()
                const { total } = get().getProductionSummary()

                return {
                    totalCustomers: customers.filter(c => c.status === 'active').length,
                    totalOrders: orders.length,
                    pendingOrders: orders.filter(o => o.status === 'pending').length,
                    todayOrders: orders.filter(o =>
                        o.createdAt.startsWith(new Date().toISOString().split('T')[0])
                    ).length,
                    totalWaterProduced: total.produced,
                    totalWaterConsumed: total.consumed,
                    revenue: income,
                    expenses: expenses,
                    profit: profit,
                }
            },

            // ===== REFRESH DATA =====
            refreshData: async () => {
                set({ isLoading: true })

                try {
                    const data = await initializeAllData()
                    if (data) {
                        set({
                            customers: data.customers || [],
                            orders: data.orders || [],
                            transactions: data.transactions || [],
                            bills: data.bills || [],
                            waterProduction: data.waterProduction || [],
                            supportTickets: data.supportTickets || [],
                            isLoading: false
                        })
                    }
                } catch (error) {
                    console.error('Failed to refresh data:', error)
                    set({ isLoading: false, error: error.message })
                }
            },

            // ===== USER MANAGEMENT ACTIONS =====
            getUsers: () => get().users,

            addUser: async (data) => {
                const newUser = {
                    ...data,
                    id: `USR-${generateId()}`,
                    status: 'active',
                    createdAt: new Date().toISOString().split('T')[0],
                }

                // Optimistic update
                set(state => ({ users: [...state.users, newUser] }))

                try {
                    const dbUser = await addUserToDb(data)
                    if (dbUser) {
                        set(state => ({
                            users: state.users.map(u =>
                                u.id === newUser.id ? dbUser : u
                            )
                        }))
                        return dbUser
                    }
                } catch (error) {
                    console.error('Failed to add user to DB:', error)
                }

                return newUser
            },

            updateUser: async (id, data) => {
                set(state => ({
                    users: state.users.map(u =>
                        u.id === id ? { ...u, ...data } : u
                    )
                }))

                try {
                    await updateUserInDb(id, data)
                } catch (error) {
                    console.error('Failed to update user in DB:', error)
                }
            },

            deleteUser: async (id) => {
                set(state => ({
                    users: state.users.filter(u => u.id !== id)
                }))

                try {
                    await deleteUserFromDb(id)
                } catch (error) {
                    console.error('Failed to delete user from DB:', error)
                }
            },

            // ===== PRODUCT MANAGEMENT ACTIONS =====
            getProducts: () => get().products,

            getProductById: (id) => get().products.find(p => p.id === id),

            addProduct: async (data) => {
                const newProduct = {
                    ...data,
                    id: `PRD-${generateId()}`,
                    status: 'active',
                    createdAt: new Date().toISOString().split('T')[0],
                }

                // Optimistic update
                set(state => ({ products: [...state.products, newProduct] }))

                // TODO: Add database persistence when product table is created
                // try {
                //     const dbProduct = await addProductToDb(data)
                //     if (dbProduct) {
                //         set(state => ({
                //             products: state.products.map(p =>
                //                 p.id === newProduct.id ? dbProduct : p
                //             )
                //         }))
                //         return dbProduct
                //     }
                // } catch (error) {
                //     console.error('Failed to add product to DB:', error)
                // }

                return newProduct
            },

            updateProduct: async (id, data) => {
                set(state => ({
                    products: state.products.map(p =>
                        p.id === id ? { ...p, ...data } : p
                    )
                }))

                // TODO: Add database persistence when product table is created
                // try {
                //     await updateProductInDb(id, data)
                // } catch (error) {
                //     console.error('Failed to update product in DB:', error)
                // }
            },

            deleteProduct: async (id) => {
                set(state => ({
                    products: state.products.filter(p => p.id !== id)
                }))

                // TODO: Add database persistence when product table is created
                // try {
                //     await deleteProductFromDb(id)
                // } catch (error) {
                //     console.error('Failed to delete product from DB:', error)
                // }
            },

            updateProductStock: async (id, quantity, type, remarks = '') => {
                const product = get().products.find(p => p.id === id)
                if (!product) return

                const newStock = type === 'in'
                    ? product.currentStock + quantity
                    : product.currentStock - quantity

                // Prevent negative stock
                if (newStock < 0) {
                    console.error('Stock cannot be negative')
                    return
                }

                set(state => ({
                    products: state.products.map(p =>
                        p.id === id ? { ...p, currentStock: newStock } : p
                    )
                }))

                // TODO: Add stock movement logging and database persistence
                // try {
                //     await updateProductStockInDb(id, newStock)
                //     await addStockMovementToDb({ productId: id, quantity, type, remarks })
                // } catch (error) {
                //     console.error('Failed to update stock in DB:', error)
                // }
            },

            // ===== VENDOR MANAGEMENT ACTIONS =====
            getVendors: () => get().vendors,

            addVendor: async (data) => {
                const newVendor = {
                    ...data,
                    id: `VND-${generateId()}`,
                    status: 'active',
                    currentBalance: data.openingBalance || 0,
                    createdAt: new Date().toISOString().split('T')[0],
                }

                // Optimistic update
                set(state => ({ vendors: [...state.vendors, newVendor] }))

                try {
                    const dbVendor = await addVendorToDb(data)
                    if (dbVendor) {
                        set(state => ({
                            vendors: state.vendors.map(v =>
                                v.id === newVendor.id ? dbVendor : v
                            )
                        }))
                        return dbVendor
                    }
                } catch (error) {
                    console.error('Failed to add vendor to DB:', error)
                    // Rollback on error
                    set(state => ({
                        vendors: state.vendors.filter(v => v.id !== newVendor.id)
                    }))
                    throw error
                }

                return newVendor
            },

            updateVendor: async (id, data) => {
                set(state => ({
                    vendors: state.vendors.map(v =>
                        v.id === id ? { ...v, ...data } : v
                    )
                }))

                try {
                    await updateVendorInDb(id, data)
                } catch (error) {
                    console.error('Failed to update vendor in DB:', error)
                }
            },

            deleteVendor: async (id) => {
                set(state => ({
                    vendors: state.vendors.filter(v => v.id !== id)
                }))

                try {
                    await deleteVendorFromDb(id)
                } catch (error) {
                    console.error('Failed to delete vendor from DB:', error)
                }
            },

            // ===== PAYMENT ACTIONS =====
            getPayments: (type = null) => {
                const payments = get().payments
                return type ? payments.filter(p => p.paymentType === type) : payments
            },

            addPayment: async (data) => {
                // Lookup reference name before adding
                let referenceName = 'Unknown'
                if (data.paymentType === 'customer') {
                    const customer = get().customers.find(c => c.uuid === data.referenceId)
                    referenceName = customer?.name || 'Unknown Customer'
                } else if (data.paymentType === 'vendor') {
                    const vendor = get().vendors.find(v => v.uuid === data.referenceId)
                    referenceName = vendor?.name || 'Unknown Vendor'
                }

                const newPayment = {
                    ...data,
                    id: `PAY-${generateId()}`,
                    referenceName: referenceName,  // Add name for display
                    status: 'completed',
                    paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString(),
                }

                // Optimistic update
                set(state => ({ payments: [newPayment, ...state.payments] }))

                try {
                    const dbPayment = await addPaymentToDb(data)
                    if (dbPayment) {
                        // Merge DB payment with reference name
                        const fullPayment = { ...dbPayment, referenceName }

                        set(state => ({
                            payments: state.payments.map(p =>
                                p.id === newPayment.id ? fullPayment : p
                            )
                        }))

                        // Update customer or vendor balance
                        if (data.paymentType === 'customer') {
                            const customer = get().customers.find(c => c.uuid === data.referenceId)
                            if (customer) {
                                get().updateCustomer(customer.id, {
                                    currentBalance: (customer.currentBalance || 0) - parseFloat(data.amount)
                                })
                            }
                        } else if (data.paymentType === 'vendor') {
                            const vendor = get().vendors.find(v => v.uuid === data.referenceId)
                            if (vendor) {
                                get().updateVendor(vendor.id, {
                                    currentBalance: (vendor.currentBalance || 0) - parseFloat(data.amount)
                                })
                            }
                        }

                        return fullPayment
                    }
                } catch (error) {
                    console.error('Failed to add payment to DB:', error)
                    // Rollback on error
                    set(state => ({
                        payments: state.payments.filter(p => p.id !== newPayment.id)
                    }))
                    throw error
                }

                return newPayment
            },

            // ===== INVESTMENT ACTIONS (Income) =====
            getInvestments: () => get().investments,

            addInvestment: async (data) => {
                const newInvestment = {
                    ...data,
                    id: `INV-${generateId()}`,
                    investmentDate: data.investmentDate || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString().split('T')[0],
                }

                set(state => ({
                    investments: [newInvestment, ...state.investments]
                }))

                try {
                    const dbInvestment = await addInvestmentToDb(data)
                    if (dbInvestment) {
                        set(state => ({
                            investments: state.investments.map(i =>
                                i.id === newInvestment.id ? dbInvestment : i
                            )
                        }))
                        return dbInvestment
                    }
                } catch (error) {
                    console.error('Failed to add investment to DB:', error)
                    set(state => ({
                        investments: state.investments.filter(i => i.id !== newInvestment.id)
                    }))
                    throw error
                }

                return newInvestment
            },

            // ===== EXPENDITURE ACTIONS (Expense) =====
            getExpenditures: () => get().expenditures,

            addExpenditure: async (data) => {
                const newExpenditure = {
                    ...data,
                    id: `EXP-${generateId()}`,
                    expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString().split('T')[0],
                }

                set(state => ({
                    expenditures: [newExpenditure, ...state.expenditures]
                }))

                try {
                    const dbExpenditure = await addExpenditureToDb(data)
                    if (dbExpenditure) {
                        set(state => ({
                            expenditures: state.expenditures.map(e =>
                                e.id === newExpenditure.id ? dbExpenditure : e
                            )
                        }))
                        return dbExpenditure
                    }
                } catch (error) {
                    console.error('Failed to add expenditure to DB:', error)
                    set(state => ({
                        expenditures: state.expenditures.filter(e => e.id !== newExpenditure.id)
                    }))
                    throw error
                }

                return newExpenditure
            },

            // ===== RESET =====
            resetStore: () => set({
                customers: [],
                orders: [],
                transactions: [],
                bills: [],
                waterProduction: [],
                supportTickets: [],
                users: [],
                isInitialized: false
            }),
        }),
        {
            name: 'devine-water-storage',
            partialize: () => ({}), // Don't persist anything - always load from Supabase
        }
    )
)
