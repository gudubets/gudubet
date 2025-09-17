import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Play, Eye, Star, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useCasinoGames } from '@/hooks/useCasinoGames';
import GameImageUpload from '@/components/admin/GameImageUpload';
import { toast } from 'sonner';

interface GameFormData {
  name: string;
  slug: string;
  category_id: string;
  provider_id: string;
  external_game_id: string;
  thumbnail_url: string;
  description: string;
  game_url: string;
  rtp_percentage: number;
  volatility: 'low' | 'medium' | 'high';
  min_bet: number;
  max_bet: number;
  has_demo: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  jackpot_amount?: number;
}

const AdminCasinoGames = () => {
  const { 
    games, 
    categories, 
    providers, 
    loading, 
    loadGames 
  } = useCasinoGames();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    slug: '',
    category_id: '',
    provider_id: '',
    external_game_id: '',
    thumbnail_url: '',
    description: '',
    game_url: '',
    rtp_percentage: 96.0,
    volatility: 'medium',
    min_bet: 0.10,
    max_bet: 100.00,
    has_demo: true,
    is_featured: false,
    is_new: false,
    is_popular: false,
    jackpot_amount: undefined
  });

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (game.provider && game.provider.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddGame = async () => {
    if (!formData.name || !formData.category_id || !formData.provider_id) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would call an API to add the game
      // For now, we'll just simulate it
      toast.success('Oyun başarıyla eklendi');
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Oyun eklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGame = async () => {
    if (!selectedGame || !formData.name) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would call an API to update the game
      toast.success('Oyun başarıyla güncellendi');
      setIsEditDialogOpen(false);
      setSelectedGame(null);
      resetForm();
    } catch (error) {
      toast.error('Oyun güncellenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm('Bu oyunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      // Here you would call an API to delete the game
      toast.success('Oyun başarıyla silindi');
    } catch (error) {
      toast.error('Oyun silinirken hata oluştu');
    }
  };

  const openEditDialog = (game: any) => {
    setSelectedGame(game);
    setFormData({
      name: game.name,
      slug: game.slug,
      category_id: game.category_id,
      provider_id: game.provider_id || '',
      external_game_id: game.external_game_id || '',
      thumbnail_url: game.thumbnail_url || '',
      description: game.description || '',
      game_url: game.game_url || '',
      rtp_percentage: game.rtp_percentage || 96.0,
      volatility: game.volatility || 'medium',
      min_bet: game.min_bet,
      max_bet: game.max_bet,
      has_demo: game.has_demo,
      is_featured: game.is_featured,
      is_new: game.is_new,
      is_popular: game.is_popular,
      jackpot_amount: game.jackpot_amount
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      provider_id: '',
      external_game_id: '',
      thumbnail_url: '',
      description: '',
      game_url: '',
      rtp_percentage: 96.0,
      volatility: 'medium',
      min_bet: 0.10,
      max_bet: 100.00,
      has_demo: true,
      is_featured: false,
      is_new: false,
      is_popular: false,
      jackpot_amount: undefined
    });
  };

  const getGameStats = () => {
    return {
      total: games.length,
      featured: games.filter(g => g.is_featured).length,
      popular: games.filter(g => g.is_popular).length,
      new: games.filter(g => g.is_new).length
    };
  };

  const stats = getGameStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Casino Oyun Yönetimi</h1>
          <p className="text-muted-foreground">Casino oyunlarını ekleyin, düzenleyin ve yönetin</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Oyun Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Oyun Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir casino oyunu eklemek için aşağıdaki bilgileri doldurun.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Oyun Adı</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Oyun adını girin"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="oyun-adi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="provider">Sağlayıcı</Label>
                  <Select value={formData.provider_id} onValueChange={(value) => setFormData(prev => ({ ...prev, provider_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sağlayıcı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Oyun açıklaması"
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <GameImageUpload
                  currentImageUrl={formData.thumbnail_url}
                  onImageUploaded={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                  gameSlug={formData.slug}
                  imageType="thumbnail"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rtp">RTP (%)</Label>
                  <Input
                    id="rtp"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.rtp_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, rtp_percentage: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="volatility">Volatilite</Label>
                  <Select value={formData.volatility} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, volatility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_bet">Min Bahis (₺)</Label>
                  <Input
                    id="min_bet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_bet}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_bet: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_bet">Max Bahis (₺)</Label>
                  <Input
                    id="max_bet"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_bet}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_bet: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_demo">Demo Modu Mevcut</Label>
                  <Switch
                    id="has_demo"
                    checked={formData.has_demo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_demo: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Öne Çıkan</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_new">Yeni Oyun</Label>
                  <Switch
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_popular">Popüler</Label>
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddGame} disabled={isSubmitting}>
                {isSubmitting ? 'Ekleniyor...' : 'Oyun Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Oyun</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öne Çıkan</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popüler</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.popular}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yeni</CardTitle>
            <Sparkles className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Oyun ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategori filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>Oyun Listesi</CardTitle>
          <CardDescription>
            {filteredGames.length} oyun listeleniyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Oyunlar yükleniyor...</p>
              </div>
            ) : filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      {game.thumbnail_url ? (
                        <img src={game.thumbnail_url} alt={game.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Play className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">{game.provider} • {game.category}</p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {game.is_featured && (
                          <Badge className="bg-yellow-500 text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Öne Çıkan
                          </Badge>
                        )}
                        {game.is_popular && (
                          <Badge className="bg-blue-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popüler
                          </Badge>
                        )}
                        {game.is_new && (
                          <Badge className="bg-green-500">Yeni</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(game)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteGame(game.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Hiç oyun bulunamadı.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Oyunu Düzenle</DialogTitle>
            <DialogDescription>
              {selectedGame?.name} oyununu düzenleyin.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form as add dialog but with update function */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Oyun Adı</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_slug">Slug</Label>
                <Input
                  id="edit_slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_category">Kategori</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_provider">Sağlayıcı</Label>
                <Select value={formData.provider_id} onValueChange={(value) => setFormData(prev => ({ ...prev, provider_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sağlayıcı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Açıklama</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Oyun açıklaması"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <GameImageUpload
                currentImageUrl={formData.thumbnail_url}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                gameSlug={formData.slug}
                gameId={selectedGame?.id}
                imageType="thumbnail"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_rtp">RTP (%)</Label>
                <Input
                  id="edit_rtp"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.rtp_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, rtp_percentage: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_volatility">Volatilite</Label>
                <Select value={formData.volatility} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, volatility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_has_demo">Demo Modu Mevcut</Label>
                <Switch
                  id="edit_has_demo"
                  checked={formData.has_demo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_demo: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_featured">Öne Çıkan</Label>
                <Switch
                  id="edit_is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_new">Yeni Oyun</Label>
                <Switch
                  id="edit_is_new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_popular">Popüler</Label>
                <Switch
                  id="edit_is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditGame} disabled={isSubmitting}>
              {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCasinoGames;