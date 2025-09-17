-- Add DELETE policy for admins on chat_messages table
CREATE POLICY "Admins can delete chat messages" ON public.chat_messages
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);