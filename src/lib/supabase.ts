import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://ziiwapwvyavfakeuhvpt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaXdhcHd2eWF2ZmFrZXVodnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjMyMjEsImV4cCI6MjA3MjY5OTIyMX0.afKXWDHzyQWiblfvYqOW0dhWgjobOjDabxluE2EdWZ0";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});