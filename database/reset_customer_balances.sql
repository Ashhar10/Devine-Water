-- =====================================================
-- RESET CUSTOMER AND VENDOR BALANCES
-- =====================================================

-- This script resets all financial totals for all customers and vendors to zero.
-- WARNING: This action cannot be undone.

-- Reset Customers
UPDATE customers
SET 
    current_balance = 0,
    total_spent = 0,
    total_orders = 0;

-- Reset Vendors
UPDATE vendors
SET 
    current_balance = 0;

-- Optional: If you also want to reset opening balances
-- UPDATE customers SET opening_balance = 0;
-- UPDATE vendors SET opening_balance = 0;
