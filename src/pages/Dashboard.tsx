import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, MessageCircle, Users, Heart, DollarSign, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  // Fetch total accumulated fund for members
  const { data: totalFund } = useQuery({
    queryKey: ['member-total-fund'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved');
      if (error) throw error;
      return data.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    },
    enabled: !!user,
  });

  // Fetch verified payers
  const { data: verifiedPayers } = useQuery({
    queryKey: ['verified-payers'],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('user_id')
        .eq('status', 'approved');
      if (error) throw error;
      const uniqueUserIds = [...new Set(payments.map((p) => p.user_id))];
      if (uniqueUserIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name')
        .in('id', uniqueUserIds);
      return (profiles || []).map((p) => p.full_name);
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center gap-8 pt-16">
            <Skeleton className="h-16 w-48" />
            <div className="grid gap-8 sm:grid-cols-2 w-full max-w-2xl">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container py-8 flex-1 flex flex-col items-center justify-center">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
              <Heart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Manage your membership and connect with fellow students from Gish Abay Sekela
          </p>
        </div>

        {/* Financial Transparency Card */}
        <div className="w-full max-w-3xl mb-8">
          <Card className="border-2 border-secondary/20 bg-gradient-to-r from-secondary/5 via-primary/5 to-destructive/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                    <DollarSign className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Accumulated Fund</p>
                    <p className="text-3xl font-bold text-secondary">{(totalFund || 0).toLocaleString()} ETB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    {verifiedPayers?.length || 0} verified payer{(verifiedPayers?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {verifiedPayers && verifiedPayers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Verified Payers:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {verifiedPayers.map((name, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-8 sm:grid-cols-2 w-full max-w-3xl">
          <Link to="/payment" className="group">
            <Card className="h-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment</h2>
                <p className="text-muted-foreground">Make a contribution and upload your receipt for verification</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat" className="group">
            <Card className="h-full border-2 border-info/20 bg-gradient-to-br from-info/5 to-info/10 hover:border-info/50 transition-all duration-300 hover:shadow-xl hover:shadow-info/10 hover:-translate-y-1">
              <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-info/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-10 w-10 text-info" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Chat</h2>
                <p className="text-muted-foreground">Connect and chat with other association members</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">Part of the Gish Abay Sekela Students Association</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
