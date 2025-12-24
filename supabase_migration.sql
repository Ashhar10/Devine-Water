-- =====================================================
-- DEVINE WATER - DATABASE MIGRATION SCRIPT
-- Run this if you already have existing tables
-- =====================================================

-- Add permissions column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add nic column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'nic'
    ) THEN
        ALTER TABLE users ADD COLUMN nic TEXT;
    END IF;
END $$;

-- Add join_date column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'join_date'
    ) THEN
        ALTER TABLE users ADD COLUMN join_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Add assigned_areas column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'assigned_areas'
    ) THEN
        ALTER TABLE users ADD COLUMN assigned_areas UUID[] DEFAULT '{}';
    END IF;
END $$;

-- Add address column to users table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'address'
    ) THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
END $$;

-- Add latitude/longitude to customers (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE customers ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE customers ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Add enhanced customer fields
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'area_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN area_id UUID;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'delivery_days'
    ) THEN
        ALTER TABLE customers ADD COLUMN delivery_days TEXT[] DEFAULT '{}';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'required_bottles'
    ) THEN
        ALTER TABLE customers ADD COLUMN required_bottles INTEGER DEFAULT 1;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'security_deposit'
    ) THEN
        ALTER TABLE customers ADD COLUMN security_deposit DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'security_remarks'
    ) THEN
        ALTER TABLE customers ADD COLUMN security_remarks TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'opening_balance'
    ) THEN
        ALTER TABLE customers ADD COLUMN opening_balance DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'opening_bottles'
    ) THEN
        ALTER TABLE customers ADD COLUMN opening_bottles INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'current_balance'
    ) THEN
        ALTER TABLE customers ADD COLUMN current_balance DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'outstanding_bottles'
    ) THEN
        ALTER TABLE customers ADD COLUMN outstanding_bottles INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- CREATE NEW TABLES (IF NOT EXISTS)
-- =====================================================

-- AREAS TABLE
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bottle_type TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    purchase_price DECIMAL(10, 2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VENDORS TABLE
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

-- BANKS TABLE
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

-- INVESTMENTS TABLE
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

-- EXPENDITURES TABLE
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
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_id TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'filling', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    remarks TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id TEXT UNIQUE NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('customer', 'vendor')),
    reference_id UUID NOT NULL,
    order_id UUID,
    received_by UUID,
    payment_date DATE DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'cheque', 'bank_transfer', 'online')),
    bank_id UUID REFERENCES banks(id),
    cheque_no TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DELIVERY SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_date DATE NOT NULL,
    employee_id UUID,
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    customer_id UUID,
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
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all for development)
DROP POLICY IF EXISTS "Allow all areas" ON areas;
CREATE POLICY "Allow all areas" ON areas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all products" ON products;
CREATE POLICY "Allow all products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all vendors" ON vendors;
CREATE POLICY "Allow all vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all banks" ON banks;
CREATE POLICY "Allow all banks" ON banks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all investments" ON investments;
CREATE POLICY "Allow all investments" ON investments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all expenditures" ON expenditures;
CREATE POLICY "Allow all expenditures" ON expenditures FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all stock_movements" ON stock_movements;
CREATE POLICY "Allow all stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all payments" ON payments;
CREATE POLICY "Allow all payments" ON payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all delivery_schedules" ON delivery_schedules;
CREATE POLICY "Allow all delivery_schedules" ON delivery_schedules FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA (Insert only if not exists)
-- =====================================================

-- Seed Products
INSERT INTO products (product_id, name, bottle_type, price, purchase_price, current_stock)
SELECT 'PRD-001', '19 Liter Bottle', '19L', 100, 50, 500
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'PRD-001');

INSERT INTO products (product_id, name, bottle_type, price, purchase_price, current_stock)
SELECT 'PRD-002', '1.5 Liter Bottle', '1.5L', 50, 25, 1000
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'PRD-002');

INSERT INTO products (product_id, name, bottle_type, price, purchase_price, current_stock)
SELECT 'PRD-003', '500 ML Bottle', '500ML', 30, 15, 2000
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'PRD-003');

INSERT INTO products (product_id, name, bottle_type, price, purchase_price, current_stock)
SELECT 'PRD-004', '6 Liter Bottle', '6L', 80, 40, 300
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'PRD-004');

-- Seed Areas
INSERT INTO areas (area_id, name, description)
SELECT 'AREA-001', 'Gulshan', 'Gulshan-e-Iqbal Block 1-15'
WHERE NOT EXISTS (SELECT 1 FROM areas WHERE area_id = 'AREA-001');

INSERT INTO areas (area_id, name, description)
SELECT 'AREA-002', 'DHA', 'Defence Housing Authority Phase 1-8'
WHERE NOT EXISTS (SELECT 1 FROM areas WHERE area_id = 'AREA-002');

INSERT INTO areas (area_id, name, description)
SELECT 'AREA-003', 'Clifton', 'Clifton Block 1-9'
WHERE NOT EXISTS (SELECT 1 FROM areas WHERE area_id = 'AREA-003');

INSERT INTO areas (area_id, name, description)
SELECT 'AREA-004', 'Nazimabad', 'Nazimabad Block 1-5'
WHERE NOT EXISTS (SELECT 1 FROM areas WHERE area_id = 'AREA-004');

INSERT INTO areas (area_id, name, description)
SELECT 'AREA-005', 'North Karachi', 'North Karachi Sector 1-16'
WHERE NOT EXISTS (SELECT 1 FROM areas WHERE area_id = 'AREA-005');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_delivery_schedules_date ON delivery_schedules(schedule_date);

-- =====================================================
-- VERIFY SUCCESS
-- =====================================================
SELECT 'Migration completed successfully!' as message;

SELECT 
    'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'areas', COUNT(*) FROM areas
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'banks', COUNT(*) FROM banks;
