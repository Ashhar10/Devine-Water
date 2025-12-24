/**
 * Application Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the SQL schema from supabase_schema.sql in SQL Editor
 * 3. Copy your project URL and anon key to .env.local
 * 4. Set useMockData to false below
 */
export const config = {
    // Set to false when you have Supabase configured
    // When true, the app uses local mock data for demo purposes
    useMockData: false,

    // Supabase configuration
    // These are read from environment variables
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },

    // App settings
    app: {
        name: 'Devine Water',
        currency: 'Rs',
        pricePerLiter: 10,
    }
}

// Helper to check if Supabase is properly configured
export const isSupabaseReady = () => {
    return config.supabase.url &&
        config.supabase.anonKey &&
        !config.useMockData
}
