import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageCropModal } from './ImageCropModal';

interface SiteImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  category: string;
  name: string;
}

export const SiteImageUpload: React.FC<SiteImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  category,
  name
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu maksimum 10MB olabilir');
      return;
    }

    // Show loading state immediately
    setUploading(true);
    
    // Show crop modal
    setSelectedFile(file);
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropModal(false); // Modal'ı önce kapat
    setSelectedFile(null);
    setUploading(true); // Loading'i başlat
    
    try {
      // Generate unique filename
      const fileExt = croppedFile.name.split('.').pop();
      const fileName = `${category}/${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage - use site-images bucket
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, croppedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        // If bucket doesn't exist, try to create it
        if (error.message.includes('Bucket not found')) {
          // Try uploading to game-images bucket as fallback
          const { data: gameData, error: gameError } = await supabase.storage
            .from('game-images')
            .upload(fileName, croppedFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (gameError) throw gameError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('game-images')
            .getPublicUrl(fileName);
          
          onImageUploaded(publicUrl);
          toast.success('Resim başarıyla yüklendi');
          return;
        }
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
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

  const handleRemoveImage = () => {
    onImageUploaded('');
    toast.success('Resim kaldırıldı');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Resim Yükle</Label>
      
      {currentImageUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={currentImageUrl}
                alt="Current image"
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
                    PNG, JPG, JPEG, WebP (max 10MB)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Resim Seç
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary/10 hover:bg-primary/20"
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Kırp ve Yükle
                  </Button>
                </div>
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
        <p>• Maksimum dosya boyutu: 10MB</p>
        <p>• Kategori: {category}</p>
        <p>• Resim seçtikten sonra kırpma ekranı açılacak</p>
      </div>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedFile(null);
          setUploading(false); // Loading'i de kapat
        }}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
        category={category}
      />
    </div>
  );
};

export default SiteImageUpload;