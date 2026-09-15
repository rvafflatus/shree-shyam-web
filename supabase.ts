import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qnuyqbdiimqczmbelmux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXlxYmRpaW1xY3ptYmVsbXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODMwODIsImV4cCI6MjEwNTA1OTA4Mn0.T995UBpqf__qh3ATXUX6wQSJKs24LEJ60ENYk1J7kdo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)