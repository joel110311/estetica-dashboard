import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bkbvwysmtvcvvrwtvayh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYnZ3eXNtdHZjdnZyd3R2YXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NDI2ODIsImV4cCI6MjA3MDAxODY4Mn0.Yax0gQ6k2V69IQl6i9lCmR44NRvPryXvf10lAyZmZ5I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'X-Client-Info': 'estetica-dashboard'
        }
    }
})

// Test connection on load
console.log('Supabase client initialized')
supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error('Supabase connection test failed:', error)
    else console.log('Supabase connection OK, session:', data.session ? 'exists' : 'none')
}).catch(err => console.error('Supabase connection error:', err))
