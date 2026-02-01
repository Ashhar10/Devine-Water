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
    updatePaymentInDb,
    deletePaymentFromDb,
    addInvestmentToDb,
    addExpenditureToDb,
    deleteInvestmentFromDb,
    deleteExpenditureFromDb,
    fetchPayments,
    fetchInvestments,
    fetchExpenditures,
    deleteOrderFromDb,
    updateOrderInDb,
    addProductToDb,
    updateProductInDb,
    deleteProductFromDb,
    addStockMovement,
    addDeliveryToDb,
    updateDeliveryInDb,
    addAreaToDb,
    updateAreaInDb,
    deleteAreaFromDb,
    updateInvestmentInDb,
    updateExpenditureInDb,
    addIncomeCategoryToDb,
    addExpenseCategoryToDb,
    deleteIncomeCategoryFromDb,
    deleteExpenseCategoryFromDb
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
            incomeCategories: [],
            expenseCategories: [],
            deliveries: [],
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

                    // Recovery: Check for unsaved deliveries in temp storage
                    let pendingDeliveries = []
                    try {
                        pendingDeliveries = JSON.parse(localStorage.getItem('deliveries_temp') || '[]')
                    } catch (error) {
                        console.error('Failed to load pending deliveries:', error)
                    }

                    // Merge DB deliveries with pending ones (avoiding duplicates if any)
                    // Pending ones go on top (newer usually)
                    const dbDeliveries = data?.deliveries || []
                    const mergedDeliveries = [
                        ...pendingDeliveries.filter(pd => !dbDeliveries.find(dd => dd.id === pd.id)),
                        ...dbDeliveries
                    ]

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
                        deliveries: mergedDeliveries,
                        incomeCategories: data?.incomeCategories || [],
                        expenseCategories: data?.expenseCategories || [],
                        isLoading: false,
                        isInitialized: true
                    })

                    // Attempt to sync pending items if any
                    if (pendingDeliveries.length > 0) {
                        get().syncPendingDeliveries()
                    }
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
                    })
                }
            },

            // Area Actions
            addArea: async (areaData) => {
                const newArea = {
                    ...areaData,
                    id: `AREA-${generateId()}`,
                    status: 'active'
                }

                // Optimistic update
                set(state => ({ areas: [...state.areas, newArea] }))

                // DB Persistence
                try {
                    const dbArea = await addAreaToDb(areaData)
                    if (dbArea) {
                        set(state => ({
                            areas: state.areas.map(a => a.id === newArea.id ? dbArea : a)
                        }))
                    }
                } catch (error) {
                    console.error('Failed to add area to DB:', error)
                }
                return newArea
            },

            updateArea: async (id, updates) => {
                console.log('Attemping to update Area (Store):', id, updates)
                set(state => ({
                    areas: state.areas.map(a => a.id === id ? { ...a, ...updates } : a)
                }))

                try {
                    await updateAreaInDb(id, updates)
                    console.log('Area updated in DB successfully')
                } catch (error) {
                    console.error('Failed to update area in DB:', error)
                }
            },

            deleteArea: async (id) => {
                set(state => ({
                    areas: state.areas.filter(a => a.id !== id)
                }))

                try {
                    await deleteAreaFromDb(id)
                } catch (error) {
                    console.error('Failed to delete area from DB:', error)
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
                    console.log('Updating customer in DB:', customer.uuid, data)
                    await updateCustomerInDb(customer.uuid, data)
                    console.log('Customer updated successfully')
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

                            // Update customer stats (but NOT balance - balance updates only when delivered)
                            get().updateCustomer(data.customerId, {
                                totalOrders: (customer.totalOrders || 0) + 1,
                                totalSpent: (customer.totalSpent || 0) + data.total,
                                // currentBalance updated only when order status changes to 'delivered'
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
                if (newStatus === 'delivered' && order.customerId && order.status !== 'delivered') {
                    const customer = get().customers.find(c => c.id === order.customerId)
                    if (customer) {
                        console.log('Adding to customer balance:', {
                            customerId: order.customerId,
                            currentBalance: customer.currentBalance,
                            orderTotal: order.total,
                            newBalance: (customer.currentBalance || 0) + order.total
                        })
                        await get().updateCustomer(order.customerId, {
                            currentBalance: (customer.currentBalance || 0) + order.total
                        })
                    }
                }
                // If moving FROM delivered TO something else (e.g. pending/skipped), REVERT balance
                else if (order.status === 'delivered' && newStatus !== 'delivered' && order.customerId) {
                    const customer = get().customers.find(c => c.id === order.customerId)
                    if (customer) {
                        console.log('Reverting customer balance:', {
                            customerId: order.customerId,
                            currentBalance: customer.currentBalance,
                            orderTotal: order.total,
                            newBalance: (customer.currentBalance || 0) - order.total
                        })
                        await get().updateCustomer(order.customerId, {
                            currentBalance: (customer.currentBalance || 0) - order.total
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
                if (!order) {
                    console.error('Order not found:', id)
                    return
                }

                // Prepare full local updates with all related fields
                const localUpdates = { ...updates }

                // If customer is being changed, also update customerName for UI display
                if (updates.customerId) {
                    const customer = get().customers.find(c => c.id === updates.customerId)
                    if (customer) {
                        localUpdates.customerName = customer.name
                    }
                }

                // Optimistic update to local state with complete data
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === id ? { ...o, ...localUpdates } : o
                    )
                }))

                // Prepare database updates with UUID conversion
                const dbUpdates = { ...updates }

                // Convert customer local ID to UUID if provided
                if (updates.customerId) {
                    const customer = get().customers.find(c => c.id === updates.customerId)
                    if (customer?.uuid) {
                        dbUpdates.customerUuid = customer.uuid
                        delete dbUpdates.customerId // Remove local ID
                    }
                }

                // salesmanId should already be a UUID from the form
                // No conversion needed

                try {
                    await updateOrderInDb(order.uuid, dbUpdates)
                    console.log('Order update completed successfully')

                    // NEW: Centralized Balance Logic
                    // If order WAS delivered and still IS delivered (or we just updated it), sync balance differences
                    // Note: If status just changed to 'delivered', that's handled in addOrder or updateOrderStatus.
                    // This block specifically handles "Editing an existing Delivered Order"
                    if (order.status === 'delivered' && (!updates.status || updates.status === 'delivered')) {
                        // Check if total changed
                        const newTotal = updates.total !== undefined ? parseFloat(updates.total) : order.total
                        const oldTotal = order.total || 0

                        if (newTotal !== oldTotal && order.customerId) {
                            const difference = newTotal - oldTotal
                            const customer = get().customers.find(c => c.id === order.customerId)
                            if (customer) {
                                console.log('Syncing customer balance (Order Edit):', {
                                    customerId: order.customerId,
                                    oldTotal,
                                    newTotal,
                                    difference,
                                    oldBalance: customer.currentBalance
                                })
                                await get().updateCustomer(order.customerId, {
                                    currentBalance: (customer.currentBalance || 0) + difference
                                })
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to update order in DB:', error)
                    // Rollback optimistic update on error
                    set(state => ({
                        orders: state.orders.map(o =>
                            o.id === id ? order : o
                        )
                    }))
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

                // Database persistence
                try {
                    console.log('Adding product to DB:', data)
                    const dbProduct = await addProductToDb(data)
                    if (dbProduct) {
                        console.log('Product added successfully:', dbProduct)
                        set(state => ({
                            products: state.products.map(p =>
                                p.id === newProduct.id ? dbProduct : p
                            )
                        }))
                        return dbProduct
                    } else {
                        console.warn('addProductToDb returned null/undefined')
                    }
                } catch (error) {
                    console.error('Failed to add product to DB:', error)
                }

                return newProduct
            },

            updateProduct: async (id, data) => {
                const product = get().products.find(p => p.id === id) // Get product first
                if (!product) {
                    console.error('Product not found for update:', id)
                    return
                }

                set(state => ({
                    products: state.products.map(p =>
                        p.id === id ? { ...p, ...data } : p
                    )
                }))

                // Database persistence
                try {
                    console.log('Updating product in DB:', product.uuid, data)
                    await updateProductInDb(product.uuid, data)
                    console.log('Product updated successfully')
                } catch (error) {
                    console.error('Failed to update product in DB:', error)
                }
            },

            deleteProduct: async (id) => {
                const product = get().products.find(p => p.id === id)
                if (!product) {
                    console.error('Product not found for delete:', id)
                    return
                }

                set(state => ({
                    products: state.products.filter(p => p.id !== id)
                }))

                // Database persistence
                try {
                    console.log('Deleting product from DB:', product.uuid)
                    await deleteProductFromDb(product.uuid)
                    console.log('Product deleted successfully')
                } catch (error) {
                    console.error('Failed to delete product from DB:', error)
                }
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

                // Stock movement logging and database persistence
                try {
                    await addStockMovement({
                        productUuid: product.uuid,
                        quantity,
                        movementType: type,
                        remarks
                    })
                } catch (error) {
                    console.error('Failed to update stock in DB:', error)
                }
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

            updatePayment: async (id, updates) => {
                const oldPayment = get().payments.find(p => p.id === id)
                if (!oldPayment) return

                set(state => ({
                    payments: state.payments.map(p =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                }))

                try {
                    const dbPayment = await updatePaymentInDb(id, updates)

                    // Handle balance updates logic - Simplified REVERSAL and RE-APPLICATION
                    // Check if amount or type changed
                    if (oldPayment.amount !== updates.amount || oldPayment.referenceId !== updates.referenceId || oldPayment.paymentType !== updates.paymentType) {
                        // 1. Revert Old Payment
                        const oldAmount = parseFloat(oldPayment.amount)
                        if (oldPayment.paymentType === 'customer') {
                            const customer = get().customers.find(c => c.uuid === oldPayment.referenceId)
                            if (customer) {
                                get().updateCustomer(customer.id, {
                                    currentBalance: (customer.currentBalance || 0) + oldAmount // Add back if it was a payment received (reduced balance)
                                })
                            }
                        } else {
                            const vendor = get().vendors.find(v => v.uuid === oldPayment.referenceId)
                            if (vendor) {
                                get().updateVendor(vendor.id, {
                                    currentBalance: (vendor.currentBalance || 0) + oldAmount // Add back if it was paid to vendor (reduced debt... wait. vendor balance usually implies how much we owe? or how much we paid?)
                                    // Let's assume standard logic: reference.currentBalance is "Account Receivable" for Customer, "Account Payable" for Vendor.
                                    // If we pay vendor, balance (debt) decreases. So reverting means adding back.
                                })
                            }
                        }

                        // 2. Apply New Payment
                        const newAmount = parseFloat(updates.amount)
                        if (updates.paymentType === 'customer') {
                            const customer = get().customers.find(c => c.uuid === updates.referenceId)
                            if (customer) {
                                get().updateCustomer(customer.id, {
                                    currentBalance: (customer.currentBalance || 0) - newAmount
                                })
                            }
                        } else {
                            const vendor = get().vendors.find(v => v.uuid === updates.referenceId)
                            if (vendor) {
                                get().updateVendor(vendor.id, {
                                    currentBalance: (vendor.currentBalance || 0) - newAmount
                                })
                            }
                        }
                    }

                } catch (error) {
                    console.error('Failed to update payment:', error)
                }
            },

            deletePayment: async (id) => {
                const paymentToDelete = get().payments.find(p => p.id === id)

                set(state => ({
                    payments: state.payments.filter(p => p.id !== id)
                }))

                try {
                    await deletePaymentFromDb(id)

                    // Revert balance
                    if (paymentToDelete) {
                        const amount = parseFloat(paymentToDelete.amount)
                        if (paymentToDelete.paymentType === 'customer') {
                            const customer = get().customers.find(c => c.uuid === paymentToDelete.referenceId)
                            if (customer) {
                                get().updateCustomer(customer.id, {
                                    currentBalance: (customer.currentBalance || 0) + amount
                                })
                            }
                        } else if (paymentToDelete.paymentType === 'vendor') {
                            const vendor = get().vendors.find(v => v.uuid === paymentToDelete.referenceId)
                            if (vendor) {
                                get().updateVendor(vendor.id, {
                                    currentBalance: (vendor.currentBalance || 0) + amount
                                })
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to delete payment:', error)
                }
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

            deleteInvestment: async (id) => {
                set(state => ({
                    investments: state.investments.filter(i => i.id !== id)
                }))

                try {
                    await deleteInvestmentFromDb(id)
                } catch (error) {
                    console.error('Failed to delete investment from DB:', error)
                    // Revert state if needed (optional implementation vs optimistic update)
                }
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

            deleteExpenditure: async (id) => {
                set(state => ({
                    expenditures: state.expenditures.filter(e => e.id !== id)
                }))

                try {
                    await deleteExpenditureFromDb(id)
                } catch (error) {
                    console.error('Failed to delete expenditure from DB:', error)
                }
            },

            // ===== Categories =====
            addIncomeCategory: async (category) => {
                const newCategory = { ...category, id: generateId() }

                // Optimistic update
                set(state => ({
                    incomeCategories: [...(state.incomeCategories || []), newCategory]
                }))

                try {
                    const dbCategory = await addIncomeCategoryToDb(newCategory)
                    if (dbCategory) {
                        set(state => ({
                            incomeCategories: (state.incomeCategories || []).map(c =>
                                c.id === newCategory.id ? dbCategory : c
                            )
                        }))
                    }
                } catch (error) {
                    console.error('Failed to add income category to DB:', error)
                }
            },

            addExpenseCategory: async (category) => {
                const newCategory = { ...category, id: generateId() }

                // Optimistic update
                set(state => ({
                    expenseCategories: [...(state.expenseCategories || []), newCategory]
                }))

                try {
                    const dbCategory = await addExpenseCategoryToDb(newCategory)
                    if (dbCategory) {
                        set(state => ({
                            expenseCategories: (state.expenseCategories || []).map(c =>
                                c.id === newCategory.id ? dbCategory : c
                            )
                        }))
                    }
                } catch (error) {
                    console.error('Failed to add expense category to DB:', error)
                }
            },

            deleteIncomeCategory: async (id) => {
                set(state => ({
                    incomeCategories: state.incomeCategories.filter(c => c.id !== id)
                }))

                try {
                    await deleteIncomeCategoryFromDb(id)
                } catch (error) {
                    console.error('Failed to delete income category from DB:', error)
                }
            },

            deleteExpenseCategory: async (id) => {
                set(state => ({
                    expenseCategories: state.expenseCategories.filter(c => c.id !== id)
                }))

                try {
                    await deleteExpenseCategoryFromDb(id)
                } catch (error) {
                    console.error('Failed to delete expense category from DB:', error)
                }
            },

            updateInvestment: async (id, updates) => {
                // Optimistic update
                set(state => ({
                    investments: state.investments.map(i =>
                        i.id === id ? { ...i, ...updates } : i
                    )
                }))

                try {
                    await updateInvestmentInDb(id, updates)
                } catch (error) {
                    console.error('Failed to update investment in DB:', error)
                }
            },

            updateExpenditure: async (id, updates) => {
                // Optimistic update
                set(state => ({
                    expenditures: state.expenditures.map(e =>
                        e.id === id ? { ...e, ...updates } : e
                    )
                }))

                try {
                    await updateExpenditureInDb(id, updates)
                } catch (error) {
                    console.error('Failed to update expenditure in DB:', error)
                }
            },

            // ===== DELIVERY ACTIONS =====
            getDeliveries: () => get().deliveries,

            getDeliveriesByDate: (date) => {
                return get().deliveries.filter(d => d.deliveryDate === date)
            },

            getDeliveryForCustomer: (customerId, date) => {
                return get().deliveries.find(
                    d => d.customerId === customerId && d.deliveryDate === date
                )
            },
            getDeliveriesForCustomer: (customerId, date) => {
                return get().deliveries.filter(
                    d => d.customerId === customerId && d.deliveryDate === date
                )
            },

            addDelivery: async (data) => {
                const newDelivery = {
                    ...data,
                    id: `DEL-${generateId()}`,
                    createdAt: new Date().toISOString(),
                }

                // Optimistic update
                set(state => ({ deliveries: [newDelivery, ...state.deliveries] }))

                // Save to localStorage temporarily (optimistic cache)
                try {
                    const existingDeliveries = JSON.parse(localStorage.getItem('deliveries_temp') || '[]')
                    localStorage.setItem('deliveries_temp', JSON.stringify([newDelivery, ...existingDeliveries]))
                } catch (error) {
                    console.error('Failed to save delivery to temp localStorage:', error)
                }

                // Save to database
                const customer = get().customers.find(c => c.id === data.customerId)
                if (customer?.uuid) {
                    try {
                        const dbDelivery = await addDeliveryToDb(data, customer.uuid)
                        if (dbDelivery) {
                            // Successfully saved to database - update state with DB version
                            set(state => ({
                                deliveries: state.deliveries.map(d =>
                                    d.id === newDelivery.id ? dbDelivery : d
                                )
                            }))

                            // Clear temporary localStorage after successful DB save
                            try {
                                localStorage.removeItem('deliveries_temp')
                            } catch (err) {
                                console.error('Failed to clear temp localStorage:', err)
                            }

                            return dbDelivery
                        }
                    } catch (error) {
                        console.error('Failed to add delivery to DB:', error)
                        // Keep in localStorage temporarily for retry
                    }
                } else {
                    console.error('No customer UUID available for delivery')
                }

                return newDelivery
            },

            updateDelivery: async (id, updates) => {
                set(state => ({
                    deliveries: state.deliveries.map(d =>
                        d.id === id ? { ...d, ...updates } : d
                    )
                }))

                try {
                    await updateDeliveryInDb(id, updates)
                } catch (error) {
                    console.error('Failed to update delivery:', error)
                    // Revert? (Optional complexity)
                }
            },

            syncPendingDeliveries: async () => {
                const pendingDeliveries = JSON.parse(localStorage.getItem('deliveries_temp') || '[]')
                if (pendingDeliveries.length === 0) return

                console.log(`Attempting to sync ${pendingDeliveries.length} pending deliveries...`)
                const remainingPending = []

                for (const delivery of pendingDeliveries) {
                    try {
                        const customer = get().customers.find(c => c.id === delivery.customerId)
                        if (customer?.uuid) {
                            const dbDelivery = await addDeliveryToDb(delivery, customer.uuid)
                            if (dbDelivery) {
                                // Update state: Replace temp ID with real DB ID if needed, or just update
                                set(state => ({
                                    deliveries: state.deliveries.map(d =>
                                        d.id === delivery.id ? dbDelivery : d
                                    )
                                }))
                                continue // Success, don't add to remaining
                            }
                        }
                        remainingPending.push(delivery)
                    } catch (error) {
                        console.error('Sync failed for delivery:', delivery.id, error)
                        remainingPending.push(delivery)
                    }
                }

                // Update temp storage with what's left
                if (remainingPending.length === 0) {
                    localStorage.removeItem('deliveries_temp')
                } else {
                    localStorage.setItem('deliveries_temp', JSON.stringify(remainingPending))
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
                investments: [],
                expenditures: [],
                incomeCategories: [],
                expenseCategories: [],
                isInitialized: false
            }),
        }),
        {
            name: 'devine-water-storage',
            partialize: () => ({}), // Don't persist anything - always load from Supabase
        }
    )
)
