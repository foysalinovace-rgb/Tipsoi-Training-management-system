
import { createClient } from '@supabase/supabase-js';

// These should ideally be environment variables, but keeping as constants for now
// Ensure these match exactly with your Supabase Project Settings > API
const supabaseUrl = 'https://bqkfkalypgtgeznaqrjd.supabase.co';
const supabaseAnonKey = 'sb_publishable_wrQDvAzTpcFirLFBd0VYiQ_1Op5q0y2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
