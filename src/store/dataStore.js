import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { config } from '../lib/config'
import {
    initializeAllData,
    fetchCustomers,
    fetchOrders,
    fetchTransactions,
    fetchBills,
    fetchWaterProduction,
    fetchSupportTickets,
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
    updateTicketInDb
} from '../lib/supabaseService'

// Generate unique IDs (for local/mock mode)
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Initial mock data (used when Supabase is not configured)
const mockData = {
    currentUser: {
        id: 'admin-001',
        email: 'admin@devinewater.pk',
        name: 'Admin User',
        role: 'admin'
    },

    customers: [
        { id: 'CUS-001', name: 'Ahmed Hassan', email: 'ahmed@email.com', phone: '+92 300 1234567', address: 'House 123, Block A, DHA Phase 5', status: 'active', createdAt: '2023-06-15', totalOrders: 45, totalSpent: 67500 },
        { id: 'CUS-002', name: 'Sara Mohamed', email: 'sara@email.com', phone: '+92 321 9876543', address: 'Flat 45, Clifton Block 8', status: 'active', createdAt: '2023-08-22', totalOrders: 32, totalSpent: 48000 },
        { id: 'CUS-003', name: 'Omar Ali', email: 'omar@email.com', phone: '+92 333 5555555', address: 'Office 12, Business Bay', status: 'active', createdAt: '2024-01-10', totalOrders: 78, totalSpent: 156000 },
        { id: 'CUS-004', name: 'Fatima Khan', email: 'fatima@email.com', phone: '+92 345 7777777', address: 'House 78, PECHS Block 2', status: 'inactive', createdAt: '2023-11-05', totalOrders: 12, totalSpent: 18000 },
        { id: 'CUS-005', name: 'Yusuf Ibrahim', email: 'yusuf@email.com', phone: '+92 312 8888888', address: 'Apartment 23, Gulshan Block 13', status: 'active', createdAt: '2024-03-20', totalOrders: 21, totalSpent: 31500 },
    ],

    orders: [
        { id: 'ORD-001', customerId: 'CUS-001', customerName: 'Ahmed Hassan', items: [{ name: 'Water Bottle 19L', qty: 5, price: 500 }], total: 2500, status: 'delivered', paymentStatus: 'paid', createdAt: '2024-12-23T10:30:00' },
        { id: 'ORD-002', customerId: 'CUS-002', customerName: 'Sara Mohamed', items: [{ name: 'Water Bottle 19L', qty: 3, price: 500 }], total: 1500, status: 'pending', paymentStatus: 'pending', createdAt: '2024-12-23T08:15:00' },
        { id: 'ORD-003', customerId: 'CUS-003', customerName: 'Omar Ali', items: [{ name: 'Water Bottle 19L', qty: 10, price: 500 }], total: 5000, status: 'processing', paymentStatus: 'pending', createdAt: '2024-12-22T14:00:00' },
        { id: 'ORD-004', customerId: 'CUS-001', customerName: 'Ahmed Hassan', items: [{ name: 'Water Bottle 19L', qty: 2, price: 500 }], total: 1000, status: 'delivered', paymentStatus: 'paid', createdAt: '2024-12-21T11:00:00' },
        { id: 'ORD-005', customerId: 'CUS-005', customerName: 'Yusuf Ibrahim', items: [{ name: 'Water Bottle 19L', qty: 4, price: 500 }], total: 2000, status: 'cancelled', paymentStatus: 'refunded', createdAt: '2024-12-20T09:00:00' },
    ],

    transactions: [
        { id: 'TRX-001', type: 'income', category: 'Water Sales', amount: 45000, description: 'December Week 1 Sales', createdAt: '2024-12-07' },
        { id: 'TRX-002', type: 'income', category: 'Water Sales', amount: 52000, description: 'December Week 2 Sales', createdAt: '2024-12-14' },
        { id: 'TRX-003', type: 'income', category: 'Water Sales', amount: 48000, description: 'December Week 3 Sales', createdAt: '2024-12-21' },
        { id: 'TRX-004', type: 'expense', category: 'Electricity', amount: 12500, description: 'December Electricity Bill', createdAt: '2024-12-15' },
        { id: 'TRX-005', type: 'expense', category: 'Chemicals', amount: 8200, description: 'Water Treatment Chemicals', createdAt: '2024-12-10' },
        { id: 'TRX-006', type: 'expense', category: 'Maintenance', amount: 9800, description: 'Equipment Maintenance', createdAt: '2024-12-18' },
        { id: 'TRX-007', type: 'expense', category: 'Fuel', amount: 5000, description: 'Delivery Vehicle Fuel', createdAt: '2024-12-20' },
    ],

    bills: [
        { id: 'INV-001', customerId: 'CUS-001', month: 'December 2024', amount: 2850, usageLiters: 285, status: 'pending', dueDate: '2024-12-31', createdAt: '2024-12-01' },
        { id: 'INV-002', customerId: 'CUS-001', month: 'November 2024', amount: 2500, usageLiters: 250, status: 'paid', dueDate: '2024-11-30', paidDate: '2024-11-25', createdAt: '2024-11-01' },
        { id: 'INV-003', customerId: 'CUS-002', month: 'December 2024', amount: 1800, usageLiters: 180, status: 'pending', dueDate: '2024-12-31', createdAt: '2024-12-01' },
    ],

    waterProduction: [
        { id: 'WP-001', date: '2024-07-01', produced: 42500, consumed: 40200 },
        { id: 'WP-002', date: '2024-08-01', produced: 45200, consumed: 43100 },
        { id: 'WP-003', date: '2024-09-01', produced: 48900, consumed: 46500 },
        { id: 'WP-004', date: '2024-10-01', produced: 46300, consumed: 44100 },
        { id: 'WP-005', date: '2024-11-01', produced: 52100, consumed: 49800 },
        { id: 'WP-006', date: '2024-12-01', produced: 55800, consumed: 53200 },
    ],

    supportTickets: [
        { id: 'TKT-001', customerId: 'CUS-001', subject: 'Water quality issue', message: 'The water seems cloudy today.', status: 'resolved', adminReply: 'We have checked and resolved the issue. Please try again.', createdAt: '2024-12-20' },
        { id: 'TKT-002', customerId: 'CUS-001', subject: 'Delivery delayed', message: 'My order is delayed by 2 days.', status: 'in_progress', adminReply: null, createdAt: '2024-12-22' },
    ],
}

// Main data store
export const useDataStore = create(
    persist(
        (set, get) => ({
            // Initial state
            currentUser: mockData.currentUser,
            customers: [],
            orders: [],
            transactions: [],
            bills: [],
            waterProduction: [],
            supportTickets: [],
            isLoading: false,
            isInitialized: false,
            error: null,

            // ===== INITIALIZATION =====
            initialize: async () => {
                // Don't re-initialize if already done
                if (get().isInitialized) return

                set({ isLoading: true, error: null })

                try {
                    if (!config.useMockData) {
                        // Try to fetch from Supabase
                        const data = await initializeAllData()

                        if (data) {
                            set({
                                customers: data.customers,
                                orders: data.orders,
                                transactions: data.transactions,
                                bills: data.bills,
                                waterProduction: data.waterProduction,
                                supportTickets: data.supportTickets,
                                isLoading: false,
                                isInitialized: true
                            })
                            console.log('✅ Data loaded from Supabase')
                            return
                        }
                    }

                    // Fall back to mock data
                    set({
                        customers: mockData.customers,
                        orders: mockData.orders,
                        transactions: mockData.transactions,
                        bills: mockData.bills,
                        waterProduction: mockData.waterProduction,
                        supportTickets: mockData.supportTickets,
                        isLoading: false,
                        isInitialized: true
                    })
                    console.log('📦 Using mock data')
                } catch (error) {
                    console.error('Failed to initialize:', error)
                    // Fall back to mock data on error
                    set({
                        customers: mockData.customers,
                        orders: mockData.orders,
                        transactions: mockData.transactions,
                        bills: mockData.bills,
                        waterProduction: mockData.waterProduction,
                        supportTickets: mockData.supportTickets,
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
                if (!config.useMockData) {
                    try {
                        const dbCustomer = await addCustomerToDb(data)
                        if (dbCustomer) {
                            // Update with actual DB data
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
                }

                return newCustomer
            },

            updateCustomer: async (id, data) => {
                // Optimistic update
                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === id ? { ...c, ...data } : c
                    )
                }))

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await updateCustomerInDb(id, data)
                    } catch (error) {
                        console.error('Failed to update customer in DB:', error)
                    }
                }
            },

            deleteCustomer: async (id) => {
                // Optimistic update
                set(state => ({
                    customers: state.customers.filter(c => c.id !== id)
                }))

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await deleteCustomerFromDb(id)
                    } catch (error) {
                        console.error('Failed to delete customer from DB:', error)
                    }
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

                // Optimistic update
                set(state => ({ orders: [newOrder, ...state.orders] }))

                // Update customer stats
                if (customer) {
                    get().updateCustomer(data.customerId, {
                        totalOrders: customer.totalOrders + 1,
                        totalSpent: customer.totalSpent + data.total,
                    })
                }

                // Persist to Supabase
                if (!config.useMockData && customer?.uuid) {
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
                // Optimistic update
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, status } : o
                    )
                }))

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await updateOrderStatusInDb(id, status)
                    } catch (error) {
                        console.error('Failed to update order status in DB:', error)
                    }
                }
            },

            updateOrderPayment: async (id, paymentStatus) => {
                // Optimistic update
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, paymentStatus } : o
                    )
                }))

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await updateOrderPaymentInDb(id, paymentStatus)
                    } catch (error) {
                        console.error('Failed to update order payment in DB:', error)
                    }
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

                // Optimistic update
                set(state => ({
                    transactions: [newTransaction, ...state.transactions]
                }))

                // Persist to Supabase
                if (!config.useMockData) {
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

                // Optimistic update
                set(state => ({ bills: [newBill, ...state.bills] }))

                // Persist to Supabase
                if (!config.useMockData) {
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
                }

                return newBill
            },

            payBill: async (id) => {
                const bill = get().bills.find(b => b.id === id)

                // Optimistic update
                set(state => ({
                    bills: state.bills.map(b =>
                        b.id === id ? { ...b, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : b
                    )
                }))

                // Add income transaction
                if (bill) {
                    get().addTransaction({
                        type: 'income',
                        category: 'Bill Payment',
                        amount: bill.amount,
                        description: `Payment for ${bill.month}`,
                    })
                }

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await payBillInDb(id)
                    } catch (error) {
                        console.error('Failed to pay bill in DB:', error)
                    }
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

                // Optimistic update
                set(state => ({
                    waterProduction: [...state.waterProduction, newRecord]
                }))

                // Persist to Supabase
                if (!config.useMockData) {
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

                // Optimistic update
                set(state => ({
                    supportTickets: [newTicket, ...state.supportTickets]
                }))

                // Persist to Supabase
                if (!config.useMockData) {
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
                }

                return newTicket
            },

            updateTicketStatus: async (id, status, adminReply = null) => {
                // Optimistic update
                set(state => ({
                    supportTickets: state.supportTickets.map(t =>
                        t.id === id ? { ...t, status, adminReply: adminReply || t.adminReply } : t
                    )
                }))

                // Persist to Supabase
                if (!config.useMockData) {
                    try {
                        await updateTicketInDb(id, status, adminReply)
                    } catch (error) {
                        console.error('Failed to update ticket in DB:', error)
                    }
                }
            },

            // ===== DASHBOARD STATS =====
            getDashboardStats: () => {
                const { customers, orders, waterProduction } = get()
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
                if (config.useMockData) return

                set({ isLoading: true })

                try {
                    const data = await initializeAllData()
                    if (data) {
                        set({
                            customers: data.customers,
                            orders: data.orders,
                            transactions: data.transactions,
                            bills: data.bills,
                            waterProduction: data.waterProduction,
                            supportTickets: data.supportTickets,
                            isLoading: false
                        })
                    }
                } catch (error) {
                    console.error('Failed to refresh data:', error)
                    set({ isLoading: false, error: error.message })
                }
            },

            // ===== RESET =====
            resetStore: () => set({
                customers: mockData.customers,
                orders: mockData.orders,
                transactions: mockData.transactions,
                bills: mockData.bills,
                waterProduction: mockData.waterProduction,
                supportTickets: mockData.supportTickets,
                isInitialized: false
            }),
        }),
        {
            name: 'devine-water-storage',
            partialize: (state) => ({
                // Only persist if using mock data
                ...(config.useMockData ? {
                    customers: state.customers,
                    orders: state.orders,
                    transactions: state.transactions,
                    bills: state.bills,
                    waterProduction: state.waterProduction,
                    supportTickets: state.supportTickets,
                } : {}),
            }),
        }
    )
)
