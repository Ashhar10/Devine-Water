-- =====================================================
-- FIX ORDERS DATE ISSUES
-- This migration fixes existing orders with NULL or missing order_date
-- =====================================================

-- Step 1: Update any orders where order_date is NULL
-- Use created_at as the fallback date
UPDATE orders 
SET order_date = created_at::date,
    updated_at = NOW()
WHERE order_date IS NULL;

-- Step 2: Verify the fix
SELECT 
    order_id,
    order_date,
    created_at::date as created_date,
    status,
    CASE 
        WHEN order_date IS NULL THEN 'MISSING DATE'
        ELSE 'OK'
    END as date_status
FROM orders
ORDER BY created_at DESC
LIMIT 20;

-- Step 3: Add a comment for tracking
COMMENT ON COLUMN orders.order_date IS 'Order date - defaults to created_at date if not specified';

-- Verification query
SELECT 
    'Total orders' as metric,
    COUNT(*) as count
FROM orders
UNION ALL
SELECT 
    'Orders with NULL order_date',
    COUNT(*)
FROM orders
WHERE order_date IS NULL
UNION ALL
SELECT 
    'Pending orders',
    COUNT(*)
FROM orders
WHERE status = 'pending'
UNION ALL
SELECT 
    'Delivered orders',
    COUNT(*)
FROM orders
WHERE status = 'delivered';
