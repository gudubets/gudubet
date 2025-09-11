import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ziiwapwvyavfakeuhvpt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaXdhcHd2eWF2ZmFrZXVodnB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjMyMjEsImV4cCI6MjA3MjY5OTIyMX0.afKXWDHzyQWiblfvYqOW0dhWgjobOjDabxluE2EdWZ0"
);