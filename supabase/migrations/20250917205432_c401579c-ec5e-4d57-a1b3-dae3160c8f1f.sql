-- Storage bucket'larını oluştur
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;