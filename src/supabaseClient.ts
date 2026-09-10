import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.navitronix.in'; // <-- Replace with your Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU4MzkzMDAwLCJleHAiOjE5MTYxNTk0MDB9.ndWaEbKzxiLYhEvyBugDAsPFRhMhgi26g0PBk1alXyU'; // <-- Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Isolated client that does not persist session or overwrite admin localStorage on signUp
export const supabaseAuthHelper = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
