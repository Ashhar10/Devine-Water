import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Create Supabase client (only used when useMockData is false)
export const supabase = config.supabase.url && config.supabase.anonKey
    ? createClient(config.supabase.url, config.supabase.anonKey)
    : null

// Helper to check if Supabase is available
export const isSupabaseConfigured = () => {
    return supabase !== null && !config.useMockData
}
