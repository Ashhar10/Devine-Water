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
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- RLS Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA - Default Admin User
-- Password: admin123 (in production, use proper hashing!)
-- =====================================================
INSERT INTO users (user_id, email, password, name, role, designation, status) VALUES
('USR-001', 'admin@devinewater.pk', 'admin123', 'System Admin', 'admin', 'Administrator', 'active');

-- Example staff users
INSERT INTO users (user_id, email, password, name, role, designation, status) VALUES
('USR-002', 'manager@devinewater.pk', 'manager123', 'Ali Hassan', 'staff', 'Manager', 'active'),
('USR-003', 'accountant@devinewater.pk', 'acc123', 'Sara Khan', 'staff', 'Accountant', 'active');

-- Verify
SELECT 'Users' as table_name, COUNT(*) as count FROM users;
