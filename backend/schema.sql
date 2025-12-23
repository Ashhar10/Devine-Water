-- Water Management System - PostgreSQL Schema
-- Database: Supabase / PostgreSQL
-- Generated from Prisma Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer', 'supplier', 'shopkeeper')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'delivered', 'cancelled')),
    supplier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    notes TEXT
);

-- Indexes for orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);

-- ========================================
-- FINANCE INCOMING TABLE
-- ========================================
CREATE TABLE finance_incoming (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL CHECK (source IN ('customer_payment', 'shop_sale', 'monthly_billing')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shopkeeper_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'online', 'other'))
);

-- Indexes for finance_incoming
CREATE INDEX idx_finance_incoming_customer_id ON finance_incoming(customer_id);
CREATE INDEX idx_finance_incoming_shopkeeper_id ON finance_incoming(shopkeeper_id);
CREATE INDEX idx_finance_incoming_date ON finance_incoming(date);
CREATE INDEX idx_finance_incoming_source ON finance_incoming(source);

-- ========================================
-- FINANCE OUTGOING TABLE
-- ========================================
CREATE TABLE finance_outgoing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('electricity', 'chemicals', 'maintenance', 'water', 'fuel', 'other')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    receipt VARCHAR(255)
);

-- Indexes for finance_outgoing
CREATE INDEX idx_finance_outgoing_date ON finance_outgoing(date);
CREATE INDEX idx_finance_outgoing_category ON finance_outgoing(category);

-- ========================================
-- DELIVERIES TABLE
-- ========================================
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    route TEXT,
    completed_at TIMESTAMP
);

-- Indexes for deliveries
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_supplier_id ON deliveries(supplier_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);

-- ========================================
-- ROUTES TABLE
-- ========================================
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP NOT NULL,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed'))
);

-- Indexes for routes
CREATE INDEX idx_routes_supplier_id ON routes(supplier_id);
CREATE INDEX idx_routes_date ON routes(date);
CREATE INDEX idx_routes_status ON routes(status);

-- ========================================
-- ROUTE CUSTOMERS TABLE
-- ========================================
CREATE TABLE route_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    time VARCHAR(50)
);

-- Indexes for route_customers
CREATE INDEX idx_route_customers_route_id ON route_customers(route_id);
CREATE INDEX idx_route_customers_customer_id ON route_customers(customer_id);

-- ========================================
-- SHOP SALES TABLE
-- ========================================
CREATE TABLE shop_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopkeeper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cash_received DECIMAL(10, 2) NOT NULL CHECK (cash_received >= 0),
    change_returned DECIMAL(10, 2) DEFAULT 0 CHECK (change_returned >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for shop_sales
CREATE INDEX idx_shop_sales_shopkeeper_id ON shop_sales(shopkeeper_id);
CREATE INDEX idx_shop_sales_date ON shop_sales(date);

-- ========================================
-- ACTIVITY LOGS TABLE
-- ========================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50)
);

-- Indexes for activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Note: Run seed.js script instead for complete sample data
-- The seed script will create users with hashed passwords
-- and proper relationships

-- ========================================
-- USEFUL QUERIES
-- ========================================

-- View all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- View table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users';

-- View all foreign keys
-- SELECT
--     tc.table_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY';

-- ========================================
-- SCHEMA COMPLETE
-- ========================================
-- Total Tables: 9
-- - users
-- - orders
-- - finance_incoming
-- - finance_outgoing
-- - deliveries
-- - routes
-- - route_customers
-- - shop_sales
-- - activity_logs
