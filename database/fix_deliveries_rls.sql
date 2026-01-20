-- Enable RLS on deliveries table
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on deliveries
CREATE POLICY "Allow all operations on deliveries"
ON deliveries
FOR ALL
USING (true)
WITH CHECK (true);
