-- Update Areas Table for Devine Water
-- Run this in Supabase SQL Editor

-- Add delivery_days column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'areas' AND column_name = 'delivery_days'
    ) THEN
        ALTER TABLE public.areas ADD COLUMN delivery_days TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add priority column if not exists (for route sequencing)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'areas' AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.areas ADD COLUMN priority INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update comments
COMMENT ON COLUMN public.areas.delivery_days IS 'Days of week when this area is served';
COMMENT ON COLUMN public.areas.priority IS 'Route priority sequence (lower numbers served first)';
