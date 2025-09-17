import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building, Wallet, ArrowUpDown, Loader2, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserBalance } from "@/hooks/useUserBalance";
import type { User } from "@supabase/supabase-js";

interface PaymentProvider {
  id: string;
  name: string;
  slug: string;
  provider_type: string;
  min_amount: number;
  max_amount: number;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
  is_active: boolean;
  supported_currencies: string[];
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  risk_score: number;
  fraud_check_status: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  payment_method_id?: string;
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
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
}

export default function PaymentMethods() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("deposit");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("TRY");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("");
  const [bankDetails, setBankDetails] = useState({
    iban: "",
    bank_name: "",
    account_holder: "",
    swift_code: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const balanceData = useUserBalance(user);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch payment providers
  const { data: providers = [] } = useQuery({
    queryKey: ["payment-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as PaymentProvider[];
    },
  });

  // Fetch recent payments
  const { data: recentPayments = [] } = useQuery({
    queryKey: ["recent-payments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });

  // Fetch recent withdrawals
  const { data: recentWithdrawals = [] } = useQuery({
    queryKey: ["recent-withdrawals", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Withdrawal[];
    },
    enabled: !!user,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: { amount: number; currency: string; payment_method: string; provider_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: paymentData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recent-payments"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      
      if (data.payment_url) {
        // Open payment URL in new tab
        window.open(data.payment_url, '_blank');
      }

      const currencySymbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
      toast({
        title: "Payment Initiated",
        description: `Payment of ${currencySymbol}${amount} has been initiated successfully`,
      });

      setAmount("");
      setSelectedProvider("");
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const { data, error } = await supabase.functions.invoke("process-withdrawal", {
        body: withdrawalData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recent-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["user-balance"] });
      
      toast({
        title: "Withdrawal Requested",
        description: `Withdrawal of ₺${amount} has been ${data.auto_approved ? 'approved' : 'submitted for review'}`,
      });

      setAmount("");
      setWithdrawalMethod("");
      setBankDetails({
        iban: "",
        bank_name: "",
        account_holder: "",
        swift_code: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!selectedProvider || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a payment method and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const selectedProviderData = providers.find(p => p.id === selectedProvider);
    if (!selectedProviderData) return;

    const numAmount = parseFloat(amount);
    if (numAmount < selectedProviderData.min_amount || numAmount > selectedProviderData.max_amount) {
      const currencySymbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
      toast({
        title: "Invalid Amount",
        description: `Amount must be between ${currencySymbol}${selectedProviderData.min_amount} and ${currencySymbol}${selectedProviderData.max_amount}`,
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: numAmount,
      currency,
      payment_method: selectedProviderData.provider_type === "card" ? "credit_card" : selectedProviderData.provider_type,
      provider_id: selectedProvider
    });
  };

  const handleWithdrawal = () => {
    if (!withdrawalMethod || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a withdrawal method and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > (balanceData?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalMethod === "bank_transfer" && (!bankDetails.iban || !bankDetails.account_holder)) {
      toast({
        title: "Missing Bank Details",
        description: "Please provide complete bank details",
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate({
      amount: numAmount,
      withdrawal_method: withdrawalMethod,
      bank_details: withdrawalMethod === "bank_transfer" ? bankDetails : undefined
    });
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "card": return <CreditCard className="h-5 w-5" />;
      case "bank_transfer": return <Building className="h-5 w-5" />;
      case "e_wallet": return <Wallet className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Pending" },
      processing: { variant: "outline" as const, text: "Processing" },
      completed: { variant: "default" as const, text: "Completed" },
      approved: { variant: "default" as const, text: "Approved" },
      rejected: { variant: "destructive" as const, text: "Rejected" },
      failed: { variant: "destructive" as const, text: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/20">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Payment Methods</h1>
            <p className="text-muted-foreground mb-8">Please log in to access payment methods</p>
            <Button onClick={() => window.location.href = "/"}>Go to Login</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your deposits and withdrawals</p>
        </div>

        {/* Balance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">₺{(balanceData?.balance || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Real Balance</div>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <div className="text-2xl font-bold">₺{(balanceData?.bonus_balance || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Bonus Balance</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <div className="text-2xl font-bold">₺{(balanceData?.total_balance || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Make a Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Providers */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.filter(p => p.provider_type !== "withdrawal").map((provider) => (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-colors ${
                          selectedProvider === provider.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedProvider(provider.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {getProviderIcon(provider.provider_type)}
                            <div>
                              <div className="font-medium">{provider.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Multiple currencies supported
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">🇹🇷 Turkish Lira (₺)</SelectItem>
                      <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Amount ({currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€"})
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                  />
                  {selectedProvider && (
                    <div className="flex gap-2 flex-wrap">
                      {[100, 250, 500, 1000, 2500].map((quickAmount) => {
                        const provider = providers.find(p => p.id === selectedProvider);
                        if (!provider || quickAmount < provider.min_amount || quickAmount > provider.max_amount) return null;
                        
                        const currencySymbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
                        const adjustedAmount = currency === "USD" ? Math.round(quickAmount * 0.034) : currency === "EUR" ? Math.round(quickAmount * 0.031) : quickAmount;
                        
                        return (
                          <Button
                            key={quickAmount}
                            variant="outline"
                            size="sm"
                            onClick={() => setAmount(adjustedAmount.toString())}
                          >
                            {currencySymbol}{adjustedAmount}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={createPaymentMutation.isPending || !selectedProvider || !amount}
                  className="w-full"
                >
                  {createPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Make Deposit"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Deposits */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent deposits</p>
                  ) : (
                    recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">₺{payment.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.payment_method.replace("_", " ")} • {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.risk_score > 50 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Withdrawal Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Withdrawal Method</label>
                  <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (TRY)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    max={balanceData?.balance || 0}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {[100, 250, 500, 1000].map((quickAmount) => {
                      if (quickAmount > (balanceData?.balance || 0)) return null;
                      
                      return (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(quickAmount.toString())}
                        >
                          ₺{quickAmount}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Details */}
                {withdrawalMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">IBAN</label>
                        <Input
                          placeholder="TR33 0006 1005 1978 6457 8413 26"
                          value={bankDetails.iban}
                          onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bank Name</label>
                        <Input
                          placeholder="Bank name"
                          value={bankDetails.bank_name}
                          onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Account Holder</label>
                        <Input
                          placeholder="Full name"
                          value={bankDetails.account_holder}
                          onChange={(e) => setBankDetails({...bankDetails, account_holder: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">SWIFT Code (optional)</label>
                        <Input
                          placeholder="SWIFT code"
                          value={bankDetails.swift_code}
                          onChange={(e) => setBankDetails({...bankDetails, swift_code: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800 mb-2">Important Information</div>
                      <ul className="text-yellow-700 space-y-1">
                        <li>• Withdrawals may take 1-3 business days to process</li>
                        <li>• KYC verification may be required for large amounts</li>
                        <li>• Processing fees may apply based on withdrawal method</li>
                        <li>• Withdrawals are subject to fraud checks and risk assessment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWithdrawal}
                  disabled={createWithdrawalMutation.isPending || !withdrawalMethod || !amount}
                  className="w-full"
                >
                  {createWithdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Request Withdrawal"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Withdrawals */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWithdrawals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent withdrawals</p>
                  ) : (
                    recentWithdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                        <div className="font-medium">₺{withdrawal.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {withdrawal.status} • {new Date(withdrawal.created_at).toLocaleDateString()}
                        </div>
                          {withdrawal.net_amount && (
                            <div className="text-xs text-muted-foreground">
                              Çekilen: ₺{withdrawal.amount.toLocaleString()} (Ücretsiz ✨)
                            </div>
                          )}
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}