-- =====================================================
-- COMPREHENSIVE FIX: ALL MISSING TABLES, COLUMNS, AND RLS
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MISSING TABLES

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopkeeper Entries
CREATE TABLE IF NOT EXISTS shopkeeper_entries (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    entry_type TEXT NOT NULL,
    product_name TEXT,
    amount DECIMAL(12, 2) DEFAULT 0,
    liters DECIMAL(12, 2) DEFAULT 0,
    remarks TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Categories
CREATE TABLE IF NOT EXISTS income_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries (Real log of delivered items)
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    delivery_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    delivery_date DATE NOT NULL,
    bottles_delivered INTEGER DEFAULT 0,
    receive_bottles INTEGER DEFAULT 0,
    delivery_day TEXT,
    status TEXT DEFAULT 'delivered',
    notes TEXT,
    order_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MISSING COLUMNS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'assigned_products') THEN
        ALTER TABLE customers ADD COLUMN assigned_products JSONB DEFAULT '[]';
    END IF;
END $$;

-- 4. RPC FUNCTIONS

-- Function to update customer balance
CREATE OR REPLACE FUNCTION update_customer_balance(p_customer_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE customers
    SET current_balance = current_balance + p_amount
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopkeeper_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- 6. CREATE PERMISSIVE POLICIES
DO $$ 
BEGIN
    -- app_settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow all app_settings') THEN
        CREATE POLICY "Allow all app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- shopkeeper_entries
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shopkeeper_entries' AND policyname = 'Allow all shopkeeper_entries') THEN
        CREATE POLICY "Allow all shopkeeper_entries" ON shopkeeper_entries FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- income_categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'income_categories' AND policyname = 'Allow all income_categories') THEN
        CREATE POLICY "Allow all income_categories" ON income_categories FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- expense_categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expense_categories' AND policyname = 'Allow all expense_categories') THEN
        CREATE POLICY "Allow all expense_categories" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow all transactions') THEN
        CREATE POLICY "Allow all transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- deliveries
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliveries' AND policyname = 'Allow all deliveries') THEN
        CREATE POLICY "Allow all deliveries" ON deliveries FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 7. SEED INITIAL DATA
INSERT INTO app_settings (key, value) VALUES ('shopkeeper_water_rate', '10') ON CONFLICT (key) DO NOTHING;
