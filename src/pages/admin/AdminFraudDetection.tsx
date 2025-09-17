import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Eye, TrendingUp, Users, Globe } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/hooks/use-toast";

interface FraudAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: any;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface UserRiskProfile {
  id: string;
  user_id: string;
  overall_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  geo_risk_score: number;
  behavioral_risk_score: number;
  payment_risk_score: number;
  velocity_risk_score: number;
  last_assessment_at: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface IPAnalysis {
  id: string;
  ip_address: string;
  country_code: string;
  city: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_datacenter: boolean;
  risk_score: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  last_checked_at: string;
}

// VPN/Proxy Indicator Component
const VPNProxyIndicator = ({ ipAddress }: { ipAddress: string }) => {
  const { data: ipAnalysis } = useQuery({
    queryKey: ["ip-analysis", ipAddress],
    queryFn: async () => {
      if (!ipAddress) return null;
      const { data, error } = await supabase
        .from("ip_analysis")
        .select("is_vpn, is_proxy, is_tor, is_datacenter, threat_level, risk_score")
        .eq("ip_address", ipAddress)
        .single();
      
      if (error || !data) return null;
      return data;
    },
    enabled: !!ipAddress,
  });

  if (!ipAnalysis) return null;

  const hasRisk = ipAnalysis.is_vpn || ipAnalysis.is_proxy || ipAnalysis.is_tor || ipAnalysis.is_datacenter;
  
  if (!hasRisk) return null;

  const getRiskIcon = () => {
    if (ipAnalysis.is_tor) return "🧅";
    if (ipAnalysis.is_proxy) return "🔄";
    if (ipAnalysis.is_vpn) return "🛡️";
    if (ipAnalysis.is_datacenter) return "🏢";
    return "⚠️";
  };

  const getRiskText = () => {
    const risks = [];
    if (ipAnalysis.is_vpn) risks.push("VPN");
    if (ipAnalysis.is_proxy) risks.push("Proxy");
    if (ipAnalysis.is_tor) risks.push("Tor");
    if (ipAnalysis.is_datacenter) risks.push("Datacenter");
    return risks.join(" + ");
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <Badge 
        variant={ipAnalysis.threat_level === 'critical' ? 'destructive' : 
                ipAnalysis.threat_level === 'high' ? 'destructive' : 'secondary'}
        className="text-xs"
      >
        {getRiskIcon()} {getRiskText()}
      </Badge>
      <span className="text-xs text-muted-foreground">
        Risk: {ipAnalysis.risk_score}
      </span>
    </div>
  );
};

export default function AdminFraudDetection() {
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>("all");
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { isAdmin, loading: accessLoading } = useAdminAccess(user);

  // Fetch fraud alerts
  const { data: fraudAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["admin-fraud-alerts", alertStatusFilter, alertSeverityFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("fraud_alerts")
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (alertStatusFilter !== "all") {
        query = query.eq("status", alertStatusFilter);
      }

      if (alertSeverityFilter !== "all") {
        query = query.eq("severity", alertSeverityFilter);
      }

      if (searchTerm) {
        query = query.or(`profiles.email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch user risk profiles
  const { data: riskProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-risk-profiles", riskLevelFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("user_risk_profiles")
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .order("overall_risk_score", { ascending: false });

      if (riskLevelFilter !== "all") {
        query = query.eq("risk_level", riskLevelFilter);
      }

      if (searchTerm) {
        query = query.or(`profiles.email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch IP analysis data
  const { data: ipAnalyses = [], isLoading: ipLoading } = useQuery({
    queryKey: ["admin-ip-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_analysis")
        .select("*")
        .order("risk_score", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as IPAnalysis[];
    },
  });

  // Fetch user registration IPs
  const { data: registrationIPs = [], isLoading: registrationIPsLoading } = useQuery({
    queryKey: ["admin-user-registration-ips", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, email, registration_ip, created_at")
        .not("registration_ip", "is", null)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch login logs
  const { data: loginLogs = [], isLoading: loginLogsLoading } = useQuery({
    queryKey: ["admin-login-logs", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("login_logs")
        .select(`
          id,
          email,
          ip_address,
          user_agent,
          login_method,
          success,
          failure_reason,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (searchTerm) {
        query = query.ilike("email", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fraud statistics
  const { data: stats } = useQuery({
    queryKey: ["fraud-stats"],
    queryFn: async () => {
          // Fraud statistics
          const [alertsResult, profilesResult, ipResult] = await Promise.all([
            supabase.from("fraud_alerts").select("id, severity, status"),
            supabase.from("user_risk_profiles").select("id, risk_level"),
            supabase.from("ip_analysis").select("id, threat_level, is_vpn, is_proxy, is_tor, is_datacenter")
          ]);

          const alerts = alertsResult.data || [];
          const profiles = profilesResult.data || [];
          const ips = ipResult.data || [];

          return {
            total_alerts: alerts.length,
            open_alerts: alerts.filter(a => a.status === 'open').length,
            critical_alerts: alerts.filter(a => a.severity === 'critical').length,
            high_risk_users: profiles.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length,
            vpn_detections: ips.filter(ip => ip.is_vpn).length,
            proxy_detections: ips.filter(ip => ip.is_proxy).length,
            tor_detections: ips.filter(ip => ip.is_tor).length,
            datacenter_detections: ips.filter(ip => ip.is_datacenter).length,
            total_suspicious_ips: ips.filter(ip => ip.is_vpn || ip.is_proxy || ip.is_tor || ip.is_datacenter).length
          };
    },
  });

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "secondary",
      medium: "outline", 
      high: "destructive",
      critical: "destructive"
    };
    return <Badge variant={variants[severity as keyof typeof variants] as any}>{severity.toUpperCase()}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive", 
      critical: "destructive"
    };
    return <Badge variant={variants[riskLevel as keyof typeof variants] as any}>{riskLevel.toUpperCase()}</Badge>;
  };

  const getThreatBadge = (threatLevel: string) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive",
      critical: "destructive"
    };
    return <Badge variant={variants[threatLevel as keyof typeof variants] as any}>{threatLevel.toUpperCase()}</Badge>;
  };

  const updateAlertStatus = async (alertId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("fraud_alerts")
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Alarm durumu güncellendi.",
      });

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error updating alert status:", error);
      toast({
        title: "Hata",
        description: "Alarm durumu güncellenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  if (accessLoading) return <div>Yükleniyor...</div>;
  if (!isAdmin) return <div>Bu sayfaya erişim yetkiniz bulunmamaktadır.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fraud Tespiti & Risk Yönetimi</h1>
        <p className="text-muted-foreground">
          Şüpheli aktiviteleri izleyin ve risk skorlarını yönetin
        </p>
      </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Alarm</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_alerts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Açık Alarmlar</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.open_alerts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kritik Alarmlar</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.critical_alerts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yüksek Risk Kullanıcı</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.high_risk_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">VPN Tespiti</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.vpn_detections}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proxy Tespiti</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.proxy_detections}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">Fraud Alarmları</TabsTrigger>
            <TabsTrigger value="risk-profiles">Risk Profilleri</TabsTrigger>
            <TabsTrigger value="ip-analysis">IP Analizi</TabsTrigger>
            <TabsTrigger value="user-registration-ips">Kayıt IP Adresleri</TabsTrigger>
            <TabsTrigger value="login-logs">Giriş Logları</TabsTrigger>
          </TabsList>

          {/* Fraud Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Alarmları</CardTitle>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="E-posta ile ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Select value={alertStatusFilter} onValueChange={setAlertStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Durum filtrele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="open">Açık</SelectItem>
                        <SelectItem value="investigating">İnceleniyor</SelectItem>
                        <SelectItem value="resolved">Çözüldü</SelectItem>
                        <SelectItem value="false_positive">Yanlış Alarm</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={alertSeverityFilter} onValueChange={setAlertSeverityFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Önem filtrele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Seviyeler</SelectItem>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="critical">Kritik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Alarm Tipi</TableHead>
                      <TableHead>Önem</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fraudAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                         <TableCell>
                           <div>
                             <div className="font-medium">
                               {alert.profiles.first_name} {alert.profiles.last_name}
                             </div>
                             <div className="text-sm text-muted-foreground">
                               {alert.profiles.email}
                             </div>
                           </div>
                         </TableCell>
                        <TableCell>{alert.alert_type}</TableCell>
                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.description}</TableCell>
                        <TableCell>
                          <Badge variant={alert.status === 'open' ? 'destructive' : 'secondary'}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(alert.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {alert.status === 'open' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAlertStatus(alert.id, 'investigating')}
                                >
                                  İncele
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => updateAlertStatus(alert.id, 'resolved')}
                                >
                                  Çöz
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
          </TabsContent>

          {/* Risk Profiles Tab */}
          <TabsContent value="risk-profiles">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Risk Profilleri</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="E-posta ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Risk seviyesi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Seviyeler</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Genel Risk Skoru</TableHead>
                      <TableHead>Risk Seviyesi</TableHead>
                      <TableHead>Coğrafi Risk</TableHead>
                      <TableHead>Davranışsal Risk</TableHead>
                      <TableHead>Ödeme Risk</TableHead>
                      <TableHead>Son Değerlendirme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                         <TableCell>
                           <div>
                             <div className="font-medium">
                               {profile.profiles.first_name} {profile.profiles.last_name}
                             </div>
                             <div className="text-sm text-muted-foreground">
                               {profile.profiles.email}
                             </div>
                           </div>
                         </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold mr-2">{profile.overall_risk_score}</span>
                            <span className="text-sm text-muted-foreground">/100</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRiskBadge(profile.risk_level)}</TableCell>
                        <TableCell>{profile.geo_risk_score}</TableCell>
                        <TableCell>{profile.behavioral_risk_score}</TableCell>
                        <TableCell>{profile.payment_risk_score}</TableCell>
                        <TableCell>
                          {new Date(profile.last_assessment_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP Analysis Tab */}
          <TabsContent value="ip-analysis">
            <Card>
              <CardHeader>
                <CardTitle>IP Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Adresi</TableHead>
                      <TableHead>Ülke/Şehir</TableHead>
                      <TableHead>VPN</TableHead>
                      <TableHead>Proxy</TableHead>
                      <TableHead>Datacenter</TableHead>
                      <TableHead>Risk Skoru</TableHead>
                      <TableHead>Tehdit Seviyesi</TableHead>
                      <TableHead>Son Kontrol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ipAnalyses.map((ip) => (
                      <TableRow key={ip.id}>
                        <TableCell className="font-mono">{ip.ip_address}</TableCell>
                        <TableCell>{ip.city}, {ip.country_code}</TableCell>
                        <TableCell>
                          <Badge variant={ip.is_vpn ? 'destructive' : 'secondary'}>
                            {ip.is_vpn ? 'Evet' : 'Hayır'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ip.is_proxy ? 'destructive' : 'secondary'}>
                            {ip.is_proxy ? 'Evet' : 'Hayır'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ip.is_datacenter ? 'destructive' : 'secondary'}>
                            {ip.is_datacenter ? 'Evet' : 'Hayır'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">{ip.risk_score}/100</span>
                        </TableCell>
                        <TableCell>{getThreatBadge(ip.threat_level)}</TableCell>
                        <TableCell>
                          {new Date(ip.last_checked_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Registration IPs Tab */}
          <TabsContent value="user-registration-ips">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Kayıt IP Adresleri</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="E-posta, ad veya soyad ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Kayıt IP Adresi</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationIPsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Yükleniyor...</TableCell>
                      </TableRow>
                    ) : registrationIPs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Kayıt IP adresi bulunan kullanıcı bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrationIPs.map((user) => (
                       <TableRow key={user.id}>
                         <TableCell>
                           <div>
                             <div className="font-medium">
                               {user.first_name} {user.last_name}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="text-sm text-muted-foreground">
                             {user.email}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex flex-col gap-1">
                             <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                               {user.registration_ip as string}
                             </code>
                             <VPNProxyIndicator ipAddress={user.registration_ip as string} />
                           </div>
                         </TableCell>
                         <TableCell>
                           {new Date(user.created_at).toLocaleDateString('tr-TR', {
                             year: 'numeric',
                             month: 'short',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </TableCell>
                       </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login Logs Tab */}
          <TabsContent value="login-logs">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Giriş Logları</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="E-posta ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-posta</TableHead>
                      <TableHead>IP Adresi</TableHead>
                      <TableHead>Giriş Yöntemi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Hata Nedeni</TableHead>
                      <TableHead>Tarayıcı</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginLogsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Yükleniyor...</TableCell>
                      </TableRow>
                    ) : loginLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Giriş logu bulunmamaktadır.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.email}</TableCell>
                           <TableCell>
                             <code className="bg-muted px-2 py-1 rounded text-sm">
                               {(log.ip_address as string) || 'Bilinmiyor'}
                             </code>
                             {/* VPN/Proxy indicator için IP analizi */}
                             <VPNProxyIndicator ipAddress={log.ip_address as string} />
                           </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(log.login_method as string) === 'email_password' ? 'E-posta/Şifre' : 
                               (log.login_method as string) === 'google' ? 'Google' : (log.login_method as string)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={(log.success as boolean) ? 'default' : 'destructive'}>
                              {(log.success as boolean) ? 'Başarılı' : 'Başarısız'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(log.failure_reason as string) && (
                              <span className="text-sm text-destructive">
                                {(log.failure_reason as string)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs">
                            {(log.user_agent as string)}
                          </TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }