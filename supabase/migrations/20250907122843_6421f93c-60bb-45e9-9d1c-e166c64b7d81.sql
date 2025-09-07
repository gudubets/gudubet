-- Create a test notification to demonstrate the system
INSERT INTO public.notifications (
  title, 
  message, 
  type, 
  target_user_id, 
  admin_id, 
  is_active
) VALUES (
  'Hoş Geldiniz!', 
  'Bildirim sistemi başarıyla kuruldu. Artık admin panelden tüm kullanıcılara veya belirli kullanıcılara bildirim gönderebilirsiniz.', 
  'success', 
  null, -- Tüm kullanıcılar için
  'fe6ab42f-de75-42d5-b1cb-cbfd61fca157', -- Admin ID
  true
);