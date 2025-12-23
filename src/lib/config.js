/**
 * Application Configuration
 * Set useMockData to false when you have Supabase credentials
 */
export const config = {
    // Set to false when you have Supabase configured
    useMockData: true,

    // Supabase configuration
    // Get these from your Supabase project settings
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
