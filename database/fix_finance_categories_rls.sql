-- Enable RLS for Finance Categories
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (consistent with existing schema)
CREATE POLICY "Allow all income_categories" ON income_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all expense_categories" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
