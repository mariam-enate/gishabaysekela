import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Upload, Phone, Building2, Check, Clock, XCircle } from 'lucide-react';

export function PaymentSection() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user's payments (only for members)
  const { data: payments, isLoading } = useQuery({
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
    enabled: !!user && !isAdmin,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ amount, file }: { amount: number; file: File }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user!.id,
          amount,
          screenshot_path: fileName,
        });

      if (paymentError) throw paymentError;
    },
    onSuccess: () => {
      toast({
        title: 'Payment Submitted!',
        description: 'Your payment receipt has been uploaded. Awaiting admin approval.',
      });
      setAmount('');
      setScreenshot(null);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    await uploadMutation.mutateAsync({ amount: numAmount, file: screenshot });
    setUploading(false);
  };

  // Admin should not see this section - they use the Admin dashboard
  if (isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Bank Information */}
      <Card className="border-2 border-secondary/20 bg-secondary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-secondary">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Make your payment to one of these accounts and upload the receipt
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">CBE Account</p>
              <p className="text-lg font-bold font-mono">1000353216027</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Telebirr</p>
              <p className="text-lg font-bold font-mono">0920846316</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Receipt
          </CardTitle>
          <CardDescription>
            Upload your payment screenshot for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenshot">Receipt Screenshot</Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                required
              />
            </div>
            <Button type="submit" disabled={uploading || !screenshot || !amount} className="w-full">
              {uploading ? 'Uploading...' : 'Submit Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>My Payments</CardTitle>
          <CardDescription>Track your payment history and status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading payments...</p>
          ) : payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {parseFloat(payment.amount.toString()).toLocaleString()} ETB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={payment.status === 'approved' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'secondary'}
                    className={
                      payment.status === 'approved' 
                        ? 'bg-success' 
                        : payment.status === 'rejected' 
                          ? '' 
                          : 'bg-warning text-warning-foreground'
                    }
                  >
                    {payment.status === 'approved' ? (
                      <><Check className="h-3 w-3 mr-1" /> Approved</>
                    ) : payment.status === 'rejected' ? (
                      <><XCircle className="h-3 w-3 mr-1" /> Rejected</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payments yet. Make your first contribution!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}