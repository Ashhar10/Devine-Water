-- Deliveries Table for Devine Water
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    bottles_delivered INTEGER NOT NULL DEFAULT 1,
    receive_bottles INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    delivery_day TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_id ON public.deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_day ON public.deliveries(delivery_day);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select any delivery
CREATE POLICY "Allow authenticated users to select deliveries"
ON public.deliveries
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert deliveries
CREATE POLICY "Allow authenticated users to insert deliveries"
ON public.deliveries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update deliveries
CREATE POLICY "Allow authenticated users to update deliveries"
ON public.deliveries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete deliveries
CREATE POLICY "Allow authenticated users to delete deliveries"
ON public.deliveries
FOR DELETE
TO authenticated
USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deliveries_updated_at
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;

COMMENT ON TABLE public.deliveries IS 'Stores delivery records for water bottle deliveries';
COMMENT ON COLUMN public.deliveries.delivery_id IS 'Human-readable delivery ID (DEL-xxx)';
COMMENT ON COLUMN public.deliveries.customer_id IS 'Reference to customer who received delivery';
COMMENT ON COLUMN public.deliveries.delivery_date IS 'Date when delivery was made';
COMMENT ON COLUMN public.deliveries.bottles_delivered IS 'Number of bottles delivered';
COMMENT ON COLUMN public.deliveries.receive_bottles IS 'Number of empty bottles received back';
COMMENT ON COLUMN public.deliveries.notes IS 'Additional notes about the delivery';
COMMENT ON COLUMN public.deliveries.delivery_day IS 'Day of week when delivery was made';
