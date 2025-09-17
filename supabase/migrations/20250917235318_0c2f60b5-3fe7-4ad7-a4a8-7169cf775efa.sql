-- Add DELETE policy for admins on chat_rooms table
CREATE POLICY "Admins can delete chat rooms" ON public.chat_rooms
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);