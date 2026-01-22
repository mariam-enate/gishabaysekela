import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { PaymentSection } from '@/components/PaymentSection';
import { ChatSection } from '@/components/ChatSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, GraduationCap, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(' ')[0] || 'Member'}!</h1>
          <p className="text-muted-foreground">
            Manage your membership and connect with fellow students
          </p>
        </div>

        {/* Profile Summary */}
        {profile && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                    <Phone className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{profile.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
                    <Mail className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
    </div>
  );
}