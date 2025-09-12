import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Eye, AlertTriangle, Clock, History, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAdminActivity, ACTIVITY_TYPES } from "@/utils/adminActivityLogger";
import { useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/useWithdrawals";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  provider: string;
  account_info: any;
}

interface Admin {
  id: string;
  email: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  payment_method_id?: string;
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  status: string;
  provider_reference?: string;
  provider_response?: any;
  risk_score: number;
  risk_flags: string[];
  requires_kyc: boolean;
  requires_manual_review: boolean;
  reviewer_id?: string;
  reviewed_at?: string;
  admin_note?: string;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  processed_at?: string;
  completed_at?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  user?: User;
  payment_method?: PaymentMethod;
  reviewer?: Admin;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  description: string;
  target_type: string;
  target_id: string;
  metadata: any;
  created_at: string;
  admin?: Admin;
}

interface WithdrawalStats {
  total_pending: number;
  total_pending_amount: number;
  total_approved_today: number;
  total_approved_amount_today: number;
  high_risk_count: number;
}

export default function AdminWithdrawals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("withdrawals");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use the proper hooks for withdrawal actions
  const approveWithdrawalMutation = useApproveWithdrawal();
  const rejectWithdrawalMutation = useRejectWithdrawal();

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAccess(false);
          return;
        }

        const { data: admin } = await supabase
          .from("admins")
          .select("role_type")
          .eq("id", user.id)
          .single();

        setHasAccess(admin?.role_type === "super_admin" || admin?.role_type === "finance");
      } catch (error) {
        console.error("Access check error:", error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, []);

  // Fetch withdrawals with enhanced data
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals", searchTerm, statusFilter, methodFilter, riskFilter],
    queryFn: async () => {
      // First get withdrawals
      let query = supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (riskFilter === "high") {
        query = query.gte("risk_score", 70);
      } else if (riskFilter === "medium") {
        query = query.gte("risk_score", 30).lt("risk_score", 70);
      } else if (riskFilter === "low") {
        query = query.lt("risk_score", 30);
      }

      const { data: withdrawalData, error } = await query.limit(100);
      
      if (error) throw error;
      if (!withdrawalData) return [];

      // Get unique user IDs for batch user fetch
      const userIds = [...new Set(withdrawalData.map(w => w.user_id))];
      
      // Fetch user profile data
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, user_id")
        .in("id", userIds);

      // Combine data
      const enrichedWithdrawals = withdrawalData.map(withdrawal => {
        const user = userData?.find(u => u.id === withdrawal.user_id);
        return {
          ...withdrawal,
          user: user ? {
            ...user,
            email: `${user.first_name || 'user'}.${user.last_name || 'name'}@domain.com`,
            username: `${user.first_name || 'user'}${user.last_name || 'name'}`
          } : undefined
        };
      });

      // Apply search filter after enriching data
      let filteredWithdrawals = enrichedWithdrawals;
      if (searchTerm) {
        filteredWithdrawals = enrichedWithdrawals.filter(w => 
          w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredWithdrawals as Withdrawal[];
    },
    enabled: hasAccess === true,
  });

  // Fetch withdrawal statistics
  const { data: stats } = useQuery({
    queryKey: ["withdrawal-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("amount, status, risk_score, created_at");

      if (error) {
        console.error("Stats error:", error);
        return {
          total_pending: 0,
          total_pending_amount: 0,
          total_approved_today: 0,
          total_approved_amount_today: 0,
          high_risk_count: 0
        } as WithdrawalStats;
      }

      const today = new Date().toISOString().split('T')[0];
      const pending = data?.filter(w => w.status === "pending") || [];
      const approvedToday = data?.filter(w => 
        w.status === "approved" && 
        w.created_at.startsWith(today)
      ) || [];
      const highRisk = data?.filter(w => w.risk_score >= 70) || [];

      return {
        total_pending: pending.length,
        total_pending_amount: pending.reduce((sum, w) => sum + w.amount, 0),
        total_approved_today: approvedToday.length,
        total_approved_amount_today: approvedToday.reduce((sum, w) => sum + w.amount, 0),
        high_risk_count: highRisk.length
      } as WithdrawalStats;
    },
    enabled: hasAccess === true,
  });

  // Fetch audit logs for withdrawals
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["withdrawal-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activities")
        .select("*")
        .in("action_type", ["transaction_approved", "transaction_rejected", "withdrawal_reviewed"])
        .eq("target_type", "withdrawal")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get admin data for the logs
      const adminIds = [...new Set(data?.map(log => log.admin_id) || [])];
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, email")
        .in("id", adminIds);

      const enrichedLogs = data?.map(log => ({
        ...log,
        admin: adminData?.find(admin => admin.id === log.admin_id)
      })) || [];

      return enrichedLogs as AuditLog[];
    },
    enabled: hasAccess === true,
  });

  // Export withdrawals to CSV
  const exportWithdrawals = async () => {
    const csv = [
      "Tarih,Kullanıcı,Email,Miktar,Net Miktar,Ücret,Durum,Risk Skoru,Admin Notu",
      ...withdrawals.map(w => [
        new Date(w.created_at).toLocaleDateString("tr-TR"),
        `${w.user?.first_name || ""} ${w.user?.last_name || ""}`.trim(),
        w.user?.email || "",
        w.amount,
        w.net_amount || 0,
        w.fee_amount || 0,
        w.status,
        w.risk_score,
        w.admin_note || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `para-cekmeler-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Bekliyor" },
      approved: { variant: "default" as const, text: "Onaylandı" },
      rejected: { variant: "destructive" as const, text: "Reddedildi" },
      processing: { variant: "outline" as const, text: "İşleniyor" },
      completed: { variant: "default" as const, text: "Tamamlandı" },
      failed: { variant: "destructive" as const, text: "Başarısız" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 70) return <Badge variant="destructive">Yüksek Risk</Badge>;
    if (riskScore >= 30) return <Badge variant="secondary">Orta Risk</Badge>;
    return <Badge variant="default">Düşük Risk</Badge>;
  };

  const handleReview = (withdrawal: Withdrawal, action: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const confirmReview = () => {
    if (!selectedWithdrawal || !reviewAction) return;
    
    // Mandatory note validation
    if (!reviewNote.trim()) {
      toast({
        title: "Hata",
        description: "Not alanı zorunludur",
        variant: "destructive",
      });
      return;
    }

    if (reviewAction === "approve") {
      approveWithdrawalMutation.mutate({
        withdrawal_id: selectedWithdrawal.id,
        note: reviewNote.trim()
      }, {
        onSuccess: () => {
          toast({
            title: "Başarılı",
            description: "Para çekme talebi onaylandı ve bakiye düşürüldü",
          });
          setIsReviewDialogOpen(false);
          setReviewNote("");
          setSelectedWithdrawal(null);
          setReviewAction(null);
        },
        onError: (error: any) => {
          toast({
            title: "Hata",
            description: error.message || "Para çekme onaylanırken hata oluştu",
            variant: "destructive",
          });
        }
      });
    } else {
      rejectWithdrawalMutation.mutate({
        withdrawal_id: selectedWithdrawal.id,
        note: reviewNote.trim()
      }, {
        onSuccess: () => {
          toast({
            title: "Başarılı",
            description: "Para çekme talebi reddedildi",
          });
          setIsReviewDialogOpen(false);
          setReviewNote("");
          setSelectedWithdrawal(null);
          setReviewAction(null);
        },
        onError: (error: any) => {
          toast({
            title: "Hata",
            description: error.message || "Para çekme reddedilirken hata oluştu",
            variant: "destructive",
          });
        }
      });
    }
  };

  if (hasAccess === null) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  if (hasAccess === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Erişim reddedildi. Bu sayfayı görüntülemek için admin yetkilerine ihtiyacınız var.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Para Çekme Yönetimi</h1>
        <div className="flex space-x-2">
          <Button onClick={exportWithdrawals} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₺{(stats?.total_pending_amount || 0).toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Onaylanan</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_approved_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₺{(stats?.total_approved_amount_today || 0).toLocaleString("tr-TR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yüksek Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.high_risk_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">İnceleme gerekiyor</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="withdrawals">Para Çekme Talepleri</TabsTrigger>
          <TabsTrigger value="audit">Denetim Günlüğü</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Email veya kullanıcı adı ara"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">Bekleyen</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                    <SelectItem value="processing">İşleniyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Yöntemler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Yöntemler</SelectItem>
                    <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                    <SelectItem value="e_wallet">E-Cüzdan</SelectItem>
                    <SelectItem value="crypto">Kripto Para</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Risk Seviyeleri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Risk Seviyeleri</SelectItem>
                    <SelectItem value="low">Düşük Risk</SelectItem>
                    <SelectItem value="medium">Orta Risk</SelectItem>
                    <SelectItem value="high">Yüksek Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Para Çekme Talepleri ({withdrawals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {withdrawal.user?.first_name} {withdrawal.user?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {withdrawal.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            ₺{withdrawal.amount.toLocaleString("tr-TR")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Net: ₺{withdrawal.net_amount?.toLocaleString("tr-TR")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>{getRiskBadge(withdrawal.risk_score)}</TableCell>
                      <TableCell>
                        <Badge variant={withdrawal.requires_kyc ? "secondary" : "default"}>
                          {withdrawal.requires_kyc ? "Gerekli" : "Gerekli Değil"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(withdrawal.created_at).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Para Çekme Detayları</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Miktar</label>
                                    <p>₺{withdrawal.amount.toLocaleString("tr-TR")}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Net Miktar</label>
                                    <p>₺{withdrawal.net_amount?.toLocaleString("tr-TR")}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Ücret</label>
                                    <p>₺{withdrawal.fee_amount?.toLocaleString("tr-TR")}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Risk Skoru</label>
                                    <p>{withdrawal.risk_score}/100</p>
                                  </div>
                                </div>

                                {withdrawal.admin_note && (
                                  <div>
                                    <label className="text-sm font-medium">Admin Notu</label>
                                    <p className="mt-1">{withdrawal.admin_note}</p>
                                  </div>
                                )}

                                {withdrawal.risk_flags && withdrawal.risk_flags.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">Risk Bayrakları</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {withdrawal.risk_flags.map((flag, index) => (
                                        <Badge key={index} variant="destructive" className="text-xs">
                                          {flag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReview(withdrawal, "approve")}
                                disabled={approveWithdrawalMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReview(withdrawal, "reject")}
                                disabled={rejectWithdrawalMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">Henüz para çekme talebi bulunmuyor.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Denetim Günlüğü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Hedef</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        {log.admin?.email || "Sistem"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          log.action_type === "transaction_approved" ? "default" :
                          log.action_type === "transaction_rejected" ? "destructive" :
                          "outline"
                        }>
                          {log.action_type === "transaction_approved" ? "Onaylandı" :
                           log.action_type === "transaction_rejected" ? "Reddedildi" :
                           log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.target_id}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">Henüz denetim kaydı bulunmuyor.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Para Çekme Talebi {reviewAction === "approve" ? "Onaylama" : "Reddetme"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWithdrawal && (
              <div className="bg-muted p-4 rounded-md">
                <p><strong>Kullanıcı:</strong> {selectedWithdrawal.user?.email}</p>
                <p><strong>Miktar:</strong> ₺{selectedWithdrawal.amount.toLocaleString("tr-TR")}</p>
                <p><strong>Risk Skoru:</strong> {selectedWithdrawal.risk_score}/100</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-red-500">
                Admin Notu <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder={reviewAction === "approve" 
                  ? "Onay nedeni... (zorunlu)" 
                  : "Red nedeni... (zorunlu)"}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                required
                className={!reviewNote.trim() ? "border-red-300" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bu alan zorunludur ve işlem geçmişinde görünecektir.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewDialogOpen(false);
                  setReviewNote("");
                  setSelectedWithdrawal(null);
                  setReviewAction(null);
                }}
              >
                İptal
              </Button>
              <Button
                variant={reviewAction === "approve" ? "default" : "destructive"}
                onClick={confirmReview}
                disabled={!reviewNote.trim() || approveWithdrawalMutation.isPending || rejectWithdrawalMutation.isPending}
              >
                {reviewAction === "approve" ? "Onayla" : "Reddet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}