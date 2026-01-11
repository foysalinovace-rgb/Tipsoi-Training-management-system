
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqkfkalypgtgeznaqrjd.supabase.co';
const supabaseAnonKey = 'sb_publishable_wrQDvAzTpcFirLFBd0VYiQ_1Op5q0y2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
