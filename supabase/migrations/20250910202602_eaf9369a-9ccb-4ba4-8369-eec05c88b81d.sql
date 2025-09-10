-- Fix security definer function search path
create or replace function public.current_user_id() 
returns uuid 
language sql 
stable 
security definer 
set search_path = public
as $$ select auth.uid() $$;