ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS status text DEFAULT 'delivered';
