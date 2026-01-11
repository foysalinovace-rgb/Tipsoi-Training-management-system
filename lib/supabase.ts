
import { createClient } from '@supabase/supabase-js';

// Supabase Connection Configuration
const supabaseUrl = 'https://bqkfkalypgtgeznaqrjd.supabase.co';
// WARNING: Ensure this key starts with 'eyJ' (standard Supabase anon key format)
const supabaseAnonKey = 'sb_publishable_wrQDvAzTpcFirLFBd0VYiQ_1Op5q0y2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
