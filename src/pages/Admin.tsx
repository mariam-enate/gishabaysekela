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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Eye,
  XCircle,
  UserX,
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

  // Fetch pending payments with profiles (separate queries to avoid join issues)
  const { data: pendingPayments, isLoading: loadingPayments } = useQuery({
    queryKey: ['admin-pending-payments'],
    queryFn: async () => {
      // Fetch payments first
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('id, user_id, amount, screenshot_path, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      if (!paymentsData || paymentsData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(paymentsData.map((p) => p.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, department')
        .in('id', userIds);

      // Create a map of user ID to profile data
      const profileMap = new Map<string, { full_name: string; phone: string; department: string }>();
      (profilesData || []).forEach((p) => {
        profileMap.set(p.id, { full_name: p.full_name, phone: p.phone, department: p.department });
      });

      // Combine payments with profile data
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

  // Fetch all members
  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!user && isAdmin,
  });

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'approved' })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Payment Approved!',
        description: 'The payment has been verified and added to the fund.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-total-fund'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Payment Rejected',
        description: 'The payment has been rejected.',
        variant: 'destructive',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Ban member mutation
  const banMutation = useMutation({
    mutationFn: async (memberId: string) => {
      // Delete user roles first
      await supabase.from('user_roles').delete().eq('user_id', memberId);
      // Delete profile
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Member Banned',
        description: 'The member has been removed from the association.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      setBanDialogOpen(false);
      setMemberToBan(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const viewReceipt = async (path: string) => {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      setSelectedImage(data.signedUrl);
    }
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
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage payments and members</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Fund</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {(totalFund || 0).toLocaleString()} ETB
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From approved payments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {pendingPayments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">
                {members?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered students
              </p>
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
              <div className="p-6">
                <Skeleton className="h-20" />
              </div>
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
                      <TableCell className="font-medium">
                        {payment.member_name}
                      </TableCell>
                      <TableCell>{payment.member_phone}</TableCell>
                      <TableCell>{payment.member_department}</TableCell>
                      <TableCell className="font-semibold">
                        {parseFloat(payment.amount.toString()).toLocaleString()} ETB
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewReceipt(payment.screenshot_path)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(payment.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="bg-success hover:bg-success/90 gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(payment.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
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
              Registered Members
            </CardTitle>
            <CardDescription>All registered association members</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMembers ? (
              <div className="p-6">
                <Skeleton className="h-20" />
              </div>
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
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBanClick(member)}
                          disabled={member.id === user.id}
                          className="gap-1"
                        >
                          <UserX className="h-3 w-3" />
                          Ban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No members registered yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Payment Receipt"
                className="w-full rounded-lg"
              />
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2"
              >
                <Button variant="secondary" size="sm" className="gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Open Full Size
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
            <AlertDialogAction
              onClick={() => memberToBan && banMutation.mutate(memberToBan.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ban Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}