import { useState, useEffect } from 'react';
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
import { CalendarIcon, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ManualBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface BonusCampaign {
  id: string;
  name: string;
  bonus_type: string;
  amount_value: number;
  amount_type: string;
}

export const ManualBonusModal = ({ isOpen, onClose, onSave }: ManualBonusModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<BonusCampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('bonus_campaigns')
        .select('id, name, bonus_type, amount_value, amount_type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchingUsers(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, username')
        .or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Hata",
        description: "Kullanıcı arama sırasında bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedCampaign) {
      toast({
        title: "Hata",
        description: "Kullanıcı ve kampanya seçimi gereklidir.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const campaign = campaigns.find(c => c.id === selectedCampaign);
      if (!campaign) throw new Error('Kampanya bulunamadı');

      const bonusAmount = customAmount > 0 ? customAmount : campaign.amount_value;
      const expirationDate = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      const { error } = await supabase
        .from('user_bonuses')
        .insert([{
          user_id: selectedUser,
          campaign_id: selectedCampaign,
          bonus_amount: bonusAmount,
          status: 'active',
          expires_at: expirationDate.toISOString(),
          awarded_at: new Date().toISOString(),
          wagering_requirement: 0, // Manuel bonus için varsayılan
          wagering_completed: 0
        }]);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Manuel bonus başarıyla tanımlandı.",
      });

      // Reset form
      setSelectedUser('');
      setSelectedCampaign('');
      setCustomAmount(0);
      setExpiresAt(undefined);
      setNotes('');
      setSearchQuery('');
      setUsers([]);

      onSave();
      onClose();
    } catch (error) {
      console.error('Error assigning manual bonus:', error);
      toast({
        title: "Hata",
        description: "Manuel bonus tanımlanırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);
  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gaming">
            Manuel Bonus Tanımla
          </DialogTitle>
          <DialogDescription>
            Belirli bir kullanıcıya özel bonus tanımlayın.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kullanıcı Arama */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kullanıcı Seçimi</h3>
            
            <div className="space-y-2">
              <Label htmlFor="user_search">Kullanıcı Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="user_search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E-posta, ad, soyad veya kullanıcı adı ile ara..."
                  className="pl-10"
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
                )}
              </div>
            </div>

            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Kullanıcı Seçin</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kullanıcı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div>
                          <div className="font-medium">
                            {user.username || `${user.first_name} ${user.last_name}`.trim()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedUserData && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Seçilen Kullanıcı:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Ad:</strong> {selectedUserData.username || `${selectedUserData.first_name} ${selectedUserData.last_name}`.trim()}</p>
                  <p><strong>E-posta:</strong> {selectedUserData.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bonus Kampanyası Seçimi */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bonus Kampanyası</h3>
            
            <div className="space-y-2">
              <Label htmlFor="campaign">Kampanya Seçin</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Bonus kampanyası seçin" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.amount_type === 'percentage' 
                            ? `%${campaign.amount_value || 0}` 
                            : `₺${(campaign.amount_value || 0).toLocaleString('tr-TR')}`
                          }
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCampaignData && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Seçilen Kampanya:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Kampanya:</strong> {selectedCampaignData.name}</p>
                  <p><strong>Tür:</strong> {selectedCampaignData.bonus_type}</p>
                  <p><strong>Miktar:</strong> {
                    selectedCampaignData.amount_type === 'percentage' 
                      ? `%${selectedCampaignData.amount_value || 0}` 
                      : `₺${(selectedCampaignData.amount_value || 0).toLocaleString('tr-TR')}`
                  }</p>
                </div>
              </div>
            )}
          </div>

          {/* Özel Ayarlar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Özel Ayarlar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom_amount">Özel Miktar (₺)</Label>
                <Input
                  id="custom_amount"
                  type="number"
                  min="0"
                  value={customAmount || ''}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  placeholder="Kampanya miktarını kullan"
                />
                <p className="text-xs text-muted-foreground">
                  Boş bırakılırsa kampanya miktarı kullanılır
                </p>
              </div>

              <div className="space-y-2">
                <Label>Son Kullanma Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? (
                        format(expiresAt, "PPP", { locale: tr })
                      ) : (
                        <span>30 gün sonra</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bu bonus tanımlaması ile ilgili notlar..."
                rows={3}
              />
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedUser || !selectedCampaign}
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Bonus Tanımla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};