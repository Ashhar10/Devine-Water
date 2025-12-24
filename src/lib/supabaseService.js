/**
 * Supabase Service Layer
 * All database operations for Devine Water
 */
import { supabase, isSupabaseConfigured } from './supabase'

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

const handleError = (error, operation) => {
    console.error(`Supabase ${operation} error:`, error)
    throw new Error(`Failed to ${operation}: ${error.message}`)
}

// =====================================================
// CUSTOMERS
// =====================================================

export const fetchCustomers = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch customers')

    return data?.map(c => ({
        id: c.customer_id,
        uuid: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        latitude: c.latitude ? parseFloat(c.latitude) : null,
        longitude: c.longitude ? parseFloat(c.longitude) : null,
        status: c.status,
        totalOrders: c.total_orders,
        totalSpent: parseFloat(c.total_spent),
        createdAt: c.created_at?.split('T')[0]
    })) || []
}

export const addCustomerToDb = async (customerData) => {
    if (!isSupabaseConfigured()) return null

    const customerId = generateId('CUS')

    const { data, error } = await supabase
        .from('customers')
        .insert({
            customer_id: customerId,
            name: customerData.name,
            email: customerData.email || null,
            phone: customerData.phone,
            address: customerData.address,
            latitude: customerData.latitude || null,
            longitude: customerData.longitude || null,
            status: 'active',
            total_orders: 0,
            total_spent: 0
        })
        .select()
        .single()

    if (error) handleError(error, 'add customer')

    return {
        id: data.customer_id,
        uuid: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        status: data.status,
        totalOrders: data.total_orders,
        totalSpent: parseFloat(data.total_spent),
        createdAt: data.created_at?.split('T')[0]
    }
}

export const updateCustomerInDb = async (customerId, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.phone) dbUpdates.phone = updates.phone
    if (updates.address) dbUpdates.address = updates.address
    if (updates.status) dbUpdates.status = updates.status
    if (updates.totalOrders !== undefined) dbUpdates.total_orders = updates.totalOrders
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent
    dbUpdates.updated_at = new Date().toISOString()

    const { error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('customer_id', customerId)

    if (error) handleError(error, 'update customer')
}

export const deleteCustomerFromDb = async (customerId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('customer_id', customerId)

    if (error) handleError(error, 'delete customer')
}

// =====================================================
// ORDERS
// =====================================================

export const fetchOrders = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch orders')

    return data?.map(o => ({
        id: o.order_id,
        uuid: o.id,
        customerId: o.customer_id,
        customerName: o.customer_name,
        items: o.order_items?.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: parseFloat(item.price)
        })) || [],
        total: parseFloat(o.total),
        status: o.status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at
    })) || []
}

export const addOrderToDb = async (orderData, customerName, customerUuid) => {
    if (!isSupabaseConfigured()) return null

    const orderId = generateId('ORD')

    // Insert order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            order_id: orderId,
            customer_id: customerUuid,
            customer_name: customerName,
            total: orderData.total,
            status: 'pending',
            payment_status: 'pending'
        })
        .select()
        .single()

    if (orderError) handleError(orderError, 'add order')

    // Insert order items
    if (orderData.items?.length > 0) {
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            name: item.name,
            quantity: item.qty,
            price: item.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) handleError(itemsError, 'add order items')
    }

    return {
        id: order.order_id,
        uuid: order.id,
        customerId: orderData.customerId,
        customerName: customerName,
        items: orderData.items,
        total: parseFloat(order.total),
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
    }
}

export const updateOrderStatusInDb = async (orderId, status) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)

    if (error) handleError(error, 'update order status')
}

export const updateOrderPaymentInDb = async (orderId, paymentStatus) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)

    if (error) handleError(error, 'update order payment')
}

// =====================================================
// TRANSACTIONS
// =====================================================

export const fetchTransactions = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch transactions')

    return data?.map(t => ({
        id: t.transaction_id,
        uuid: t.id,
        type: t.type,
        category: t.category,
        amount: parseFloat(t.amount),
        description: t.description,
        createdAt: t.created_at?.split('T')[0]
    })) || []
}

export const addTransactionToDb = async (transactionData) => {
    if (!isSupabaseConfigured()) return null

    const transactionId = generateId('TRX')

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            transaction_id: transactionId,
            type: transactionData.type,
            category: transactionData.category,
            amount: transactionData.amount,
            description: transactionData.description
        })
        .select()
        .single()

    if (error) handleError(error, 'add transaction')

    return {
        id: data.transaction_id,
        uuid: data.id,
        type: data.type,
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description,
        createdAt: data.created_at?.split('T')[0]
    }
}

// =====================================================
// BILLS
// =====================================================

export const fetchBills = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('bills')
        .select(`
            *,
            customers (customer_id)
        `)
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch bills')

    return data?.map(b => ({
        id: b.bill_id,
        uuid: b.id,
        customerId: b.customers?.customer_id,
        month: b.month,
        amount: parseFloat(b.amount),
        usageLiters: b.usage_liters,
        status: b.status,
        dueDate: b.due_date,
        paidDate: b.paid_date,
        createdAt: b.created_at?.split('T')[0]
    })) || []
}

export const addBillToDb = async (billData, customerUuid) => {
    if (!isSupabaseConfigured()) return null

    const billId = generateId('INV')

    const { data, error } = await supabase
        .from('bills')
        .insert({
            bill_id: billId,
            customer_id: customerUuid,
            month: billData.month,
            amount: billData.amount,
            usage_liters: billData.usageLiters,
            status: 'pending',
            due_date: billData.dueDate
        })
        .select()
        .single()

    if (error) handleError(error, 'add bill')

    return {
        id: data.bill_id,
        uuid: data.id,
        customerId: billData.customerId,
        month: data.month,
        amount: parseFloat(data.amount),
        usageLiters: data.usage_liters,
        status: data.status,
        dueDate: data.due_date,
        createdAt: data.created_at?.split('T')[0]
    }
}

export const payBillInDb = async (billId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('bills')
        .update({
            status: 'paid',
            paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('bill_id', billId)

    if (error) handleError(error, 'pay bill')
}

// =====================================================
// WATER PRODUCTION
// =====================================================

export const fetchWaterProduction = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('water_production')
        .select('*')
        .order('date', { ascending: true })

    if (error) handleError(error, 'fetch water production')

    return data?.map(wp => ({
        id: wp.record_id,
        uuid: wp.id,
        date: wp.date,
        produced: wp.produced,
        consumed: wp.consumed
    })) || []
}

export const addWaterProductionToDb = async (productionData) => {
    if (!isSupabaseConfigured()) return null

    const recordId = generateId('WP')

    const { data, error } = await supabase
        .from('water_production')
        .insert({
            record_id: recordId,
            date: productionData.date || new Date().toISOString().split('T')[0],
            produced: productionData.produced,
            consumed: productionData.consumed
        })
        .select()
        .single()

    if (error) handleError(error, 'add water production')

    return {
        id: data.record_id,
        uuid: data.id,
        date: data.date,
        produced: data.produced,
        consumed: data.consumed
    }
}

// =====================================================
// SUPPORT TICKETS
// =====================================================

export const fetchSupportTickets = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            customers (customer_id)
        `)
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch support tickets')

    return data?.map(t => ({
        id: t.ticket_id,
        uuid: t.id,
        customerId: t.customers?.customer_id,
        subject: t.subject,
        message: t.message,
        status: t.status,
        adminReply: t.admin_reply,
        createdAt: t.created_at?.split('T')[0]
    })) || []
}

export const addTicketToDb = async (ticketData, customerUuid) => {
    if (!isSupabaseConfigured()) return null

    const ticketId = generateId('TKT')

    const { data, error } = await supabase
        .from('support_tickets')
        .insert({
            ticket_id: ticketId,
            customer_id: customerUuid,
            subject: ticketData.subject,
            message: ticketData.message,
            status: 'pending'
        })
        .select()
        .single()

    if (error) handleError(error, 'add ticket')

    return {
        id: data.ticket_id,
        uuid: data.id,
        customerId: ticketData.customerId,
        subject: data.subject,
        message: data.message,
        status: data.status,
        adminReply: null,
        createdAt: data.created_at?.split('T')[0]
    }
}

export const updateTicketInDb = async (ticketId, status, adminReply = null) => {
    if (!isSupabaseConfigured()) return

    const updates = {
        status,
        updated_at: new Date().toISOString()
    }
    if (adminReply) updates.admin_reply = adminReply

    const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('ticket_id', ticketId)

    if (error) handleError(error, 'update ticket')
}

// =====================================================
// USER AUTHENTICATION (Custom - not Supabase Auth)
// =====================================================

export const loginUser = async (identifier, password) => {
    if (!isSupabaseConfigured()) return null

    // Check if identifier is email or phone
    const isEmail = identifier.includes('@')

    // Try to find user by email or phone
    let query = supabase
        .from('users')
        .select('*')
        .eq('password', password)
        .eq('status', 'active')

    if (isEmail) {
        query = query.eq('email', identifier.toLowerCase())
    } else {
        query = query.eq('phone', identifier)
    }

    const { data, error } = await query.single()

    if (error || !data) {
        console.error('Login failed:', error?.message || 'Invalid credentials')
        return null
    }

    return {
        id: data.user_id,
        uuid: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        designation: data.designation,
        phone: data.phone,
        customerId: data.customer_id
    }
}

export const fetchUsers = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch users')

    return data?.map(u => ({
        id: u.user_id,
        uuid: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        designation: u.designation,
        phone: u.phone,
        status: u.status,
        customerId: u.customer_id,
        createdAt: u.created_at?.split('T')[0]
    })) || []
}

export const addUserToDb = async (userData) => {
    if (!isSupabaseConfigured()) return null

    const userId = generateId('USR')

    const { data, error } = await supabase
        .from('users')
        .insert({
            user_id: userId,
            email: userData.email.toLowerCase(),
            password: userData.password,
            name: userData.name,
            role: userData.role,
            designation: userData.designation || null,
            phone: userData.phone || null,
            status: 'active',
            customer_id: userData.customerId || null
        })
        .select()
        .single()

    if (error) handleError(error, 'add user')

    return {
        id: data.user_id,
        uuid: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        designation: data.designation,
        phone: data.phone,
        status: data.status,
        customerId: data.customer_id,
        createdAt: data.created_at?.split('T')[0]
    }
}

export const updateUserInDb = async (userId, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = {}
    if (updates.email) dbUpdates.email = updates.email.toLowerCase()
    if (updates.password) dbUpdates.password = updates.password
    if (updates.name) dbUpdates.name = updates.name
    if (updates.role) dbUpdates.role = updates.role
    if (updates.designation !== undefined) dbUpdates.designation = updates.designation
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone
    if (updates.status) dbUpdates.status = updates.status
    dbUpdates.updated_at = new Date().toISOString()

    const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('user_id', userId)

    if (error) handleError(error, 'update user')
}

export const deleteUserFromDb = async (userId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)

    if (error) handleError(error, 'delete user')
}

// =====================================================
// INITIALIZE ALL DATA
// =====================================================

export const initializeAllData = async () => {
    if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, using mock data')
        return null
    }

    try {
        const [customers, orders, transactions, bills, waterProduction, supportTickets, users] = await Promise.all([
            fetchCustomers(),
            fetchOrders(),
            fetchTransactions(),
            fetchBills(),
            fetchWaterProduction(),
            fetchSupportTickets(),
            fetchUsers()
        ])

        return {
            customers,
            orders,
            transactions,
            bills,
            waterProduction,
            supportTickets,
            users
        }
    } catch (error) {
        console.error('Failed to initialize data from Supabase:', error)
        return null
    }
}
