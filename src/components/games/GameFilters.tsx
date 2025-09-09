import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Grid, List, Star, TrendingUp, Sparkles } from 'lucide-react';

interface FilterOptions {
  category: string;
  provider: string;
  volatility: string;
  sortBy: string;
  showFavorites: boolean;
  showNew: boolean;
  showPopular: boolean;
  showFeatured: boolean;
}

interface GameFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: string[];
  providers: string[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const GameFilters: React.FC<GameFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  categories,
  providers,
  activeFiltersCount,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleBooleanFilter = (key: keyof FilterOptions) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Oyun ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filters.showFeatured ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleBooleanFilter('showFeatured')}
          className="h-8"
        >
          <Star className="w-3 h-3 mr-1" />
          Öne Çıkan
        </Button>
        
        <Button
          variant={filters.showPopular ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleBooleanFilter('showPopular')}
          className="h-8"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Popüler
        </Button>
        
        <Button
          variant={filters.showNew ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleBooleanFilter('showNew')}
          className="h-8"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Yeni
        </Button>
        
        <Button
          variant={filters.showFavorites ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleBooleanFilter('showFavorites')}
          className="h-8"
        >
          Favoriler
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-red-500 hover:text-red-600"
          >
            <X className="w-3 h-3 mr-1" />
            Temizle ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sağlayıcı" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sağlayıcılar</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.volatility} onValueChange={(value) => handleFilterChange('volatility', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Volatilite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Volatiliteler</SelectItem>
            <SelectItem value="low">Düşük</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">İsme göre</SelectItem>
            <SelectItem value="popularity">Popülerlik</SelectItem>
            <SelectItem value="rtp">RTP</SelectItem>
            <SelectItem value="newest">En yeni</SelectItem>
            <SelectItem value="jackpot">Jackpot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Aktif filtreler:</span>
          
           {filters.category && filters.category !== 'all' && (
             <Badge variant="secondary" className="gap-1">
               Kategori: {filters.category}
               <X 
                 className="w-3 h-3 cursor-pointer hover:text-red-500" 
                 onClick={() => handleFilterChange('category', 'all')}
               />
             </Badge>
           )}
           
           {filters.provider && filters.provider !== 'all' && (
             <Badge variant="secondary" className="gap-1">
               Sağlayıcı: {filters.provider}
               <X 
                 className="w-3 h-3 cursor-pointer hover:text-red-500" 
                 onClick={() => handleFilterChange('provider', 'all')}
               />
             </Badge>
           )}
           
           {filters.volatility && filters.volatility !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Volatilite: {filters.volatility === 'low' ? 'Düşük' : filters.volatility === 'medium' ? 'Orta' : 'Yüksek'}
               <X 
                 className="w-3 h-3 cursor-pointer hover:text-red-500" 
                 onClick={() => handleFilterChange('volatility', 'all')}
               />
            </Badge>
          )}
          
          {filters.showFeatured && (
            <Badge variant="secondary" className="gap-1">
              Öne Çıkan
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => toggleBooleanFilter('showFeatured')}
              />
            </Badge>
          )}
          
          {filters.showPopular && (
            <Badge variant="secondary" className="gap-1">
              Popüler
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => toggleBooleanFilter('showPopular')}
              />
            </Badge>
          )}
          
          {filters.showNew && (
            <Badge variant="secondary" className="gap-1">
              Yeni
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => toggleBooleanFilter('showNew')}
              />
            </Badge>
          )}
          
          {filters.showFavorites && (
            <Badge variant="secondary" className="gap-1">
              Favoriler
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => toggleBooleanFilter('showFavorites')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};