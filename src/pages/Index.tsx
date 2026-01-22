import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Users, CreditCard, MessageCircle, Shield, ArrowRight, Heart, GraduationCap } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Droplets className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gish Abay Sekela
              <span className="block text-primary">Students Association</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Connecting students from Gish Abay Sekela. Together we support each other's academic journey.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <Button size="lg" asChild className="gap-2">
                  <Link to="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="gap-2">
                    <Link to="/auth">Join Now <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group hover:border-primary/50 transition-colors p-6">
            <CreditCard className="h-8 w-8 text-secondary mb-4" />
            <h3 className="font-bold text-lg mb-2">Easy Payments</h3>
            <p className="text-muted-foreground text-sm">Contribute via CBE or Telebirr with receipt tracking</p>
          </Card>
          <Card className="group hover:border-primary/50 transition-colors p-6">
            <MessageCircle className="h-8 w-8 text-info mb-4" />
            <h3 className="font-bold text-lg mb-2">Member Chat</h3>
            <p className="text-muted-foreground text-sm">Real-time messaging with fellow students</p>
          </Card>
          <Card className="group hover:border-primary/50 transition-colors p-6">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Secure & Transparent</h3>
            <p className="text-muted-foreground text-sm">All payments verified and tracked transparently</p>
          </Card>
        </div>
      </section>
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Gish Abay Sekela Students Association</p>
        </div>
      </footer>
    </div>
  );
}
