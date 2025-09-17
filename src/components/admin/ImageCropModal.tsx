import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Crop as CropIcon, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { toast } from 'sonner';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  category: string;
}

const ASPECT_RATIOS = {
  'free': { value: undefined, label: 'Serbest' },
  '1:1': { value: 1, label: 'Kare (1:1)' },
  '16:9': { value: 16/9, label: 'Geniş (16:9)' },
  '4:3': { value: 4/3, label: 'Standart (4:3)' },
  '3:2': { value: 3/2, label: 'Fotoğraf (3:2)' },
  '21:9': { value: 21/9, label: 'Ultra Geniş (21:9)' }
};

const CATEGORY_RECOMMENDATIONS = {
  'hero': '16:9',
  'games': '1:1',
  'game_categories': '4:3',
  'promotions': '16:9',
  'payment_methods': '1:1',
  'logos': '1:1',
  'banners': '21:9'
};

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  category
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(
    ASPECT_RATIOS[CATEGORY_RECOMMENDATIONS[category as keyof typeof CATEGORY_RECOMMENDATIONS] || 'free'].value
  );
  const [imageSrc, setImageSrc] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || width / height,
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(crop);
  }, [aspect]);

  const getCroppedImg = useCallback(async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    ctx.scale(scale, scale);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob || !imageFile) {
          resolve(null);
          return;
        }
        
        const file = new File([blob], imageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, scale, rotate, flipHorizontal, flipVertical, imageFile]);

  const handleCropComplete = async () => {
    const croppedFile = await getCroppedImg();
    if (croppedFile) {
      onCropComplete(croppedFile);
      onClose();
      toast.success('Resim başarıyla kırpıldı');
    } else {
      toast.error('Resim kırpılırken hata oluştu');
    }
  };

  const handleAspectChange = (value: string) => {
    const aspectValue = ASPECT_RATIOS[value as keyof typeof ASPECT_RATIOS].value;
    setAspect(aspectValue);
    
    if (imgRef.current && aspectValue) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectValue,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(newCrop);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            Resmi Kırp ve Düzenle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
            <div className="flex flex-col gap-2">
              <Label>En-Boy Oranı</Label>
              <Select 
                value={Object.keys(ASPECT_RATIOS).find(key => ASPECT_RATIOS[key as keyof typeof ASPECT_RATIOS].value === aspect) || 'free'}
                onValueChange={handleAspectChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                      {key === CATEGORY_RECOMMENDATIONS[category as keyof typeof CATEGORY_RECOMMENDATIONS] && ' (Önerilen)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotate(prev => (prev + 90) % 360)}
                title="90° Sağa Çevir"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipHorizontal(prev => !prev)}
                title="Yatay Çevir"
              >
                <FlipHorizontal className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipVertical(prev => !prev)}
                title="Dikey Çevir"
              >
                <FlipVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Crop Area */}
          {imageSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                minWidth={50}
                minHeight={50}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Kırpılacak resim"
                  src={imageSrc}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                    maxWidth: '100%',
                    maxHeight: '60vh',
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          )}

          {/* Hidden canvas for cropping */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              onClick={handleCropComplete}
              disabled={!completedCrop}
            >
              Kırp ve Kullan
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
            <p><strong>Nasıl kullanılır:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Resim üzerinde kırpma alanını sürükleyerek ayarlayın</li>
              <li>Köşelerden boyutu değiştirin</li>
              <li>En-boy oranını sabitlemek için yukarıdan oran seçin</li>
              <li>Resmi döndürmek ve çevirmek için düğmeleri kullanın</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};