-- =====================================================
-- USERS TABLE - Run this AFTER the main schema
-- =====================================================

-- Create users table for custom authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
    designation TEXT,  -- e.g., Manager, Supervisor, Delivery Boy, Accountant
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,  -- Link to customer if role is 'customer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- RLS Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA - Default Users
-- =====================================================

-- Admin User
INSERT INTO users (user_id, email, password, name, role, designation, phone, status) VALUES
('USR-001', 'admin@devinewater.pk', 'admin123', 'System Admin', 'admin', 'Administrator', '+92 300 1111111', 'active');

-- Staff Users
INSERT INTO users (user_id, email, password, name, role, designation, phone, status) VALUES
('USR-002', 'manager@devinewater.pk', 'manager123', 'Ali Hassan', 'staff', 'Manager', '+92 300 2222222', 'active'),
('USR-003', 'accountant@devinewater.pk', 'acc123', 'Sara Khan', 'staff', 'Accountant', '+92 300 3333333', 'active');

-- Customer Users (linked to customers table)
INSERT INTO users (user_id, email, password, name, role, designation, phone, status, customer_id)
SELECT 'USR-004', 'ahmed@email.com', 'customer123', 'Ahmed Hassan', 'customer', 'Customer', '+92 300 1234567', 'active', id 
FROM customers WHERE customer_id = 'CUS-001';

INSERT INTO users (user_id, email, password, name, role, designation, phone, status, customer_id)
SELECT 'USR-005', 'sara@email.com', 'customer123', 'Sara Mohamed', 'customer', 'Customer', '+92 321 9876543', 'active', id 
FROM customers WHERE customer_id = 'CUS-002';

-- Verify
SELECT 'Users' as table_name, COUNT(*) as count FROM users;

-- =====================================================
-- LOGIN CREDENTIALS REFERENCE
-- =====================================================
-- 
-- ADMIN:
--   Email: admin@devinewater.pk
--   Phone: +92 300 1111111
--   Password: admin123
--
-- STAFF:
--   Email: manager@devinewater.pk OR accountant@devinewater.pk
--   Password: manager123 OR acc123
--
-- CUSTOMER:
--   Email: ahmed@email.com OR sara@email.com
--   Phone: +92 300 1234567 OR +92 321 9876543
--   Password: customer123
--
-- =====================================================
