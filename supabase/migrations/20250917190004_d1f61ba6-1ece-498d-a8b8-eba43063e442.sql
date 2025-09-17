-- Allow admins to update casino games
CREATE POLICY "Admins can update casino games"
ON public.casino_games
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);