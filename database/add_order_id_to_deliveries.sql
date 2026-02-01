-- Add order_id column to deliveries table to link deliveries with orders
-- This enables proper synchronization between orders and deliveries

-- Add the order_id column
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add index for faster lookups when deleting orders
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);

-- Add comment to document the column
COMMENT ON COLUMN deliveries.order_id IS 'Links delivery to the order that created it (stores order_id like ORD-123)';
