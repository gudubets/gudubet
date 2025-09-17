import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Upload,
  Camera,
  Palette,
  CreditCard,
  Building,
  Star,
  LayoutGrid,
  Gamepad2
} from 'lucide-react';
import { useSiteImages, SiteImage } from '@/hooks/useSiteImages';
import { SiteImageUpload } from '@/components/admin/SiteImageUpload';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'hero', label: 'Hero/Banner Resimleri', icon: Camera, color: 'bg-blue-500' },
  { value: 'games', label: 'Oyun Resimleri', icon: Gamepad2, color: 'bg-indigo-500' },
  { value: 'game_categories', label: 'Oyun Kategorileri', icon: LayoutGrid, color: 'bg-green-500' },
  { value: 'promotions', label: 'Promosyon Resimleri', icon: Star, color: 'bg-yellow-500' },
  { value: 'payment_methods', label: 'Ödeme Yöntemleri', icon: CreditCard, color: 'bg-purple-500' },
  { value: 'logos', label: 'Logo ve Markalar', icon: Building, color: 'bg-gray-500' },
  { value: 'banners', label: 'Reklam Bannerları', icon: Palette, color: 'bg-red-500' },
];

const AdminSiteImages = () => {
  const { images, loading, addImage, updateImage, deleteImage, loadImages } = useSiteImages();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [newImage, setNewImage] = useState({
    category: 'hero',
    name: '',
    description: '',
    image_url: '',
    alt_text: '',
    metadata: null,
    sort_order: 0
  });

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category) || 
           { label: category, icon: ImageIcon, color: 'bg-gray-500' };
  };

  const handleAddImage = async () => {
    if (!newImage.name || !newImage.image_url) {
      toast.error('Lütfen isim ve resim URL\'si girin');
      return;
    }

    try {
      await addImage(newImage);
      setIsAddDialogOpen(false);
      setNewImage({
        category: 'games',
        name: '',
        description: '',
        image_url: '',
        alt_text: '',
        metadata: null,
        sort_order: 0
      });
    } catch (error) {
      console.error('Add image error:', error);
    }
  };

  const handleEditImage = async () => {
    if (!editingImage) return;

    try {
      await updateImage(editingImage.id, {
        name: editingImage.name,
        description: editingImage.description,
        image_url: editingImage.image_url,
        alt_text: editingImage.alt_text,
        sort_order: editingImage.sort_order,
        is_active: editingImage.is_active
      });
      setIsEditDialogOpen(false);
      setEditingImage(null);
    } catch (error) {
      console.error('Edit image error:', error);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteImage(id);
      } catch (error) {
        console.error('Delete image error:', error);
      }
    }
  };

  const toggleImageStatus = async (image: SiteImage) => {
    try {
      await updateImage(image.id, { is_active: !image.is_active });
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Resim Yönetimi</h1>
            <p className="text-muted-foreground">
              Sitenin tüm resimlerini buradan yönetin
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Resim Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Resim Ekle</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select 
                      value={newImage.category} 
                      onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Resim Adı</Label>
                    <Input
                      id="name"
                      value={newImage.name}
                      onChange={(e) => setNewImage(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Hero Resmi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={newImage.description}
                    onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Bu resimin açıklaması..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Metin</Label>
                  <Input
                    id="alt_text"
                    value={newImage.alt_text}
                    onChange={(e) => setNewImage(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Erişilebilirlik için alt metin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sıralama</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={newImage.sort_order}
                    onChange={(e) => setNewImage(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <SiteImageUpload
                  currentImageUrl={newImage.image_url}
                  onImageUploaded={(url) => setNewImage(prev => ({ ...prev, image_url: url }))}
                  category={newImage.category}
                  name={newImage.name || 'new-image'}
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddImage}>
                    Resim Ekle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">Tümü ({images.length})</TabsTrigger>
            {CATEGORIES.map((category) => {
              const count = images.filter(img => img.category === category.value).length;
              return (
                <TabsTrigger key={category.value} value={category.value}>
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.label.split(' ')[0]} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => {
                  const categoryInfo = getCategoryInfo(image.category);
                  return (
                    <Card key={image.id} className="gaming-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <categoryInfo.icon className="w-3 h-3" />
                            {categoryInfo.label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleImageStatus(image)}
                            >
                              {image.is_active ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-red-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingImage(image);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{image.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {image.image_url && (
                            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                              <img
                                src={image.image_url}
                                alt={image.alt_text || image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {image.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {image.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Sıra: {image.sort_order}</span>
                            <span>{image.is_active ? 'Aktif' : 'Pasif'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resim Düzenle</DialogTitle>
            </DialogHeader>
            
            {editingImage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_name">Resim Adı</Label>
                    <Input
                      id="edit_name"
                      value={editingImage.name}
                      onChange={(e) => setEditingImage(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit_sort_order">Sıralama</Label>
                    <Input
                      id="edit_sort_order"
                      type="number"
                      value={editingImage.sort_order}
                      onChange={(e) => setEditingImage(prev => prev ? ({ ...prev, sort_order: parseInt(e.target.value) || 0 }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_description">Açıklama</Label>
                  <Textarea
                    id="edit_description"
                    value={editingImage.description || ''}
                    onChange={(e) => setEditingImage(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_alt_text">Alt Metin</Label>
                  <Input
                    id="edit_alt_text"
                    value={editingImage.alt_text || ''}
                    onChange={(e) => setEditingImage(prev => prev ? ({ ...prev, alt_text: e.target.value }) : null)}
                  />
                </div>

                <SiteImageUpload
                  currentImageUrl={editingImage.image_url}
                  onImageUploaded={(url) => setEditingImage(prev => prev ? ({ ...prev, image_url: url }) : null)}
                  category={editingImage.category}
                  name={editingImage.name}
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleEditImage}>
                    Güncelle
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminSiteImages;