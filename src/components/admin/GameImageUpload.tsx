import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  gameId?: string;
  gameSlug?: string;
  imageType?: 'thumbnail' | 'background';
}

export const GameImageUpload: React.FC<GameImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  gameId,
  gameSlug,
  imageType = 'thumbnail'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu maksimum 5MB olabilir');
      return;
    }

    setUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${gameSlug || gameId || Date.now()}-${imageType}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('game-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // This will overwrite existing files with same name
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);

      onImageUploaded(publicUrl);
      toast.success('Resim başarıyla yüklendi');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Resim yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract filename from URL
      const urlParts = currentImageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('game-images')
        .remove([fileName]);

      if (error) throw error;

      onImageUploaded('');
      toast.success('Resim başarıyla silindi');
      
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Resim silinirken hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">
        {imageType === 'thumbnail' ? 'Oyun Resmi (Thumbnail)' : 'Arkaplan Resmi'}
      </Label>
      
      {currentImageUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={currentImageUrl}
                alt="Game preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Mevcut resim. Yeni resim yükleyerek değiştirebilirsiniz.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card
        className={`transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Resim yükleniyor...</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium">Resim yüklemek için tıklayın veya sürükleyip bırakın</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, JPEG, WebP (max 5MB)
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Resim Seç
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <div className="text-xs text-muted-foreground">
        <p>• Desteklenen formatlar: PNG, JPG, JPEG, WebP</p>
        <p>• Maksimum dosya boyutu: 5MB</p>
        <p>• Önerilen boyut: {imageType === 'thumbnail' ? '512x512px' : '1920x1080px'}</p>
      </div>
    </div>
  );
};

export default GameImageUpload;