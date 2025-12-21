-- Devine Water Management System - Database Schema
-- PostgreSQL Schema for Supabase

-- ============================================
-- ROLES AND PERMISSIONS
-- ============================================

-- Users Table (Admin, Super Admin, User)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN', 'USER')),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'CUSTOMER',
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  cnic VARCHAR(20),
  connection_id VARCHAR(50) UNIQUE,
  connection_type VARCHAR(50) DEFAULT 'residential' CHECK (connection_type IN ('residential', 'commercial', 'industrial')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BILLING & PAYMENTS
-- ============================================

-- Billing Table
CREATE TABLE IF NOT EXISTS billing (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  billing_period VARCHAR(20) NOT NULL, -- e.g., '2024-12'
  consumption_liters DECIMAL(10, 2) DEFAULT 0,
  tariff_rate DECIMAL(10, 2) NOT NULL,
  base_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  billing_id INTEGER NOT NULL REFERENCES billing(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'mobile_wallet')),
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONSUMPTION TRACKING
-- ============================================

-- Consumption Table (Meter Readings)
CREATE TABLE IF NOT EXISTS consumption (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  previous_reading DECIMAL(10, 2) NOT NULL,
  current_reading DECIMAL(10, 2) NOT NULL,
  consumption_liters DECIMAL(10, 2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  recorded_by INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- COMPLAINTS
-- ============================================

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('billing', 'supply', 'quality', 'connection', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')),
  assigned_to INTEGER REFERENCES users(id),
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Can be NULL for system notifications
  customer_id INTEGER,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- ACTIVITY LOGS (ADMIN ONLY ACCESS)
-- ============================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  customer_id INTEGER REFERENCES customers(id),
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL, -- e.g., 'customer', 'billing', 'user'
  entity_id INTEGER,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SETTINGS
-- ============================================

-- System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_connection_id ON customers(connection_id);
CREATE INDEX idx_billing_customer_id ON billing(customer_id);
CREATE INDEX idx_billing_status ON billing(status);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_consumption_customer_id ON consumption(customer_id);
CREATE INDEX idx_complaints_customer_id ON complaints(customer_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumption_updated_at BEFORE UPDATE ON consumption
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
