// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Get the Supabase URL and Anon Key from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Explicitly set persistSession to true to ensure session is stored and retrieved on refresh
    persistSession: true,
  },
})