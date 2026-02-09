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
        phone: c.phone,
        address: c.address || '',
        email: c.email || '',
        area: c.area_id || '',
        areaId: c.area_id || '',
        status: c.status,
        totalOrders: parseInt(c.total_orders) || 0,
        totalSpent: parseFloat(c.total_spent) || 0,
        currentBalance: parseFloat(c.current_balance) || 0,
        deliveryDays: c.delivery_days || [],
        assignedProducts: (Array.isArray(c.assigned_products)
            ? c.assigned_products
            : (typeof c.assigned_products === 'string'
                ? JSON.parse(c.assigned_products || '[]')
                : [])),
        requiredBottles: parseInt(c.required_bottles) || 1,
        securityDeposit: parseFloat(c.security_deposit) || 0,
        securityRemarks: c.security_remarks || '',
        openingBottles: parseInt(c.opening_bottles) || 0,
        openingBalance: parseFloat(c.opening_balance) || 0,
        createdAt: c.created_at
    })) || []
}

export const addCustomerToDb = async (customerData) => {
    if (!isSupabaseConfigured()) return null

    const customerId = generateId('CUS')

    console.log('Adding customer to DB:', customerData)

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
            delivery_days: customerData.deliveryDays || [],
            assigned_products: customerData.assignedProducts || [],
            area_id: customerData.areaId || null,
            required_bottles: customerData.requiredBottles || 1,
            security_deposit: customerData.securityDeposit || 0,
            security_remarks: customerData.securityRemarks || null,
            opening_bottles: customerData.openingBottles || 0,
            opening_balance: customerData.openingBalance || 0,
            current_balance: customerData.openingBalance || 0,
            total_orders: 0,
            total_spent: 0
        })
        .select()
        .single()

    if (error) {
        console.error('Database error adding customer:', error)
        handleError(error, 'add customer')
    }

    if (!data) {
        console.error('No data returned from customer insert')
        return null
    }

    console.log('Customer added successfully:', data)

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
        deliveryDays: data.delivery_days || [],
        assignedProducts: data.assigned_products || [],
        areaId: data.area_id,
        requiredBottles: data.required_bottles,
        securityDeposit: parseFloat(data.security_deposit),
        securityRemarks: data.security_remarks,
        openingBottles: data.opening_bottles,
        openingBalance: parseFloat(data.opening_balance),
        createdAt: data.created_at?.split('T')[0]
    }
}

export const updateCustomerInDb = async (customerUuid, updates) => {
    if (!isSupabaseConfigured()) return null

    const dbUpdates = {
        ...(updates.name && { name: updates.name }),
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.address !== undefined && { address: updates.address }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.totalOrders !== undefined && { total_orders: updates.totalOrders }),
        ...(updates.totalSpent !== undefined && { total_spent: updates.totalSpent }),
        ...(updates.currentBalance !== undefined && { current_balance: updates.currentBalance }),
        // FIXED: Always include these fields even if empty
        ...(updates.deliveryDays !== undefined && { delivery_days: updates.deliveryDays }),
        ...(updates.assignedProducts !== undefined && { assigned_products: updates.assignedProducts }),
        ...(updates.areaId !== undefined && { area_id: updates.areaId }),
        ...(updates.requiredBottles !== undefined && { required_bottles: updates.requiredBottles }),
        ...(updates.securityDeposit !== undefined && { security_deposit: updates.securityDeposit }),
        ...(updates.securityRemarks !== undefined && { security_remarks: updates.securityRemarks }),
        ...(updates.openingBottles !== undefined && { opening_bottles: updates.openingBottles }),
        ...(updates.openingBalance !== undefined && { opening_balance: updates.openingBalance }),
        updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', customerUuid)
        .select()
        .single()

    if (error) handleError(error, 'update customer')

    return data
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

    // Fetch orders with customer names and order items with product details
    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            order_id,
            customer_id,
            salesman_id,
            order_date,
            status,
            payment_status,
            created_at,
            customers (name),
            order_items (
                id,
                product_id,
                quantity,
                return_quantity,
                unit_price,
                total_price,
                products (id, name)
            )
        `)
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch orders')

    return data?.map(o => {
        // Calculate total from order items (use total_price if available, else calculate)
        const total = o.order_items?.reduce((sum, item) => {
            if (item.total_price) {
                return sum + parseFloat(item.total_price)
            }
            return sum + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0))
        }, 0) || 0

        // Use order_date if available, fallback to created_at date
        const orderDate = o.order_date || (o.created_at ? o.created_at.split('T')[0] : null)

        return {
            id: o.order_id,
            uuid: o.id,
            customerId: o.customer_id,
            customerName: o.customers?.name || 'Unknown',
            items: o.order_items?.map(item => ({
                productId: item.product_id,
                name: item.products?.name || 'Product',  // Get name from joined products table
                qty: item.quantity,
                returnQty: item.return_quantity || 0,
                price: parseFloat(item.unit_price)
            })) || [],
            total: total,  // Calculated from items
            status: o.status,
            paymentStatus: o.payment_status,
            orderDate: orderDate,  // Ensure we always have a date
            createdAt: o.created_at
        }
    }) || []
}

export const addOrderToDb = async (orderData, customerName, customerUuid) => {
    if (!isSupabaseConfigured()) return null

    const orderId = generateId('ORD')
    const invoiceNo = generateId('INV')  // Generate invoice number

    // Insert order (no total column - it's calculated from order_items)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            order_id: orderId,
            invoice_no: invoiceNo,  // Required field
            customer_id: customerUuid,
            order_date: orderData.orderDate || new Date().toISOString().split('T')[0],
            delivery_date: orderData.deliveryDate || null,
            delivery_notes: orderData.notes || null,
            discount: parseFloat(orderData.discount || 0),
            status: 'pending',
            payment_status: 'unpaid'  // Must be 'paid' or 'unpaid' per schema constraint
        })
        .select()
        .single()

    if (orderError) {
        handleError(orderError, 'add order')
        return null  // Return null to indicate failure
    }

    // Insert order items using order's UUID
    if (orderData.items?.length > 0) {
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,  // This is the UUID from database
            product_id: item.productId || null,
            quantity: item.quantity || item.qty,
            unit_price: item.price,
            total_price: item.price * (item.quantity || item.qty || 0)
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Failed to add order items:', itemsError)
            // Don't fail the whole order if just items fail
        }
    }

    return {
        id: order.order_id,
        uuid: order.id,
        customerId: orderData.customerId,  // Keep local ID for matching
        customerName: customerName,
        items: orderData.items,
        total: orderData.total,  // Use total from orderData (calculated in frontend)
        status: order.status,
        paymentStatus: order.payment_status,
        orderDate: order.order_date,
        createdAt: order.created_at
    }
}

export const updateOrderStatusInDb = async (orderUuid, status) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderUuid)  // Use UUID column 'id' not 'order_id'

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

export const updateOrderInDb = async (orderUuid, updates) => {
    if (!isSupabaseConfigured()) return



    const dbUpdates = {
        updated_at: new Date().toISOString()
    }

    if (updates.status) dbUpdates.status = updates.status
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus
    if (updates.orderDate) dbUpdates.order_date = updates.orderDate
    if (updates.deliveryDate) dbUpdates.delivery_date = updates.deliveryDate
    if (updates.notes) dbUpdates.delivery_notes = updates.notes
    if (updates.discount !== undefined) dbUpdates.discount = parseFloat(updates.discount)

    // Customer and salesman updates (using UUIDs)
    if (updates.customerUuid) dbUpdates.customer_id = updates.customerUuid
    if (updates.salesmanId) dbUpdates.salesman_id = updates.salesmanId

    // Update the order record
    const { error: orderError } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', orderUuid)

    if (orderError) {
        console.error('Order update error:', orderError)
        handleError(orderError, 'update order')
    } else {

    }

    // Handle order items update if provided
    if (updates.items && updates.items.length > 0) {


        // Delete existing order items
        const { error: deleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderUuid)

        if (deleteError) {
            console.error('Failed to delete old order items:', deleteError)
        } else {

        }

        // Insert new order items
        const orderItems = updates.items.map(item => ({
            order_id: orderUuid,  // UUID
            product_id: item.productId || null,
            quantity: item.qty,
            unit_price: item.price,
            total_price: item.price * item.qty
        }))


        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Failed to update order items:', itemsError)
        } else {

        }
    }
}

export const deleteOrderFromDb = async (orderUuid) => {
    if (!isSupabaseConfigured()) return

    // Items should cascade delete if foreign keys are set up correctly
    // Otherwise delete items first

    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderUuid)

    if (error) handleError(error, 'delete order')
}

// =====================================================
// TRANSACTIONS (optional - uses payments table if exists)
// =====================================================

export const fetchTransactions = async () => {
    if (!isSupabaseConfigured()) return []

    try {
        // Transactions are generated from payments - return empty for now
        // as we use payments table directly
        return []
    } catch (error) {
        console.log('Transactions table not available, using empty array')
        return []
    }
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
// BILLS (not implemented - use orders table instead)
// =====================================================

export const fetchBills = async () => {
    if (!isSupabaseConfigured()) return []
    // Bills functionality is handled through orders table
    // Return empty array as bills table doesn't exist
    return []
}

export const addBillToDb = async (billData, customerUuid) => {
    // Bills table doesn't exist - return null
    return null
}

export const updateBillInDb = async (billUuid, updates) => {
    // Bills table doesn't exist - return null
    return null
}

export const payBillInDb = async (billId) => {
    // Bills table doesn't exist
    return null
}

// =====================================================
// WATER PRODUCTION (not implemented in schema)
// =====================================================

export const fetchWaterProduction = async () => {
    // Water production table doesn't exist in our schema
    return []
}

export const addWaterProductionToDb = async (productionData) => {
    // Water production table doesn't exist
    return null
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

    try {
        // Check if identifier is email or phone
        const isEmail = identifier.includes('@')

        // Fetch user by email or phone (without password in query)
        let query = supabase
            .from('users')
            .select('*')
            .eq('status', 'active')

        if (isEmail) {
            query = query.eq('email', identifier.toLowerCase())
        } else {
            query = query.eq('phone', identifier)
        }

        const { data, error } = await query.single()

        if (error || !data) {
            console.error('Login failed:', error?.message || 'User not found')
            return null
        }

        // Verify password (client-side comparison for now)
        // TODO: Implement proper password hashing with bcrypt on backend
        if (data.password !== password) {
            console.error('Login failed: Invalid password')
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
            customerId: data.customer_id,
            permittedSections: data.permissions?.sections || []
        }
    } catch (err) {
        console.error('Login error:', err)
        return null
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
        permittedSections: u.permissions?.sections || [],
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
            customer_id: userData.customerId || null,
            permissions: { sections: userData.permittedSections || [] }
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
        permittedSections: data.permissions?.sections || [],
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
    if (updates.permittedSections !== undefined) {
        dbUpdates.permissions = { sections: updates.permittedSections }
    }
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
// PRODUCTS
// =====================================================

export const fetchProducts = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch products')

    return data?.map(p => ({
        id: p.product_id,
        uuid: p.id,
        name: p.name,
        bottleType: p.bottle_type,
        price: parseFloat(p.price),
        purchasePrice: parseFloat(p.purchase_price || 0),
        currentStock: p.current_stock,
        minStockAlert: p.min_stock_alert,
        status: p.status,
        designations: p.designations || [],
        visibility: p.visibility || 'public',
        createdAt: p.created_at?.split('T')[0]
    })) || []
}

export const addProductToDb = async (productData) => {
    if (!isSupabaseConfigured()) return null

    const productId = generateId('PRD')

    const { data, error } = await supabase
        .from('products')
        .insert({
            product_id: productId,
            name: productData.name,
            bottle_type: productData.bottleType,
            price: productData.price,
            purchase_price: productData.purchasePrice || 0,
            current_stock: productData.currentStock || 0,
            min_stock_alert: productData.minStockAlert || 10,
            status: 'active',
            designations: productData.designations || [],
            is_private: productData.isPrivate || false
        })
        .select()
        .single()

    if (error) handleError(error, 'add product')

    return {
        id: data.product_id,
        uuid: data.id,
        name: data.name,
        bottleType: data.bottle_type,
        price: parseFloat(data.price),
        purchasePrice: parseFloat(data.purchase_price),
        currentStock: data.current_stock,
        minStockAlert: data.min_stock_alert,
        status: data.status
    }
}

export const updateProductInDb = async (productId, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = { updated_at: new Date().toISOString() }
    if (updates.name) dbUpdates.name = updates.name
    if (updates.bottleType) dbUpdates.bottle_type = updates.bottleType
    if (updates.price !== undefined) dbUpdates.price = updates.price
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice
    if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock
    if (updates.minStockAlert !== undefined) dbUpdates.min_stock_alert = updates.minStockAlert
    if (updates.status) dbUpdates.status = updates.status
    if (updates.designations) dbUpdates.designations = updates.designations
    if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate

    const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', productId)

    if (error) handleError(error, 'update product')
}

export const deleteProductFromDb = async (productId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId) // Use UUID column 'id'

    if (error) handleError(error, 'delete product')
}

// =====================================================
// AREAS
// =====================================================

export const fetchAreas = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('priority', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })

    if (error) handleError(error, 'fetch areas')

    return data?.map(a => ({
        id: a.area_id,
        uuid: a.id,
        name: a.name,
        description: a.description,
        status: a.status,
        deliveryDays: a.delivery_days || [],
        priority: a.priority || 0
    })) || []
}

export const addAreaToDb = async (areaData) => {
    if (!isSupabaseConfigured()) return null

    const areaId = generateId('AREA')

    const { data, error } = await supabase
        .from('areas')
        .insert({
            area_id: areaId,
            name: areaData.name,
            description: areaData.description,
            status: 'active',
            delivery_days: areaData.deliveryDays || [],
            priority: areaData.priority || 0
        })
        .select()
        .single()

    if (error) handleError(error, 'add area')

    return {
        id: data.area_id,
        uuid: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        deliveryDays: data.delivery_days || [],
        priority: data.priority || 0
    }
}

export const updateAreaInDb = async (areaId, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.status) dbUpdates.status = updates.status
    if (updates.deliveryDays) dbUpdates.delivery_days = updates.deliveryDays
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority

    // We now prefer UUID updates
    // Try to treat areaId as UUID first, if it fails format check, could fallback but
    // since we control the input from store, we expect UUID or legacy ID.
    // However, areaId param might be "AREA-123".
    // If it's "AREA-123", we should query 'area_id'.
    // If it's "uuid-uuid...", we should query 'id'.

    let query = supabase.from('areas').update(dbUpdates)

    // Simple heuristic: UUIDs are usually longer than AREA-XXX and don't start with AREA
    if (areaId.toString().startsWith('AREA')) {
        query = query.eq('area_id', areaId)
    } else {
        query = query.eq('id', areaId)
    }

    const { error } = await query

    if (error) handleError(error, 'update area')
}

export const deleteAreaFromDb = async (areaId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('areas')
        .delete()
        .eq('area_id', areaId)

    if (error) handleError(error, 'delete area')
}

// =====================================================
// VENDORS
// =====================================================

export const fetchVendors = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) handleError(error, 'fetch vendors')

    return data?.map(v => ({
        id: v.vendor_id,
        uuid: v.id,
        name: v.name,
        contactPerson: v.contact_person,
        phone: v.phone,
        email: v.email,
        address: v.address,
        openingBalance: parseFloat(v.opening_balance || 0),
        currentBalance: parseFloat(v.current_balance || 0),
        totalSpent: parseFloat(v.total_spent || 0),
        remarks: v.remarks,
        status: v.status,
        createdAt: v.created_at?.split('T')[0]
    })) || []
}

export const addVendorToDb = async (vendorData) => {
    if (!isSupabaseConfigured()) return null

    const vendorId = generateId('VND')

    const { data, error } = await supabase
        .from('vendors')
        .insert({
            vendor_id: vendorId,
            name: vendorData.name,
            contact_person: vendorData.contactPerson || null,
            phone: vendorData.phone,
            email: vendorData.email || null,
            address: vendorData.address || null,
            opening_balance: vendorData.openingBalance || 0,
            current_balance: vendorData.openingBalance || 0,
            total_spent: 0,
            remarks: vendorData.remarks || null,
            status: 'active'
        })
        .select()
        .single()

    if (error) handleError(error, 'add vendor')

    return {
        id: data.vendor_id,
        uuid: data.id,
        name: data.name,
        phone: data.phone,
        status: data.status
    }
}

export const updateVendorInDb = async (vendorId, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = { updated_at: new Date().toISOString() }
    if (updates.name) dbUpdates.name = updates.name
    if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson
    if (updates.phone) dbUpdates.phone = updates.phone
    if (updates.email !== undefined) dbUpdates.email = updates.email
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.currentBalance !== undefined) dbUpdates.current_balance = updates.currentBalance
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent
    if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks
    if (updates.status) dbUpdates.status = updates.status

    const { error } = await supabase
        .from('vendors')
        .update(dbUpdates)
        .eq('vendor_id', vendorId)

    if (error) handleError(error, 'update vendor')
}

export const deleteVendorFromDb = async (vendorId) => {
    if (!isSupabaseConfigured()) return

    const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('vendor_id', vendorId)

    if (error) handleError(error, 'delete vendor')
}

export const addPurchaseToDb = async (purchaseData) => {
    if (!isSupabaseConfigured()) return null

    // Generate po_id if not provided
    const po_id = `PO-${Date.now()}`

    // Generate auto invoice number if not provided
    const autoInvoiceNo = purchaseData.invoiceNo || `V-INV-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`

    const dbData = {
        po_id,
        invoice_no: autoInvoiceNo,
        bill_book_no: purchaseData.billBookNo || null,
        vendor_id: purchaseData.vendorUuid,
        order_date: purchaseData.date || new Date().toISOString().split('T')[0],
        total_amount: parseFloat(purchaseData.amount) || 0,
        remarks: purchaseData.remarks || '',
        status: 'received',
        payment_status: 'unpaid'
    }

    const { data, error } = await supabase.from('purchase_orders').insert(dbData).select().single()
    if (error) {
        handleError(error, 'add purchase order')
        return null
    }

    // Update vendor balance via RPC if it exists, or handle manually
    // Since we don't have update_vendor_balance RPC yet (from earlier check), we'll do it via updateVendorInDb in store

    return data
}

export const fetchPurchaseOrders = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('order_date', { ascending: false })

    if (error) handleError(error, 'fetch purchase orders')

    return data?.map(p => ({
        id: p.po_id,
        uuid: p.id,
        invoiceNo: p.invoice_no,
        billBookNo: p.bill_book_no,
        vendorUuid: p.vendor_id,
        date: p.order_date,
        amount: parseFloat(p.total_amount || 0),
        remarks: p.remarks,
        status: p.status,
        paymentStatus: p.payment_status,
        createdAt: p.created_at
    })) || []
}

// =====================================================
// BANKS
// =====================================================

export const fetchBanks = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('bank_name', { ascending: true })

    if (error) handleError(error, 'fetch banks')

    return data?.map(b => ({
        id: b.bank_id,
        uuid: b.id,
        bankName: b.bank_name,
        accountTitle: b.account_title,
        accountNumber: b.account_number,
        openingBalance: parseFloat(b.opening_balance || 0),
        currentBalance: parseFloat(b.current_balance || 0),
        status: b.status,
        createdAt: b.created_at?.split('T')[0]
    })) || []
}

export const addBankToDb = async (bankData) => {
    if (!isSupabaseConfigured()) return null

    const bankId = generateId('BNK')

    const { data, error } = await supabase
        .from('banks')
        .insert({
            bank_id: bankId,
            bank_name: bankData.bankName,
            account_title: bankData.accountTitle,
            account_number: bankData.accountNumber,
            opening_balance: bankData.openingBalance || 0,
            current_balance: bankData.openingBalance || 0,
            status: 'active'
        })
        .select()
        .single()

    if (error) handleError(error, 'add bank')

    return {
        id: data.bank_id,
        uuid: data.id,
        bankName: data.bank_name,
        accountTitle: data.account_title,
        accountNumber: data.account_number,
        openingBalance: parseFloat(data.opening_balance),
        currentBalance: parseFloat(data.current_balance),
        status: data.status
    }
}

// =====================================================
// STOCK MOVEMENTS
// =====================================================

export const fetchStockMovements = async (filters = {}) => {
    if (!isSupabaseConfigured()) return []

    let query = supabase
        .from('stock_movements')
        .select(`
            *,
            product:products(name, bottle_type)
        `)
        .order('created_at', { ascending: false })

    if (filters.productId) {
        query = query.eq('product_id', filters.productId)
    }
    if (filters.movementType) {
        query = query.eq('movement_type', filters.movementType)
    }

    const { data, error } = await query.limit(100)

    if (error) handleError(error, 'fetch stock movements')

    return data?.map(m => ({
        id: m.movement_id,
        uuid: m.id,
        productId: m.product_id,
        productName: m.product?.name,
        bottleType: m.product?.bottle_type,
        movementType: m.movement_type,
        quantity: m.quantity,
        previousStock: m.previous_stock,
        newStock: m.new_stock,
        referenceType: m.reference_type,
        remarks: m.remarks,
        createdAt: m.created_at
    })) || []
}

export const addStockMovement = async (movementData) => {
    if (!isSupabaseConfigured()) return null

    const movementId = generateId('STK')

    // First get current product stock
    const { data: product, error: productError } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', movementData.productUuid)
        .single()

    if (productError) handleError(productError, 'get product stock')

    const previousStock = product.current_stock
    const newStock = movementData.movementType === 'in' || movementData.movementType === 'filling' || movementData.movementType === 'return'
        ? previousStock + movementData.quantity
        : previousStock - movementData.quantity

    // Add movement record
    const { data, error } = await supabase
        .from('stock_movements')
        .insert({
            movement_id: movementId,
            product_id: movementData.productUuid,
            movement_type: movementData.movementType,
            quantity: movementData.quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reference_type: movementData.referenceType || 'manual',
            reference_id: movementData.referenceId || null,
            remarks: movementData.remarks || null,
            created_by: movementData.createdBy || null
        })
        .select()
        .single()

    if (error) handleError(error, 'add stock movement')

    // Update product stock
    const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', movementData.productUuid)

    if (updateError) handleError(updateError, 'update product stock')

    return {
        id: data.movement_id,
        uuid: data.id,
        newStock
    }
}

// =====================================================
// PAYMENTS
// =====================================================

export const fetchPayments = async (filters = {}) => {
    if (!isSupabaseConfigured()) return []

    let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

    if (filters.paymentType) {
        query = query.eq('payment_type', filters.paymentType)
    }

    const { data, error } = await query.limit(100)

    if (error) handleError(error, 'fetch payments')

    return data?.map(p => ({
        id: p.payment_id,
        uuid: p.id,
        paymentType: p.payment_type,
        referenceId: p.reference_id,
        orderId: p.order_id,
        receivedBy: p.received_by,
        paymentDate: p.payment_date,
        amount: parseFloat(p.amount),
        paymentMode: p.payment_mode,
        bankId: p.bank_id,
        chequeNo: p.cheque_no,
        remarks: p.remarks,
        status: p.status,
        createdAt: p.created_at
    })) || []
}

export const addPaymentToDb = async (paymentData) => {
    if (!isSupabaseConfigured()) return null

    const paymentId = generateId('PAY')

    const { data, error } = await supabase
        .from('payments')
        .insert({
            payment_id: paymentId,
            payment_type: paymentData.paymentType,
            reference_id: paymentData.referenceId,
            order_id: paymentData.orderId || null,
            received_by: paymentData.receivedBy || null,
            payment_date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
            amount: paymentData.amount,
            payment_mode: paymentData.paymentMode,
            bank_id: paymentData.bankId || null,
            cheque_no: paymentData.chequeNo || null,
            remarks: paymentData.remarks || null,
            status: 'completed'
        })
        .select()
        .single()

    if (error) handleError(error, 'add payment')

    // Update customer/vendor balance
    if (paymentData.paymentType === 'customer') {
        await supabase.rpc('update_customer_balance', {
            p_customer_id: paymentData.referenceId,
            p_amount: -paymentData.amount  // Reduce balance
        })
    }

    return {
        id: data.payment_id,
        uuid: data.id,
        paymentType: data.payment_type,
        referenceId: data.reference_id,
        amount: parseFloat(data.amount),
        paymentMode: data.payment_mode,
        paymentDate: data.payment_date,
        bankId: data.bank_id,
        chequeNo: data.cheque_no,
        remarks: data.remarks,
        status: data.status,
        createdAt: data.created_at
    }
}

export const updatePaymentInDb = async (id, updates) => {
    if (!isSupabaseConfigured()) return null

    const { data, error } = await supabase
        .from('payments')
        .update({
            payment_type: updates.paymentType,
            reference_id: updates.referenceId,
            amount: updates.amount,
            payment_mode: updates.paymentMode,
            bank_id: updates.bankId || null,
            cheque_no: updates.chequeNo || null,
            remarks: updates.remarks || null,
            payment_date: updates.paymentDate
        })
        .eq('payment_id', id)
        .select()
        .single()

    if (error) handleError(error, 'update payment')

    return {
        id: data.payment_id,
        uuid: data.id,
        paymentType: data.payment_type,
        referenceId: data.reference_id,
        amount: parseFloat(data.amount),
        paymentMode: data.payment_mode,
        paymentDate: data.payment_date,
        bankId: data.bank_id,
        chequeNo: data.cheque_no,
        remarks: data.remarks,
        status: data.status,
        createdAt: data.created_at
    }
}

export const deletePaymentFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('payments').delete().eq('payment_id', id)
    if (error) handleError(error, 'delete payment')
    return true
}



// =====================================================
// INVESTMENTS
// =====================================================

export const fetchInvestments = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('investment_date', { ascending: false })

    if (error) handleError(error, 'fetch investments')

    return data?.map(i => ({
        id: i.investment_id,
        uuid: i.id,
        investorName: i.investor_name,
        investmentDetail: i.investment_detail,
        amount: parseFloat(i.amount),
        investmentDate: i.investment_date,
        remarks: i.remarks,
        createdAt: i.created_at
    })) || []
}

export const addInvestmentToDb = async (investmentData) => {
    if (!isSupabaseConfigured()) return null

    const investmentId = generateId('INV')

    const { data, error } = await supabase
        .from('investments')
        .insert({
            investment_id: investmentId,
            investor_name: investmentData.investorName,
            investment_detail: investmentData.investmentDetail || null,
            amount: investmentData.amount,
            investment_date: investmentData.investmentDate || new Date().toISOString().split('T')[0],
            remarks: investmentData.remarks || null
        })
        .select()
        .single()

    if (error) handleError(error, 'add investment')

    return {
        id: data.investment_id,
        uuid: data.id,
        investorName: data.investor_name,
        investmentDetail: data.investment_detail || '',
        amount: parseFloat(data.amount),
        investmentDate: data.investment_date,
        createdAt: data.created_at
    }
}

// =====================================================
// EXPENDITURES
// =====================================================

export const fetchExpenditures = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('expenditures')
        .select('*')
        .order('expense_date', { ascending: false })

    if (error) handleError(error, 'fetch expenditures')

    return data?.map(e => ({
        id: e.expenditure_id,
        uuid: e.id,
        category: e.category,
        description: e.description,
        amount: parseFloat(e.amount),
        expenseDate: e.expense_date,
        paymentMode: e.payment_mode,
        bankId: e.bank_id,
        remarks: e.remarks,
        createdAt: e.created_at
    })) || []
}

export const addExpenditureToDb = async (expenseData) => {
    if (!isSupabaseConfigured()) return null

    const expenditureId = generateId('EXP')

    const { data, error } = await supabase
        .from('expenditures')
        .insert({
            expenditure_id: expenditureId,
            category: expenseData.category,
            description: expenseData.description,
            amount: expenseData.amount,
            expense_date: expenseData.expenseDate || new Date().toISOString().split('T')[0],
            payment_mode: expenseData.paymentMode || 'cash',
            bank_id: expenseData.bankId || null,
            remarks: expenseData.remarks || null,
            created_by: expenseData.createdBy || null
        })
        .select()
        .single()

    if (error) handleError(error, 'add expenditure')

    return {
        id: data.expenditure_id,
        uuid: data.id,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        expenseDate: data.expense_date,
        paymentMode: data.payment_mode,
        createdAt: data.created_at
    }
}

// =====================================================
// DELIVERIES
// =====================================================

export const fetchDeliveries = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('deliveries')
        .select(`
            *,
            customers (customer_id, name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Fetch deliveries error:', error)
        return []
    }

    return data?.map(d => ({
        id: d.delivery_id,
        uuid: d.id,
        customerId: d.customers?.customer_id,
        customerName: d.customers?.name || 'Unknown',
        deliveryDate: d.delivery_date,
        bottlesDelivered: d.bottles_delivered,
        receiveBottles: d.receive_bottles || 0,
        notes: d.notes,
        deliveryDay: d.delivery_day,
        status: d.status || 'delivered',
        orderId: d.order_id || null,
        createdAt: d.created_at
    })) || []
}

export const addDeliveryToDb = async (deliveryData, customerUuid) => {
    if (!isSupabaseConfigured()) return null

    const deliveryId = generateId('DEL')

    const { data, error } = await supabase
        .from('deliveries')
        .insert({
            delivery_id: deliveryId,
            customer_id: customerUuid,
            delivery_date: deliveryData.deliveryDate,
            bottles_delivered: deliveryData.bottlesDelivered,
            receive_bottles: deliveryData.receiveBottles || 0,
            notes: deliveryData.notes || null,
            delivery_day: deliveryData.deliveryDay,
            status: deliveryData.status || 'delivered',
            order_id: deliveryData.orderId || null
        })
        .select()
        .single()

    if (error) {
        console.error('Add delivery error:', error)
        throw error
    }

    return {
        id: data.delivery_id,
        uuid: data.id,
        customerId: deliveryData.customerId,
        customerName: deliveryData.customerName,
        deliveryDate: data.delivery_date,
        bottlesDelivered: data.bottles_delivered,
        receiveBottles: data.receive_bottles,
        notes: data.notes,
        deliveryDay: data.delivery_day,
        status: data.status,
        createdAt: data.created_at
    }
}

export const updateDeliveryInDb = async (id, updates) => {
    if (!isSupabaseConfigured()) return

    const dbUpdates = { updated_at: new Date().toISOString() }
    if (updates.bottlesDelivered !== undefined) dbUpdates.bottles_delivered = updates.bottlesDelivered
    if (updates.receiveBottles !== undefined) dbUpdates.receive_bottles = updates.receiveBottles
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.status) dbUpdates.status = updates.status

    const { error } = await supabase
        .from('deliveries')
        .update(dbUpdates)
        .eq('delivery_id', id)

    if (error) {
        console.error('Update delivery error:', error)
        throw error
    }
}

export const deleteDeliveryFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('deliveries').delete().eq('delivery_id', id)
    if (error) {
        console.error('Delete delivery error:', error)
        throw error
    }
    return true
}

// =====================================================
// INITIALIZE ALL DATA
// =====================================================

// ===== Category Operations =====
export const addIncomeCategoryToDb = async (category) => {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('income_categories').insert(category).select().single()
    if (error) handleError(error, 'add income category')
    return data
}

export const fetchIncomeCategories = async () => {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase.from('income_categories').select('*')
    if (error) {
        console.error('Supabase fetch income categories error:', error)
        return []
    }
    return data
}

export const addExpenseCategoryToDb = async (category) => {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase.from('expense_categories').insert(category).select().single()
    if (error) handleError(error, 'add expense category')
    return data
}

export const fetchExpenseCategories = async () => {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase.from('expense_categories').select('*')
    if (error) {
        console.error('Supabase fetch expense categories error:', error)
        return []
    }
    return data
}

export const deleteIncomeCategoryFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('income_categories').delete().eq('id', id)
    if (error) handleError(error, 'delete income category')
    return true
}

export const deleteInvestmentFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('investments').delete().eq('investment_id', id)
    if (error) handleError(error, 'delete investment')
    return true
}

export const deleteExpenditureFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('expenditures').delete().eq('expenditure_id', id)
    if (error) handleError(error, 'delete expenditure')
    return true
}

export const deleteExpenseCategoryFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null
    const { error } = await supabase.from('expense_categories').delete().eq('id', id)
    if (error) handleError(error, 'delete expense category')
    return true
}

// ===== Finances Updates =====
export const updateInvestmentInDb = async (id, updates) => {
    if (!isSupabaseConfigured()) return null
    // Map frontend fields to DB columns if needed, or assume they match
    // investmentDetail -> investment_detail, investmentDate -> investment_date, investorName -> investor_name
    const dbUpdates = {}
    if (updates.investorName) dbUpdates.investor_name = updates.investorName
    if (updates.investmentDetail) dbUpdates.investment_detail = updates.investmentDetail
    if (updates.amount) dbUpdates.amount = updates.amount
    if (updates.investmentDate) dbUpdates.investment_date = updates.investmentDate

    const { data, error } = await supabase.from('investments').update(dbUpdates).eq('id', id).select().single()
    if (error) handleError(error, 'update investment')
    return data
}

export const updateExpenditureInDb = async (id, updates) => {
    if (!isSupabaseConfigured()) return null
    const dbUpdates = {}
    if (updates.category) dbUpdates.category = updates.category
    if (updates.description) dbUpdates.description = updates.description
    if (updates.amount) dbUpdates.amount = updates.amount
    if (updates.expenseDate) dbUpdates.expense_date = updates.expenseDate

    const { data, error } = await supabase.from('expenditures').update(dbUpdates).eq('id', id).select().single()
    if (error) handleError(error, 'update expenditure')
    return data
}

// =====================================================
// SHOPKEEPER ENTRIES
// =====================================================

export const fetchShopkeeperEntries = async () => {
    if (!isSupabaseConfigured()) return []

    const { data, error } = await supabase
        .from('shopkeeper_entries')
        .select('*')
        .order('entry_date', { ascending: false })

    if (error) handleError(error, 'fetch shopkeeper entries')

    return data?.map(entry => ({
        id: entry.id,
        uuid: entry.uuid,
        entryType: entry.entry_type,
        productName: entry.product_name,
        amount: parseFloat(entry.amount) || 0,
        liters: parseFloat(entry.liters) || 0,
        remarks: entry.remarks || '',
        entryDate: entry.entry_date,
        createdBy: entry.created_by,
        createdAt: entry.created_at
    })) || []
}

export const addShopkeeperEntryToDb = async (entryData) => {
    if (!isSupabaseConfigured()) return null

    const { data, error } = await supabase
        .from('shopkeeper_entries')
        .insert({
            entry_type: entryData.entryType,
            product_name: entryData.productName || null,
            amount: entryData.amount,
            liters: entryData.liters || null,
            remarks: entryData.remarks || null,
            entry_date: entryData.entryDate || new Date().toISOString().split('T')[0],
            created_by: entryData.createdBy || 'admin'
        })
        .select()
        .single()

    if (error) handleError(error, 'add shopkeeper entry')

    return {
        id: data.id,
        uuid: data.uuid,
        entryType: data.entry_type,
        productName: data.product_name,
        amount: parseFloat(data.amount) || 0,
        liters: parseFloat(data.liters) || 0,
        remarks: data.remarks || '',
        entryDate: data.entry_date,
        createdBy: data.created_by,
        createdAt: data.created_at
    }
}

export const updateShopkeeperEntryInDb = async (id, updates) => {
    if (!isSupabaseConfigured()) return null

    const dbUpdates = {}
    if (updates.entryType) dbUpdates.entry_type = updates.entryType
    if (updates.productName !== undefined) dbUpdates.product_name = updates.productName
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.liters !== undefined) dbUpdates.liters = updates.liters
    if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks
    if (updates.entryDate) dbUpdates.entry_date = updates.entryDate

    const { data, error } = await supabase
        .from('shopkeeper_entries')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

    if (error) handleError(error, 'update shopkeeper entry')

    return {
        id: data.id,
        uuid: data.uuid,
        entryType: data.entry_type,
        productName: data.product_name,
        amount: parseFloat(data.amount) || 0,
        liters: parseFloat(data.liters) || 0,
        remarks: data.remarks || '',
        entryDate: data.entry_date,
        createdBy: data.created_by,
        createdAt: data.created_at
    }
}

export const deleteShopkeeperEntryFromDb = async (id) => {
    if (!isSupabaseConfigured()) return null

    const { error } = await supabase
        .from('shopkeeper_entries')
        .delete()
        .eq('id', id)

    if (error) handleError(error, 'delete shopkeeper entry')
    return { success: true }
}

export const initializeAllData = async () => {
    if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, using mock data')
        return null
    }

    try {
        const [
            customers,
            orders,
            transactions,
            bills,
            waterProduction,
            supportTickets,
            users,
            products,
            areas,
            vendors,
            banks,
            payments,
            investments,
            expenditures,
            deliveries,
            incomeCategories,
            expenseCategories,
            purchaseOrders,
            shopkeeperEntries
        ] = await Promise.all([
            fetchCustomers(),
            fetchOrders(),
            fetchTransactions(),
            fetchBills(),
            fetchWaterProduction(),
            fetchSupportTickets(),
            fetchUsers(),
            fetchProducts(),
            fetchAreas(),
            fetchVendors(),
            fetchBanks(),
            fetchPayments(),
            fetchInvestments(),
            fetchExpenditures(),
            fetchDeliveries(),
            fetchIncomeCategories(),
            fetchExpenseCategories(),
            fetchPurchaseOrders(),
            fetchShopkeeperEntries()
        ])

        return {
            customers,
            orders,
            transactions,
            bills,
            waterProduction,
            supportTickets,
            users,
            products,
            areas,
            vendors,
            banks,
            payments,
            investments,
            expenditures,
            deliveries,
            incomeCategories,
            expenseCategories,
            purchaseOrders,
            shopkeeperEntries
        }
    } catch (error) {
        console.error('Failed to initialize data from Supabase:', error)
        return null
    }
}
