-- =====================================================
-- DEVINE WATER - COMPLETE ERP DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AREAS TABLE (Delivery Zones)
-- =====================================================
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE (Water Bottles)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bottle_type TEXT NOT NULL,  -- '19L', '1.5L', '500ML', etc.
    price DECIMAL(10, 2) NOT NULL,
    purchase_price DECIMAL(10, 2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    -- Delivery Schedule
    delivery_days TEXT[] DEFAULT '{}',  -- ['Monday', 'Wednesday', 'Friday']
    required_bottles INTEGER DEFAULT 1,
    -- Financial
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    security_remarks TEXT,
    opening_balance DECIMAL(10, 2) DEFAULT 0,
    opening_bottles INTEGER DEFAULT 0,
    current_balance DECIMAL(10, 2) DEFAULT 0,
    outstanding_bottles INTEGER DEFAULT 0,
    -- Stats
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER PRICING (Customer-specific prices)
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    custom_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- =====================================================
-- VENDORS TABLE (Suppliers)
-- =====================================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    remarks TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BANKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id TEXT UNIQUE NOT NULL,
    bank_name TEXT NOT NULL,
    account_title TEXT NOT NULL,
    account_number TEXT NOT NULL,
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USERS TABLE (Enhanced with Permissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
    designation TEXT,
    phone TEXT,
    address TEXT,
    nic TEXT,  -- National ID Card
    join_date DATE DEFAULT CURRENT_DATE,
    assigned_areas UUID[] DEFAULT '{}',  -- Array of area IDs
    permissions JSONB DEFAULT '{}',  -- Feature permissions
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    invoice_no TEXT UNIQUE NOT NULL,
    bill_book_no TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    salesman_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    -- Totals
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    balance DECIMAL(10, 2) DEFAULT 0,
    -- Delivery
    delivery_date DATE,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    return_quantity INTEGER DEFAULT 0,  -- Empty bottles returned
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PURCHASE ORDERS TABLE (From Vendors)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id TEXT UNIQUE NOT NULL,
    invoice_no TEXT UNIQUE NOT NULL,
    bill_book_no TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    order_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PURCHASE ORDER ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id TEXT UNIQUE NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('customer', 'vendor')),
    reference_id UUID NOT NULL,  -- customer_id or vendor_id
    order_id UUID,  -- Optional link to order
    received_by UUID REFERENCES users(id),  -- Salesman who collected
    payment_date DATE DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'cheque', 'bank_transfer', 'online')),
    bank_id UUID REFERENCES banks(id),  -- For cheque payments
    cheque_no TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK MOVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_id TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'filling', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type TEXT,  -- 'order', 'purchase', 'manual'
    reference_id UUID,
    remarks TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVESTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id TEXT UNIQUE NOT NULL,
    investor_name TEXT NOT NULL,
    investment_detail TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    investment_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPENDITURES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenditures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expenditure_id TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'cheque', 'bank_transfer')),
    bank_id UUID REFERENCES banks(id),
    remarks TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BANK TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
    amount DECIMAL(12, 2) NOT NULL,
    previous_balance DECIMAL(12, 2) NOT NULL,
    new_balance DECIMAL(12, 2) NOT NULL,
    reference_type TEXT,  -- 'payment', 'expenditure', 'investment'
    reference_id UUID,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DELIVERY SCHEDULES (Daily Route Planning)
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_date DATE NOT NULL,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    required_bottles INTEGER DEFAULT 0,
    delivered_bottles INTEGER DEFAULT 0,
    returned_bottles INTEGER DEFAULT 0,
    amount DECIMAL(10, 2) DEFAULT 0,
    payment_collected DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'skipped')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPORT TICKETS (Existing - keep as is)
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_area ON customers(area_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesman ON orders(salesman_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_date ON delivery_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_employee ON delivery_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for now - refine for production)
CREATE POLICY "Allow all areas" ON areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all customer_pricing" ON customer_pricing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all banks" ON banks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all purchase_orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all purchase_order_items" ON purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all investments" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all expenditures" ON expenditures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all bank_transactions" ON bank_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delivery_schedules" ON delivery_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA - Products
-- =====================================================
INSERT INTO products (product_id, name, bottle_type, price, purchase_price, current_stock) VALUES
('PRD-001', '19 Liter Bottle', '19L', 100, 550, 500),
('PRD-002', '1.5 Liter Bottle', '1.5L', 50, 25, 1000),
('PRD-003', '500 ML Bottle', '500ML', 30, 15, 2000),
('PRD-004', '6 Liter Bottle', '6L', 80, 40, 300);

-- =====================================================
-- SEED DATA - Areas
-- =====================================================
INSERT INTO areas (area_id, name, description) VALUES
('AREA-001', 'Gulshan', 'Gulshan-e-Iqbal Block 1-15'),
('AREA-002', 'DHA', 'Defence Housing Authority Phase 1-8'),
('AREA-003', 'Clifton', 'Clifton Block 1-9'),
('AREA-004', 'Nazimabad', 'Nazimabad Block 1-5'),
('AREA-005', 'North Karachi', 'North Karachi Sector 1-16');

-- =====================================================
-- SEED DATA - Admin User
-- =====================================================
INSERT INTO users (user_id, email, password, name, role, designation, phone, permissions, status) VALUES
('USR-001', 'admin@devinewater.pk', 'admin123', 'System Admin', 'admin', 'Administrator', '+92 300 1111111', 
'{
    "products": {"add": true, "edit": true, "delete": true, "stock": true},
    "customers": {"add": true, "edit": true, "delete": true, "ledger": true, "payments": true},
    "orders": {"add": true, "edit": true, "delete": true},
    "vendors": {"add": true, "edit": true, "delete": true, "ledger": true},
    "employees": {"add": true, "edit": true, "delete": true, "areas": true},
    "finance": {"banks": true, "investments": true, "expenditures": true},
    "reports": {"sales": true, "delivery": true, "stock": true},
    "settings": {"users": true, "roles": true}
}'::jsonb, 'active');

-- =====================================================
-- VERIFY TABLES
-- =====================================================
SELECT 'areas' as table_name, COUNT(*) as count FROM areas
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'users', COUNT(*) FROM users;
