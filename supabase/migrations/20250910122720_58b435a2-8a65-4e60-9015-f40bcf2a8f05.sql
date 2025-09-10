-- Fix security issues - Enable RLS on tables that don't have policies

-- Check and enable RLS on tables that might be missing it
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Enable RLS on all public tables that don't have it
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE c.relrowsecurity = true
            AND t.schemaname = 'public'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
END $$;