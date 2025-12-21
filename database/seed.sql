-- Seed Data for Devine Water Management System

-- ============================================
-- INSERT ADMIN USERS
-- ============================================

-- Password: admin123 (hashed with bcrypt, rounds=10)
-- Hash: $2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS

INSERT INTO users (name, email, password, role, phone, status) VALUES
('Super Admin', 'admin@devinewater.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'SUPER_ADMIN', '+923001234567', 'active'),
('Admin User', 'admin2@devinewater.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'ADMIN', '+923001234568', 'active'),
('Staff User', 'user@devinewater.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'USER', '+923001234569', 'active');

-- ============================================
-- INSERT DEMO CUSTOMERS
-- ============================================

-- Password: customer123 (same hash as above for demo)

INSERT INTO customers (name, email, password, role, phone, address, cnic, connection_id, connection_type, status) VALUES
('John Doe', 'customer@devinewater.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'CUSTOMER', '+923011234567', '123 Main Street, Karachi', '42101-1234567-1', 'CID-001', 'residential', 'active'),
('Jane Smith', 'jane@example.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'CUSTOMER', '+923011234568', '456 Park Avenue, Lahore', '42101-7654321-2', 'CID-002', 'commercial', 'active'),
('Ahmed Ali', 'ahmed@example.com', '$2a$10$jqCLYz4i7z1XxOCQF8y2MeJLqPvZ8sT1gH/rVHJpKqOk2i9pV7yZS', 'CUSTOMER', '+923011234569', '789 Business Road, Islamabad', '42101-9876543-3', 'CID-003', 'commercial', 'active');

-- ============================================
-- INSERT SAMPLE CONSUMPTION DATA
-- ============================================

INSERT INTO consumption (customer_id, reading_date, previous_reading, current_reading, recorded_by) VALUES
(1, '2024-12-01', 0, 1245.50, 1),
(2, '2024-12-01', 0, 2890.75, 1),
(3, '2024-12-01', 0, 4567.25, 1);

-- ============================================
-- INSERT SAMPLE BILLING DATA
-- ============================================

INSERT INTO billing (customer_id, billing_period, consumption_liters, tariff_rate, base_amount, tax_amount, total_amount, due_date, status) VALUES
(1, '2024-12', 1245.50, 2.00, 2491.00, 249.10, 2740.10, '2025-01-15', 'pending'),
(2, '2024-12', 2890.75, 2.50, 7226.88, 722.69, 7949.57, '2025-01-15', 'pending'),
(3, '2024-12', 4567.25, 3.00, 13701.75, 1370.18, 15071.93, '2025-01-15', 'paid');

-- =========================================
-- INSERT SAMPLE PAYMENT (for customer 3)
-- ============================================

INSERT INTO payments (billing_id, customer_id, amount, payment_method, transaction_id, status) VALUES
(3, 3, 15071.93, 'bank_transfer', 'TXN-2024-12-20-001', 'completed');

-- Update billing status for customer 3
UPDATE billing SET status = 'paid' WHERE id = 3;

-- ============================================
-- INSERT SAMPLE COMPLAINTS
-- ============================================

INSERT INTO complaints (customer_id, title, description, category, priority, status, assigned_to) VALUES
(1, 'Low Water Pressure', 'Water pressure has been very low for the past week', 'supply', 'high', 'open', 3),
(2, 'Incorrect Bill Amount', 'The bill amount seems higher than expected', 'billing', 'medium', 'in_progress', 3);

-- ============================================
-- INSERT SYSTEM SETTINGS
-- ============================================

INSERT INTO settings (setting_key, setting_value, description) VALUES
('default_tariff_rate', '2.00', 'Default tariff rate per liter for residential'),
('commercial_tariff_rate', '2.50', 'Tariff rate per liter for commercial'),
('industrial_tariff_rate', '3.00', 'Tariff rate per liter for industrial'),
('tax_percentage', '10', 'Tax percentage applied to bills'),
('payment_due_days', '15', 'Number of days before payment is due'),
('system_email', 'noreply@devinewater.com', 'System email for notifications'),
('company_name', 'Devine Water', 'Company name'),
('support_phone', '+92-300-1234567', 'Customer support phone number');
