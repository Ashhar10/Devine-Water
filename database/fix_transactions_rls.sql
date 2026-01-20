-- Enable RLS on investments table
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on investments
CREATE POLICY "Allow all operations on investments"
ON investments
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable RLS on expenditures table
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on expenditures
CREATE POLICY "Allow all operations on expenditures"
ON expenditures
FOR ALL
USING (true)
WITH CHECK (true);
