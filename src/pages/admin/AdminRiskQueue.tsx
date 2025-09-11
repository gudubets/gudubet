import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Ban, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskFlag {
  id: string;
  user_id: string;
  risk_score: number;
  status: string;
  reasons: string[];
  created_at: string;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function AdminRiskQueue() {
  const [selectedFlag, setSelectedFlag] = useState<RiskFlag | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch risk flags
  const { data: riskFlags, isLoading } = useQuery({
    queryKey: ['riskFlags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_flags')
        .select('*')
        .eq('status', 'review')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RiskFlag[];
    },
  });

  // Update risk flag status
  const updateRiskFlag = useMutation({
    mutationFn: async ({ flagId, status, note }: { flagId: string; status: string; note: string }) => {
      const { error } = await supabase
        .from('risk_flags')
        .update({
          status,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', flagId);

      if (error) throw error;

      // Log admin activity
      await supabase.from('admin_activities').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: `risk_${status}`,
        description: `Risk flag ${status} for user`,
        target_type: 'risk_flag',
        target_id: flagId,
        metadata: { note, status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskFlags'] });
      toast({
        title: "Risk Flag Updated",
        description: "The risk flag has been successfully updated.",
      });
      setIsDialogOpen(false);
      setReviewNote('');
      setSelectedFlag(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update risk flag",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (flag: RiskFlag, status: string) => {
    setSelectedFlag(flag);
    setIsDialogOpen(true);
  };

  const handleConfirmUpdate = (status: string) => {
    if (!selectedFlag || !reviewNote.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a review note.",
        variant: "destructive",
      });
      return;
    }

    updateRiskFlag.mutate({
      flagId: selectedFlag.id,
      status,
      note: reviewNote,
    });
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'bg-destructive text-destructive-foreground';
    if (score >= 40) return 'bg-warning text-warning-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  const getRiskScoreIcon = (score: number) => {
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />;
    if (score >= 40) return <Shield className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="p-6">Loading risk queue...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Queue</h1>
        <p className="text-muted-foreground">
          Review and take action on flagged users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Risk Reviews</CardTitle>
          <CardDescription>
            Users flagged for risk review requiring manual action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!riskFlags?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No risk flags requiring review
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Reasons</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskFlags.map((flag) => (
                <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">User ID: {flag.user_id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskScoreColor(flag.risk_score)}>
                        {getRiskScoreIcon(flag.risk_score)}
                        <span className="ml-1">{flag.risk_score}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {flag.reasons.map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(flag.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(flag, 'allowed')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Allow
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Risk Flag</DialogTitle>
                              <DialogDescription>
                                Provide a note for this risk review decision
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="note">Review Note</Label>
                                <Textarea
                                  id="note"
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  placeholder="Enter your review notes..."
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleConfirmUpdate('allowed')}
                                  className="flex-1"
                                  disabled={updateRiskFlag.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Allow
                                </Button>
                                <Button
                                  onClick={() => handleConfirmUpdate('limited')}
                                  variant="outline"
                                  className="flex-1"
                                  disabled={updateRiskFlag.isPending}
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  Limit
                                </Button>
                                <Button
                                  onClick={() => handleConfirmUpdate('blocked')}
                                  variant="destructive"
                                  className="flex-1"
                                  disabled={updateRiskFlag.isPending}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Block
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}