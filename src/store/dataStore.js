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
    deleteUserFromDb
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
                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === id ? { ...c, ...data } : c
                    )
                }))

                try {
                    await updateCustomerInDb(id, data)
                } catch (error) {
                    console.error('Failed to update customer in DB:', error)
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
                    paymentStatus: 'pending',
                    createdAt: new Date().toISOString(),
                }

                set(state => ({ orders: [newOrder, ...state.orders] }))

                if (customer) {
                    get().updateCustomer(data.customerId, {
                        totalOrders: customer.totalOrders + 1,
                        totalSpent: customer.totalSpent + data.total,
                    })
                }

                if (customer?.uuid) {
                    try {
                        const dbOrder = await addOrderToDb(data, customer.name, customer.uuid)
                        if (dbOrder) {
                            set(state => ({
                                orders: state.orders.map(o =>
                                    o.id === newOrder.id ? dbOrder : o
                                )
                            }))
                            return dbOrder
                        }
                    } catch (error) {
                        console.error('Failed to add order to DB:', error)
                    }
                }

                return newOrder
            },

            updateOrderStatus: async (id, status) => {
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, status } : o
                    )
                }))

                try {
                    await updateOrderStatusInDb(id, status)
                } catch (error) {
                    console.error('Failed to update order status in DB:', error)
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
