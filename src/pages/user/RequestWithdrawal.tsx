import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WithdrawalRequest {
  amount: number;
  currency: string;
  bank_name: string;
  iban: string;
  account_holder: string;
}

interface UserWithdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  fee_amount: number;
  net_amount: number;
  created_at: string;
  admin_note?: string;
  rejection_reason?: string;
}

export default function RequestWithdrawal() {
  const [formData, setFormData] = useState<WithdrawalRequest>({
    amount: 0,
    currency: "TRY",
    bank_name: "",
    iban: "",
    account_holder: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get user balance
  const { data: userBalance } = useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kimlik doğrulaması yapılmadı");

      const { data, error } = await supabase
        .from("users")
        .select("balance, kyc_level, kyc_status")
        .eq("auth_user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Get user withdrawals
  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ["user-withdrawals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kimlik doğrulaması yapılmadı");

      // First get user profile
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserWithdrawal[];
    }
  });

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalRequest) => {
      const { data: response, error } = await supabase.functions.invoke("withdraw-request", {
        body: data
      });

      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      toast({
        title: "Başarılı",
        description: "Çekim talebiniz başarıyla oluşturuldu",
      });
      // Reset form
      setFormData({
        amount: 0,
        currency: "TRY",
        bank_name: "",
        iban: "",
        account_holder: ""
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Çekim talebi oluşturulamadı";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir miktar giriniz",
        variant: "destructive",
      });
      return;
    }

    if (!formData.iban.trim()) {
      toast({
        title: "Hata",
        description: "IBAN alanı zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (!formData.account_holder.trim()) {
      toast({
        title: "Hata",
        description: "Hesap sahibi adı zorunludur",
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Bekliyor", icon: Clock },
      approved: { variant: "default" as const, text: "Onaylandı", icon: CheckCircle },
      rejected: { variant: "destructive" as const, text: "Reddedildi", icon: XCircle },
      processing: { variant: "outline" as const, text: "İşleniyor", icon: Clock },
      completed: { variant: "default" as const, text: "Tamamlandı", icon: CheckCircle },
      failed: { variant: "destructive" as const, text: "Başarısız", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const calculateFee = (amount: number) => {
    return amount * 0.02; // 2% fee
  };

  const hasPendingWithdrawal = withdrawals.some(w => w.status === "pending");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Para Çekme</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Çekim Talebi Oluştur</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userBalance && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Mevcut Bakiye</p>
                <p className="text-2xl font-bold">₺{userBalance.balance?.toLocaleString("tr-TR") || 0}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Miktar</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="10"
                    max={userBalance?.balance || 0}
                    value={formData.amount || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select 
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bank_name">Banka Adı</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="Örn: Ziraat Bankası"
                />
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={32}
                />
              </div>

              <div>
                <Label htmlFor="account_holder">Hesap Sahibi</Label>
                <Input
                  id="account_holder"
                  value={formData.account_holder}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_holder: e.target.value }))}
                  placeholder="Ad Soyad"
                />
              </div>

              {formData.amount > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Çekim Miktarı:</span>
                    <span>₺{formData.amount.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>İşlem Ücreti (%2):</span>
                    <span>-₺{calculateFee(formData.amount).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Net Tutar:</span>
                    <span>₺{(formData.amount - calculateFee(formData.amount)).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={createWithdrawalMutation.isPending || hasPendingWithdrawal}
              >
                {createWithdrawalMutation.isPending ? "İşlem Yapılıyor..." : "Çekim Talebi Oluştur"}
              </Button>

              {hasPendingWithdrawal && (
                <p className="text-sm text-amber-600 text-center">
                  Bekleyen çekim talebiniz bulunmaktadır. Yeni talep oluşturamazsınız.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Çekim Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Yükleniyor...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Henüz çekim talebiniz bulunmamaktadır.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          ₺{withdrawal.amount.toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          ₺{withdrawal.net_amount.toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(withdrawal.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(withdrawal.created_at).toLocaleDateString("tr-TR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}