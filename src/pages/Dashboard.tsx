import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PaymentSection } from '@/components/PaymentSection';
import { ChatSection } from '@/components/ChatSection';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}!</h1>
          <p className="text-muted-foreground">
            Manage your membership and connect with fellow students
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Payment Section */}
          <div>
            <PaymentSection />
          </div>

          {/* Chat Section */}
          <div>
            <ChatSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}