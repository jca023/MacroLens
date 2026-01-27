import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Auth and database features will not work.')
}

// Create Supabase client with explicit session persistence settings
// This ensures users stay logged in between app opens (important for PWAs)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Store session in localStorage for persistence across browser sessions
      persistSession: true,
      // Automatically refresh the token before it expires
      autoRefreshToken: true,
      // Detect session from URL (for OAuth redirects)
      detectSessionInUrl: true,
      // Use a specific storage key to avoid conflicts
      storageKey: 'macrolens-auth',
    },
  }
)
