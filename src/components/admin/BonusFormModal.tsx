import { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Upload, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BonusFormData {
  name: string;
  slug: string;
  bonus_type: string;
  bonus_percentage?: number;
  bonus_amount_fixed?: number;
  amount_type: string;
  amount_value: number;
  min_deposit: number;
  max_amount?: number;
  wagering_requirement: number;
  valid_days: number;
  applicable_games: string;
  description?: string;
  terms_conditions?: string;
  promotion_code?: string;
  start_date?: Date;
  end_date?: Date;
  is_active: boolean;
  auto_apply: boolean;
  usage_limit_per_user: number;
  total_max_uses?: number;
  image_url?: string;
}

interface BonusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bonus?: any;
  mode: 'create' | 'edit';
}

const BONUS_TYPES = [
  { value: 'welcome', label: 'Hoşgeldin Bonusu' },
  { value: 'deposit', label: 'Yatırım Bonusu' },
  { value: 'freebet', label: 'Freebet' },
  { value: 'freespin', label: 'Free Spin' },
  { value: 'cashback', label: 'Cashback (Kayıp Bonusu)' },
  { value: 'referral', label: 'Arkadaşını Getir' },
  { value: 'reload', label: 'Yeniden Yükleme Bonusu' },
  { value: 'vip', label: 'VIP Bonusu' }
];

const APPLICABLE_GAMES = [
  { value: 'all', label: 'Tüm Oyunlar' },
  { value: 'sports', label: 'Spor Bahisleri' },
  { value: 'casino', label: 'Casino Oyunları' },
  { value: 'slots', label: 'Slot Oyunları' },
  { value: 'live-casino', label: 'Canlı Casino' }
];

export const BonusFormModal = ({ isOpen, onClose, onSave, bonus, mode }: BonusFormModalProps) => {
  const [formData, setFormData] = useState<BonusFormData>({
    name: bonus?.name || '',
    slug: bonus?.slug || '',
    bonus_type: bonus?.bonus_type || 'welcome',
    bonus_percentage: bonus?.bonus_percentage || undefined,
    bonus_amount_fixed: bonus?.bonus_amount_fixed || undefined,
    amount_type: bonus?.amount_type || 'percentage',
    amount_value: bonus?.amount_value || 0,
    min_deposit: bonus?.min_deposit || 0,
    max_amount: bonus?.max_amount || undefined,
    wagering_requirement: bonus?.wagering_requirement || 1,
    valid_days: bonus?.valid_days || 30,
    applicable_games: bonus?.applicable_games || 'all',
    description: bonus?.description || '',
    terms_conditions: bonus?.terms_conditions || '',
    promotion_code: bonus?.promotion_code || '',
    start_date: bonus?.start_date ? new Date(bonus.start_date) : undefined,
    end_date: bonus?.end_date ? new Date(bonus.end_date) : undefined,
    is_active: bonus?.is_active ?? true,
    auto_apply: bonus?.auto_apply ?? false,
    usage_limit_per_user: bonus?.usage_limit_per_user || 1,
    total_max_uses: bonus?.total_max_uses || undefined,
    image_url: bonus?.image_url || ''
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateFormData = (field: keyof BonusFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `bonus_${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('bonus-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bonus-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Başarılı",
        description: "Resim başarıyla yüklendi.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        // Set amount_value based on type
        amount_value: formData.amount_type === 'percentage' 
          ? formData.bonus_percentage || 0
          : formData.bonus_amount_fixed || 0,
        // Add required fields for database
        trigger_type: 'manual' // Default trigger type
      };

      if (mode === 'create') {
        const { error } = await supabase
          .from('bonus_campaigns')
          .insert(submitData);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Bonus kampanyası oluşturuldu.",
        });
      } else {
        const { error } = await supabase
          .from('bonus_campaigns')
          .update(submitData)
          .eq('id', bonus.id);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Bonus kampanyası güncellendi.",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving bonus:', error);
      toast({
        title: "Hata",
        description: "Bonus kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gaming">
            {mode === 'create' ? 'Yeni Bonus Kampanyası' : 'Bonus Kampanyasını Düzenle'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Yeni bir bonus kampanyası oluşturun ve tüm detayları ayarlayın.'
              : 'Mevcut bonus kampanyasının detaylarını düzenleyin.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Bonus Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Hoşgeldin Bonusu %100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  placeholder="hosgeldin-bonusu-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus_type">Bonus Türü *</Label>
                <Select 
                  value={formData.bonus_type} 
                  onValueChange={(value) => updateFormData('bonus_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bonus türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {BONUS_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicable_games">Geçerli Oyunlar</Label>
                <Select 
                  value={formData.applicable_games} 
                  onValueChange={(value) => updateFormData('applicable_games', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Geçerli oyun alanı" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICABLE_GAMES.map(game => (
                      <SelectItem key={game.value} value={game.value}>
                        {game.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resim Yükleme */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bonus Görseli</h3>
              
              <div className="space-y-4">
                {formData.image_url && (
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="Bonus görseli" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => updateFormData('image_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Yükleniyor...' : 'Resim Yükle'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG, GIF, WEBP (Max: 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus Detayları */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bonus Detayları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount_type">Bonus Türü</Label>
                <Select 
                  value={formData.amount_type} 
                  onValueChange={(value) => updateFormData('amount_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yüzde (%)</SelectItem>
                    <SelectItem value="fixed">Sabit Miktar (₺)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.amount_type === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="bonus_percentage">Bonus Yüzdesi (%)</Label>
                  <Input
                    id="bonus_percentage"
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.bonus_percentage || ''}
                    onChange={(e) => updateFormData('bonus_percentage', Number(e.target.value))}
                    placeholder="100"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="bonus_amount_fixed">Bonus Miktarı (₺)</Label>
                  <Input
                    id="bonus_amount_fixed"
                    type="number"
                    min="0"
                    value={formData.bonus_amount_fixed || ''}
                    onChange={(e) => updateFormData('bonus_amount_fixed', Number(e.target.value))}
                    placeholder="1000"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="min_deposit">Minimum Yatırım (₺)</Label>
                <Input
                  id="min_deposit"
                  type="number"
                  min="0"
                  value={formData.min_deposit}
                  onChange={(e) => updateFormData('min_deposit', Number(e.target.value))}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_amount">Maksimum Bonus Limiti (₺)</Label>
                <Input
                  id="max_amount"
                  type="number"
                  min="0"
                  value={formData.max_amount || ''}
                  onChange={(e) => updateFormData('max_amount', Number(e.target.value))}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wagering_requirement">Çevrim Şartı (x)</Label>
                <Input
                  id="wagering_requirement"
                  type="number"
                  min="1"
                  value={formData.wagering_requirement}
                  onChange={(e) => updateFormData('wagering_requirement', Number(e.target.value))}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_days">Geçerlilik Süresi (Gün)</Label>
                <Input
                  id="valid_days"
                  type="number"
                  min="1"
                  value={formData.valid_days}
                  onChange={(e) => updateFormData('valid_days', Number(e.target.value))}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit_per_user">Kullanıcı Başına Limit</Label>
                <Input
                  id="usage_limit_per_user"
                  type="number"
                  min="1"
                  value={formData.usage_limit_per_user}
                  onChange={(e) => updateFormData('usage_limit_per_user', Number(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_max_uses">Toplam Kullanım Limiti</Label>
                <Input
                  id="total_max_uses"
                  type="number"
                  min="1"
                  value={formData.total_max_uses || ''}
                  onChange={(e) => updateFormData('total_max_uses', Number(e.target.value))}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Tarih ve Kod */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kampanya Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "PPP", { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => updateFormData('start_date', date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Bitiş Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "PPP", { locale: tr })
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => updateFormData('end_date', date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion_code">Promosyon Kodu</Label>
                <Input
                  id="promotion_code"
                  value={formData.promotion_code}
                  onChange={(e) => updateFormData('promotion_code', e.target.value)}
                  placeholder="WELCOME100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => updateFormData('is_active', checked)}
                />
                <Label htmlFor="is_active">Kampanya Aktif</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_apply"
                  checked={formData.auto_apply}
                  onCheckedChange={(checked) => updateFormData('auto_apply', checked)}
                />
                <Label htmlFor="auto_apply">Otomatik Uygula</Label>
              </div>
            </div>
          </div>

          {/* Açıklamalar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Açıklamalar</h3>
            
            <div className="space-y-2">
              <Label htmlFor="description">Bonus Açıklaması</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Bu bonus kampanyası ile ilgili kısa açıklama..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_conditions">Şartlar ve Koşullar</Label>
              <Textarea
                id="terms_conditions"
                value={formData.terms_conditions}
                onChange={(e) => updateFormData('terms_conditions', e.target.value)}
                placeholder="Bonus kullanım şartları ve koşulları..."
                rows={4}
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'Kampanya Oluştur' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};