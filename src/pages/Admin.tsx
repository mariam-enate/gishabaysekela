import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, DollarSign, Users, Clock, CheckCircle, ExternalLink, Eye, XCircle, UserX, ThumbsUp, ThumbsDown, MessageCircle,
} from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  screenshot_path: string;
  status: string;
  created_at: string;
  member_name?: string;
  member_phone?: string;
  member_department?: string;
}

interface Member {
  id: string;
  full_name: string;
  phone: string;
  department: string;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [memberToBan, setMemberToBan] = useState<Member | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch admin user IDs to exclude from member list
  const { data: adminUserIds } = useQuery({
    queryKey: ['admin-user-ids'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      return (data || []).map((r) => r.user_id);
    },
    enabled: !!user && isAdmin,
  });

  // Fetch pending payments
  const { data: pendingPayments, isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('id, user_id, amount, screenshot_path, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      if (!paymentsData || paymentsData.length === 0) return [];

      const userIds = [...new Set(paymentsData.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, department')
        .in('id', userIds);

      const profileMap = new Map<string, { full_name: string; phone: string; department: string }>();
      (profilesData || []).forEach((p) => {
        profileMap.set(p.id, { full_name: p.full_name, phone: p.phone, department: p.department });
      });

      return paymentsData.map((payment) => {
        const profile = profileMap.get(payment.user_id);
        return {
          ...payment,
          member_name: profile?.full_name || 'Unknown',
          member_phone: profile?.phone || '-',
          member_department: profile?.department || '-',
        };
      }) as Payment[];
    },
    enabled: !!user && isAdmin,
  });

  // Fetch total fund
  const { data: totalFund } = useQuery({
    queryKey: ['admin-total-fund'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved');
      if (error) throw error;
      return data.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    },
    enabled: !!user && isAdmin,
  });

  // Fetch approved count
  const { data: approvedCount } = useQuery({
    queryKey: ['admin-approved-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('status', 'approved');
      if (error) throw error;
      return data.length;
    },
    enabled: !!user && isAdmin,
  });

  // Fetch rejected count
  const { data: rejectedCount } = useQuery({
    queryKey: ['admin-rejected-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('status', 'rejected');
      if (error) throw error;
      return data.length;
    },
    enabled: !!user && isAdmin,
  });

  // Fetch all members (excluding admins)
  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['admin-members', adminUserIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Filter out admin users
      return (data as Member[]).filter((m) => !(adminUserIds || []).includes(m.id));
    },
    enabled: !!user && isAdmin && !!adminUserIds,
  });

  // Fetch chat enabled setting
  const { data: chatEnabled } = useQuery({
    queryKey: ['chat-enabled'],
    queryFn: async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'chat_enabled')
        .maybeSingle();
      return data?.value === 'true';
    },
    enabled: !!user && isAdmin,
  });

  // Toggle chat mutation
  const toggleChatMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: enabled ? 'true' : 'false' })
        .eq('key', 'chat_enabled');
      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      toast({ title: enabled ? 'Chat Enabled' : 'Chat Disabled', description: enabled ? 'Members can now send messages.' : 'Chat is now read-only for members.' });
      queryClient.invalidateQueries({ queryKey: ['chat-enabled'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Payment Approved!', description: 'The payment has been verified and added to the fund.' });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-total-fund'] });
      queryClient.invalidateQueries({ queryKey: ['admin-approved-count'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Payment Rejected', description: 'The payment has been rejected.', variant: 'destructive' });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-count'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Ban member mutation
  const banMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await supabase.from('user_roles').delete().eq('user_id', memberId);
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Member Banned', description: 'The member has been removed from the association.' });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      setBanDialogOpen(false);
      setMemberToBan(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const viewReceipt = async (path: string) => {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 3600);
    if (data?.signedUrl) setSelectedImage(data.signedUrl);
  };

  const handleBanClick = (member: Member) => {
    setMemberToBan(member);
    setBanDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 mb-8">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage payments and members</p>
            </div>
          </div>
          {/* Chat Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <MessageCircle className="h-5 w-5 text-info" />
            <Label htmlFor="chat-toggle" className="font-medium">Group Chat</Label>
            <Switch
              id="chat-toggle"
              checked={chatEnabled ?? true}
              onCheckedChange={(checked) => toggleChatMutation.mutate(checked)}
              disabled={toggleChatMutation.isPending}
            />
            <Badge variant={chatEnabled ? 'default' : 'secondary'} className={chatEnabled ? 'bg-success' : ''}>
              {chatEnabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards - Ethiopian Flag themed */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="bg-gradient-to-br from-[hsl(142,52%,36%)]/20 to-[hsl(142,52%,36%)]/5 border-[hsl(142,52%,36%)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Fund</CardTitle>
              <DollarSign className="h-4 w-4 text-[hsl(142,52%,36%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[hsl(142,52%,36%)]">
                {(totalFund || 0).toLocaleString()} ETB
              </div>
              <p className="text-xs text-muted-foreground mt-1">From approved payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[hsl(45,93%,47%)]/20 to-[hsl(45,93%,47%)]/5 border-[hsl(45,93%,47%)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-[hsl(45,93%,47%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[hsl(45,93%,47%)]">
                {pendingPayments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[hsl(142,71%,45%)]/20 to-[hsl(142,71%,45%)]/5 border-[hsl(142,71%,45%)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <ThumbsUp className="h-4 w-4 text-[hsl(142,71%,45%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[hsl(142,71%,45%)]">
                {approvedCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Verified payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[hsl(0,84%,60%)]/20 to-[hsl(0,84%,60%)]/5 border-[hsl(0,84%,60%)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <ThumbsDown className="h-4 w-4 text-[hsl(0,84%,60%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[hsl(0,84%,60%)]">
                {rejectedCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Invalid payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {members?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Registered students</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <Card className="mb-8">
          <CardHeader className="bg-warning/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Payment Verifications
            </CardTitle>
            <CardDescription>Review and approve member payment receipts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPayments ? (
              <div className="p-6"><Skeleton className="h-20" /></div>
            ) : pendingPayments && pendingPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.member_name}</TableCell>
                      <TableCell>{payment.member_phone}</TableCell>
                      <TableCell>{payment.member_department}</TableCell>
                      <TableCell className="font-semibold">{parseFloat(payment.amount.toString()).toLocaleString()} ETB</TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => viewReceipt(payment.screenshot_path)} className="gap-1">
                          <Eye className="h-3 w-3" />View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveMutation.mutate(payment.id)} disabled={approveMutation.isPending || rejectMutation.isPending} className="bg-success hover:bg-success/90 gap-1">
                            <CheckCircle className="h-3 w-3" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(payment.id)} disabled={approveMutation.isPending || rejectMutation.isPending} className="gap-1">
                            <XCircle className="h-3 w-3" />Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success/50" />
                <p>No pending payments. All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader className="bg-info/5 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              Registered Members ({members?.length || 0})
            </CardTitle>
            <CardDescription>All registered association members (excluding admins)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMembers ? (
              <div className="p-6"><Skeleton className="h-20" /></div>
            ) : members && members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleBanClick(member)} disabled={member.id === user.id} className="gap-1">
                          <UserX className="h-3 w-3" />Ban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground">No members registered yet.</div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img src={selectedImage} alt="Payment Receipt" className="w-full rounded-lg" />
              <a href={selectedImage} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2">
                <Button variant="secondary" size="sm" className="gap-1">
                  <ExternalLink className="h-3 w-3" />Open Full Size
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban <strong>{memberToBan?.full_name}</strong>? 
              This will remove their profile and they will no longer be able to access the association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => memberToBan && banMutation.mutate(memberToBan.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ban Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
