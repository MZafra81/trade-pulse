import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzvhsqjrotjnucsqchcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dmhzcWpyb3RqbnVjc3FjaGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYwOTIxOTQsImV4cCI6MTk3MTY2ODE5NH0.Lt6WkhCXPR1RLFYpydbWCW2GT-_exqW7E4Dp-Dmeu6o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
