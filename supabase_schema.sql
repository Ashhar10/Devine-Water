-- =====================================================
-- DEVINE WATER - SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    usage_liters INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WATER PRODUCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS water_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    produced INTEGER NOT NULL,
    consumed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_water_production_date ON water_production(date);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- For now, we'll allow all operations (public access)
-- In production, you'd want to restrict based on auth
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for public read/write (development mode)
-- Replace these with proper auth-based policies for production
CREATE POLICY "Allow all for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for bills" ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for water_production" ON water_production FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert customers
INSERT INTO customers (customer_id, name, email, phone, address, status, total_orders, total_spent, created_at) VALUES
('CUS-001', 'Ahmed Hassan', 'ahmed@email.com', '+92 300 1234567', 'House 123, Block A, DHA Phase 5', 'active', 45, 67500, '2023-06-15'),
('CUS-002', 'Sara Mohamed', 'sara@email.com', '+92 321 9876543', 'Flat 45, Clifton Block 8', 'active', 32, 48000, '2023-08-22'),
('CUS-003', 'Omar Ali', 'omar@email.com', '+92 333 5555555', 'Office 12, Business Bay', 'active', 78, 156000, '2024-01-10'),
('CUS-004', 'Fatima Khan', 'fatima@email.com', '+92 345 7777777', 'House 78, PECHS Block 2', 'inactive', 12, 18000, '2023-11-05'),
('CUS-005', 'Yusuf Ibrahim', 'yusuf@email.com', '+92 312 8888888', 'Apartment 23, Gulshan Block 13', 'active', 21, 31500, '2024-03-20');

-- Insert orders
INSERT INTO orders (order_id, customer_id, customer_name, total, status, payment_status, created_at)
SELECT 'ORD-001', id, 'Ahmed Hassan', 2500, 'delivered', 'paid', '2024-12-23T10:30:00'::timestamp FROM customers WHERE customer_id = 'CUS-001'
UNION ALL
SELECT 'ORD-002', id, 'Sara Mohamed', 1500, 'pending', 'pending', '2024-12-23T08:15:00'::timestamp FROM customers WHERE customer_id = 'CUS-002'
UNION ALL
SELECT 'ORD-003', id, 'Omar Ali', 5000, 'processing', 'pending', '2024-12-22T14:00:00'::timestamp FROM customers WHERE customer_id = 'CUS-003'
UNION ALL
SELECT 'ORD-004', id, 'Ahmed Hassan', 1000, 'delivered', 'paid', '2024-12-21T11:00:00'::timestamp FROM customers WHERE customer_id = 'CUS-001'
UNION ALL
SELECT 'ORD-005', id, 'Yusuf Ibrahim', 2000, 'cancelled', 'refunded', '2024-12-20T09:00:00'::timestamp FROM customers WHERE customer_id = 'CUS-005';

-- Insert order items
INSERT INTO order_items (order_id, name, quantity, price)
SELECT o.id, 'Water Bottle 19L', 5, 500 FROM orders o WHERE o.order_id = 'ORD-001'
UNION ALL
SELECT o.id, 'Water Bottle 19L', 3, 500 FROM orders o WHERE o.order_id = 'ORD-002'
UNION ALL
SELECT o.id, 'Water Bottle 19L', 10, 500 FROM orders o WHERE o.order_id = 'ORD-003'
UNION ALL
SELECT o.id, 'Water Bottle 19L', 2, 500 FROM orders o WHERE o.order_id = 'ORD-004'
UNION ALL
SELECT o.id, 'Water Bottle 19L', 4, 500 FROM orders o WHERE o.order_id = 'ORD-005';

-- Insert transactions
INSERT INTO transactions (transaction_id, type, category, amount, description, created_at) VALUES
('TRX-001', 'income', 'Water Sales', 45000, 'December Week 1 Sales', '2024-12-07'),
('TRX-002', 'income', 'Water Sales', 52000, 'December Week 2 Sales', '2024-12-14'),
('TRX-003', 'income', 'Water Sales', 48000, 'December Week 3 Sales', '2024-12-21'),
('TRX-004', 'expense', 'Electricity', 12500, 'December Electricity Bill', '2024-12-15'),
('TRX-005', 'expense', 'Chemicals', 8200, 'Water Treatment Chemicals', '2024-12-10'),
('TRX-006', 'expense', 'Maintenance', 9800, 'Equipment Maintenance', '2024-12-18'),
('TRX-007', 'expense', 'Fuel', 5000, 'Delivery Vehicle Fuel', '2024-12-20');

-- Insert bills
INSERT INTO bills (bill_id, customer_id, month, amount, usage_liters, status, due_date, created_at)
SELECT 'INV-001', id, 'December 2024', 2850, 285, 'pending', '2024-12-31'::DATE, '2024-12-01'::TIMESTAMP FROM customers WHERE customer_id = 'CUS-001'
UNION ALL
SELECT 'INV-002', id, 'November 2024', 2500, 250, 'paid', '2024-11-30'::DATE, '2024-11-01'::TIMESTAMP FROM customers WHERE customer_id = 'CUS-001'
UNION ALL
SELECT 'INV-003', id, 'December 2024', 1800, 180, 'pending', '2024-12-31'::DATE, '2024-12-01'::TIMESTAMP FROM customers WHERE customer_id = 'CUS-002';

-- Insert water production data
INSERT INTO water_production (record_id, date, produced, consumed) VALUES
('WP-001', '2024-07-01', 42500, 40200),
('WP-002', '2024-08-01', 45200, 43100),
('WP-003', '2024-09-01', 48900, 46500),
('WP-004', '2024-10-01', 46300, 44100),
('WP-005', '2024-11-01', 52100, 49800),
('WP-006', '2024-12-01', 55800, 53200);

-- Insert support tickets
INSERT INTO support_tickets (ticket_id, customer_id, subject, message, status, admin_reply, created_at)
SELECT 'TKT-001', id, 'Water quality issue', 'The water seems cloudy today.', 'resolved', 'We have checked and resolved the issue. Please try again.', '2024-12-20' FROM customers WHERE customer_id = 'CUS-001'
UNION ALL
SELECT 'TKT-002', id, 'Delivery delayed', 'My order is delayed by 2 days.', 'in_progress', NULL, '2024-12-22' FROM customers WHERE customer_id = 'CUS-001';

-- =====================================================
-- VERIFY SEED DATA
-- =====================================================
SELECT 'Customers' as table_name, COUNT(*) as count FROM customers
UNION ALL SELECT 'Orders', COUNT(*) FROM orders
UNION ALL SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'Bills', COUNT(*) FROM bills
UNION ALL SELECT 'Water Production', COUNT(*) FROM water_production
UNION ALL SELECT 'Support Tickets', COUNT(*) FROM support_tickets;
