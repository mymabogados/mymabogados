import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://indylgidkojwtaqylljb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZHlsZ2lka29qd3RhcXlsbGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjI5NzcsImV4cCI6MjA5MTkzODk3N30.w1wViFpTPo9KqLtxh4MOCkdB0jJ1fMC_ENVXxte6zj4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)