import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, Upload, Phone, Building2, Check, Clock, XCircle, AlertTriangle, Copy, ArrowLeft, Heart, Sparkles,
} from 'lucide-react';

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ amount, file }: { amount: number; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { error: paymentError } = await supabase.from('payments').insert({ user_id: user!.id, amount, screenshot_path: fileName });
      if (paymentError) throw paymentError;
    },
    onSuccess: () => {
      toast({ title: 'Payment Submitted!', description: 'Your payment receipt has been uploaded. Awaiting admin approval.' });
      setAmount(''); setScreenshot(null);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => { toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' }); },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      toast({ title: 'Invalid Amount', description: 'Minimum payment amount is 50 Birr.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    await uploadMutation.mutateAsync({ amount: numAmount, file: screenshot });
    setUploading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
  };

  const isValidAmount = parseFloat(amount) >= 50;
  const canSubmit = isValidAmount && screenshot !== null && !uploading;

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </Button>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Support Our Association
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your donation helps support fellow students from Gish Abay Sekela. Every contribution makes a difference.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Payment Methods */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </h2>

            {/* CBE Card */}
            <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-destructive" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/20 shadow-inner">
                    <Building2 className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-secondary text-lg">Commercial Bank of Ethiopia</CardTitle>
                    <p className="text-sm text-muted-foreground">CBE Account</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Account Name</p>
                  <p className="font-bold text-lg">Nitsuh and Melis</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Account Number</p>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold font-mono text-secondary">1000687568568</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('1000687568568', 'CBE Account Number')} className="hover:bg-secondary/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Telebirr Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 shadow-inner">
                    <Phone className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-primary text-lg">Telebirr</CardTitle>
                    <p className="text-sm text-muted-foreground">Mobile Payment</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Account Name</p>
                  <p className="font-bold text-lg">Melis Melakie</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold font-mono text-primary">0918498348</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard('0918498348', 'Telebirr Number')} className="hover:bg-primary/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warning-foreground">
                After making your payment, upload the receipt/screenshot below for verification. Your payment will be reviewed by an administrator.
              </p>
            </div>
          </div>

          {/* Right Side - Submit Payment */}
          <div className="space-y-6">
            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Upload className="h-5 w-5" />Submit Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (ETB)</Label>
                    <Input id="amount" type="number" step="0.01" min="50" placeholder="Enter amount (minimum 50 Birr)" value={amount} onChange={(e) => setAmount(e.target.value)} className={`text-lg ${amount && !isValidAmount ? 'border-destructive' : ''}`} required />
                    {amount && !isValidAmount && <p className="text-sm text-destructive">Minimum payment amount is 50 Birr</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Upload Receipt/Screenshot</Label>
                    <Input id="screenshot" type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} className="cursor-pointer" required />
                    {screenshot && <p className="text-sm text-muted-foreground">Selected: {screenshot.name}</p>}
                  </div>
                  <Button type="submit" disabled={!canSubmit} className="w-full text-lg py-6" size="lg">
                    {uploading ? 'Uploading...' : <><Sparkles className="h-5 w-5 mr-2" />Submit Payment</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">My Payment History</CardTitle></CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-semibold text-lg">{parseFloat(payment.amount.toString()).toLocaleString()} ETB</p>
                          <p className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <Badge variant={payment.status === 'approved' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'secondary'} className={payment.status === 'approved' ? 'bg-success' : payment.status === 'rejected' ? '' : 'bg-warning text-warning-foreground'}>
                          {payment.status === 'approved' ? <><Check className="h-3 w-3 mr-1" /> Approved</> : payment.status === 'rejected' ? <><XCircle className="h-3 w-3 mr-1" /> Rejected</> : <><Clock className="h-3 w-3 mr-1" /> Pending</>}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No payments yet. Make your first contribution!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
