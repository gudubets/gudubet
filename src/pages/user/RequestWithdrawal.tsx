import { useCreateWithdrawal, useMyWithdrawals } from '../../hooks/useWithdrawals';
import { useState } from 'react';
import { toast } from 'sonner';
import type { WithdrawalMethod } from '../../lib/types.withdrawals';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function RequestWithdrawal() {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<WithdrawalMethod>('bank');
  // fields
  const [iban, setIban] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [paparaId, setPaparaId] = useState('');
  const [phone, setPhone] = useState('');
  const [asset, setAsset] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');
  const [tag, setTag] = useState('');

  const createM = useCreateWithdrawal();
  const list = useMyWithdrawals();
  const navigate = useNavigate();

    // Get user balance and profile info from profiles table
    const { data: userProfile } = useQuery({
      queryKey: ["user-profile"],
      queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Kimlik doğrulaması yapılmadı");

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("balance, bonus_balance, first_name, last_name")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return profileData;
      }
    });

  const submit = () => {
    // Validasyonlar
    if (amount <= 0) {
      toast.error('Çekim miktarı 0\'dan büyük olmalıdır');
      return;
    }

    // Bakiye kontrolü
    if (!userProfile?.balance || amount > userProfile.balance) {
      toast.error('Bakiyenizi kontrol edin. Yetersiz bakiye!');
      return;
    }

    // IBAN kontrolleri (bank method için)
    if (method === 'bank') {
      if (!iban || iban.length < 26) {
        toast.error('IBAN numaranızı kontrol edin. IBAN TR ile başlamalı ve toplam 26 karakter olmalıdır! (TR + 24 rakam)');
        return;
      }

      if (!iban.startsWith('TR')) {
        toast.error('IBAN TR ile başlamalıdır!');
        return;
      }

      if (!accountHolderName.trim()) {
        toast.error('Hesap sahibinin adını soyadını giriniz');
        return;
      }

      // İsim soyisim kontrolü
      const userFullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim().toLowerCase();
      const enteredName = accountHolderName.trim().toLowerCase();
      
      if (userFullName !== enteredName) {
        toast.error('Hesap sahibinin adı soyadı, kayıtlı bilgilerinizle eşleşmiyor! Kayıtlı adınız: ' + userFullName);
        return;
      }
    }

    // Papara kontrolleri
    if (method === 'papara') {
      if (!paparaId && !phone) {
        toast.error('Papara ID veya telefon numarası giriniz');
        return;
      }
    }

    // Crypto kontrolleri
    if (method === 'crypto') {
      if (!address.trim()) {
        toast.error('Cüzdan adresini giriniz');
        return;
      }
    }

    createM.mutate({ 
      amount, 
      method,
      payout_details: method === 'bank' ? {
        iban: iban,
        account_holder_name: accountHolderName
      } : method === 'papara' ? {
        papara_id: paparaId,
        phone: phone
      } : method === 'crypto' ? {
        asset: asset,
        network: network,
        address: address,
        tag: tag
      } : {},
      // Also send individual fields for backward compatibility
      iban, 
      papara_id: paparaId, 
      phone, 
      asset, 
      network, 
      address, 
      tag 
    }, {
      onSuccess: () => {
        toast.success('✅ Çekim talebiniz başarıyla gönderildi! İnceleme sürecine alınmıştır.');
        setAmount(0);
        setIban('');
        setAccountHolderName('');
        setPaparaId('');
        setPhone('');
        setAddress('');
        setTag('');
      },
      onError: (error: any) => {
        console.error('Withdrawal request error:', error);
        
        // Daha açıklayıcı hata mesajları
        let errorMessage = 'Çekim talebi gönderilemedi. ';
        
        if (error?.message) {
          if (error.message.includes('balance')) {
            errorMessage += 'Yetersiz bakiye!';
          } else if (error.message.includes('iban')) {
            errorMessage += 'IBAN formatını kontrol edin!';
          } else if (error.message.includes('verification') || error.message.includes('kyc')) {
            errorMessage += 'Kimlik doğrulaması gerekli!';
          } else if (error.message.includes('limit')) {
            errorMessage += 'Günlük/aylık limitinizi aştınız!';
          } else {
            errorMessage += error.message;
          }
        } else {
          errorMessage += 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
        }
        
        toast.error(errorMessage);
      }
    });
  };

  const calculateFee = (amount: number) => amount * 0.02;
  const calculateNet = (amount: number) => amount - calculateFee(amount);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Bekliyor", icon: Clock },
      approved: { variant: "default" as const, text: "Onaylandı", icon: CheckCircle },
      rejected: { variant: "destructive" as const, text: "Reddedildi", icon: XCircle },
      processing: { variant: "outline" as const, text: "İşleniyor", icon: Clock },
      completed: { variant: "default" as const, text: "Tamamlandı", icon: CheckCircle },
      paid: { variant: "default" as const, text: "Ödendi", icon: CheckCircle },
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

  const hasPendingWithdrawal = list.data?.some(w => w.status === "pending");

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
          <CardContent className="space-y-4">
            {userProfile && (
              <div className="p-4 bg-muted rounded-lg">
                 <p className="text-sm text-muted-foreground">Mevcut Bakiye</p>
                <p className="text-2xl font-bold">₺{userProfile.balance?.toLocaleString("tr-TR") || 0}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="amount">Miktar (TRY)</Label>
                <Input
                  id="amount"
                  type="number" 
                  min="10"
                  max={userProfile?.balance || 0}
                  value={amount || ''} 
                  onChange={(e)=>setAmount(parseFloat(e.target.value) || 0)} 
                  placeholder="0.00"
                />
            </div>
            
            <div>
              <Label htmlFor="method">Çekim Yöntemi</Label>
              <Select value={method} onValueChange={(value: WithdrawalMethod)=>setMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Banka Havalesi (IBAN)</SelectItem>
                  <SelectItem value="papara">Papara</SelectItem>
                  <SelectItem value="crypto">Kripto Para</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'bank' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iban">IBAN (TR + 24 rakam = 26 karakter)</Label>
                  <Input 
                    id="iban"
                    placeholder="TR000000000000000000000000" 
                    maxLength={26}
                    value={iban} 
                    onChange={(e)=>setIban(e.target.value.toUpperCase())} 
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolder">Hesap Sahibinin Adı Soyadı</Label>
                  <Input 
                    id="accountHolder"
                    placeholder="Ad Soyad" 
                    value={accountHolderName} 
                    onChange={(e)=>setAccountHolderName(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ Hesap oluşturulurken kullanılan isim soyisim ile paranın çekileceği hesap aynı olmalıdır.
                    <br />
                    📝 Kayıtlı adınız: <span className="font-medium text-primary">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </span>
                    <br />
                    🏦 IBAN formatı: TR + 24 rakam (toplam 26 karakter)
                  </p>
                </div>
              </div>
            )}

            {method === 'papara' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="papara_id">Papara ID</Label>
                  <Input 
                    id="papara_id"
                    placeholder="1234567890" 
                    value={paparaId} 
                    onChange={(e)=>setPaparaId(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-muted-foreground">veya Telefon (+90…)</Label>
                  <Input 
                    id="phone"
                    placeholder="+905xxxxxxxxx" 
                    value={phone} 
                    onChange={(e)=>setPhone(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {method === 'crypto' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="asset">Kripto Para</Label>
                  <Select value={asset} onValueChange={setAsset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="network">Ağ</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRC20">TRC20</SelectItem>
                      <SelectItem value="BEP20">BEP20</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                      <SelectItem value="MATIC">MATIC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Cüzdan Adresi</Label>
                  <Input 
                    id="address"
                    placeholder="0x… / T… / bc1…" 
                    value={address} 
                    onChange={(e)=>setAddress(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="tag" className="text-muted-foreground">Memo/Tag (opsiyonel)</Label>
                  <Input 
                    id="tag"
                    value={tag} 
                    onChange={(e)=>setTag(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {amount > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Çekim Miktarı:</span>
                  <span className="font-medium">₺{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>İşlem Ücreti (2%):</span>
                  <span>-₺{calculateFee(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Net Tutar:</span>
                  <span className="text-primary">₺{calculateNet(amount).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={submit} 
              disabled={createM.isPending || amount <= 0 || hasPendingWithdrawal}
              className="w-full"
            >
              {createM.isPending ? 'İşlem Yapılıyor...' : 'Çekim Talebi Gönder'}
            </Button>

            {hasPendingWithdrawal && (
              <p className="text-sm text-amber-600 text-center">
                Bekleyen çekim talebiniz bulunmaktadır. Yeni talep oluşturamazsınız.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Çekim Geçmişim</CardTitle>
          </CardHeader>
          <CardContent>
            {list.isLoading ? (
              <p>Yükleniyor...</p>
            ) : (list.data ?? []).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Henüz çekim talebiniz bulunmamaktadır.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Miktar</TableHead>
                      <TableHead>Yöntem</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(list.data ?? []).map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">₺{w.amount} {w.currency}</TableCell>
                        <TableCell className="capitalize">{w.method}</TableCell>
                        <TableCell>
                          {getStatusBadge(w.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(w.created_at).toLocaleDateString('tr-TR')}
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