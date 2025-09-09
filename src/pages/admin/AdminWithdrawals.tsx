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
import { Check, X, Eye, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAdminActivity, ACTIVITY_TYPES } from "@/utils/adminActivityLogger";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  withdrawal_method: string;
  bank_details: any;
  status: string;
  reviewer_id?: string;
  review_note?: string;
  risk_score: number;
  risk_flags: string[];
  kyc_status: string;
  processing_fee: number;
  net_amount: number;
  created_at: string;
  users: {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
  };
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
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch withdrawals with filtering
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals", searchTerm, statusFilter, methodFilter, riskFilter],
    queryFn: async () => {
      let query = supabase
        .from("withdrawals")
        .select(`
          *,
          users!fk_withdrawals_user_id (
            email,
            first_name,
            last_name,
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`users.email.ilike.%${searchTerm}%,users.username.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (methodFilter !== "all") {
        query = query.eq("withdrawal_method", methodFilter);
      }

      if (riskFilter === "high") {
        query = query.gte("risk_score", 70);
      } else if (riskFilter === "medium") {
        query = query.gte("risk_score", 30).lt("risk_score", 70);
      } else if (riskFilter === "low") {
        query = query.lt("risk_score", 30);
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as Withdrawal[];
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

  // Approve withdrawal mutation
  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, note }: { withdrawalId: string; note: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("withdrawals")
        .update({
          status: "approved",
          reviewer_id: user.id,
          review_note: note,
          approved_at: new Date().toISOString()
        })
        .eq("id", withdrawalId);

      if (error) throw error;

      // Log admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.TRANSACTION_APPROVED,
        description: `Withdrawal ${withdrawalId} approved`,
        target_type: "withdrawal",
        target_id: withdrawalId,
        metadata: { note }
      });

      return withdrawalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-stats"] });
      toast({
        title: "Success",
        description: "Withdrawal approved successfully",
      });
      setIsReviewDialogOpen(false);
      setReviewNote("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject withdrawal mutation
  const rejectWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, note }: { withdrawalId: string; note: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          reviewer_id: user.id,
          review_note: note,
          rejected_at: new Date().toISOString()
        })
        .eq("id", withdrawalId);

      if (error) throw error;

      // Log admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.TRANSACTION_REJECTED,
        description: `Withdrawal ${withdrawalId} rejected`,
        target_type: "withdrawal",
        target_id: withdrawalId,
        metadata: { note }
      });

      return withdrawalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-stats"] });
      toast({
        title: "Success",
        description: "Withdrawal rejected successfully",
      });
      setIsReviewDialogOpen(false);
      setReviewNote("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Pending" },
      approved: { variant: "default" as const, text: "Approved" },
      rejected: { variant: "destructive" as const, text: "Rejected" },
      processing: { variant: "outline" as const, text: "Processing" },
      completed: { variant: "default" as const, text: "Completed" },
      failed: { variant: "destructive" as const, text: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 30) return <Badge variant="secondary">Medium Risk</Badge>;
    return <Badge variant="default">Low Risk</Badge>;
  };

  const handleReview = (withdrawal: Withdrawal, action: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal);
    setIsReviewDialogOpen(true);
    
    if (action === "approve") {
      approveWithdrawalMutation.mutate({
        withdrawalId: withdrawal.id,
        note: reviewNote || "Approved by admin"
      });
    } else {
      rejectWithdrawalMutation.mutate({
        withdrawalId: withdrawal.id,
        note: reviewNote || "Rejected by admin"
      });
    }
  };

  if (hasAccess === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (hasAccess === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. You need admin privileges to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₺{(stats?.total_pending_amount || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_approved_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₺{(stats?.total_approved_amount_today || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.high_risk_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search by email or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="e_wallet">E-Wallet</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {withdrawal.users.first_name} {withdrawal.users.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {withdrawal.users.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        ₺{withdrawal.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Net: ₺{withdrawal.net_amount?.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {withdrawal.withdrawal_method.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell>{getRiskBadge(withdrawal.risk_score)}</TableCell>
                  <TableCell>
                    <Badge variant={withdrawal.kyc_status === "verified" ? "default" : "secondary"}>
                      {withdrawal.kyc_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(withdrawal.created_at).toLocaleDateString()}
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
                            <DialogTitle>Withdrawal Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Amount</label>
                                <p>₺{withdrawal.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Net Amount</label>
                                <p>₺{withdrawal.net_amount?.toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Processing Fee</label>
                                <p>₺{withdrawal.processing_fee?.toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Risk Score</label>
                                <p>{withdrawal.risk_score}/100</p>
                              </div>
                            </div>
                            
                            {withdrawal.bank_details && (
                              <div>
                                <label className="text-sm font-medium">Bank Details</label>
                                <div className="bg-muted p-3 rounded-md mt-2">
                                  <pre className="text-sm">
                                    {JSON.stringify(withdrawal.bank_details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {withdrawal.review_note && (
                              <div>
                                <label className="text-sm font-medium">Review Note</label>
                                <p className="mt-1">{withdrawal.review_note}</p>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a review note (optional)"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}