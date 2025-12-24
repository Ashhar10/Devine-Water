import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Create Supabase client with auth disabled
// We only use the database, NOT Supabase Auth
export const supabase = config.supabase.url && config.supabase.anonKey
    ? createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    })
    : null

// Helper to check if Supabase is available
export const isSupabaseConfigured = () => {
    return supabase !== null && !config.useMockData
}
