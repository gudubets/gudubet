-- Update welcome title to use Gudubet instead of SportsBet Pro
UPDATE public.translations 
SET value = 'Gudubet''ya Hoş Geldiniz!' 
WHERE key = 'welcome_title' AND language_code = 'tr' AND namespace = 'auth';

UPDATE public.translations 
SET value = 'Welcome to Gudubet!' 
WHERE key = 'welcome_title' AND language_code = 'en' AND namespace = 'auth';