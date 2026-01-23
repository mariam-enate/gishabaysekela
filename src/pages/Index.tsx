import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Droplets, CreditCard, MessageCircle, Shield, ArrowRight, Users, Heart, Sparkles } from 'lucide-react';
import heroAbay from '@/assets/hero-abay.jpg';
import ethiopianFlag from '@/assets/ethiopian-flag.png';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroAbay})` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        {/* Ethiopian Flag Accent */}
        <div className="absolute top-8 right-8 md:top-16 md:right-16 opacity-90 animate-pulse">
          <img 
            src={ethiopianFlag} 
            alt="Ethiopian Flag" 
            className="w-16 h-16 md:w-24 md:h-24 rounded-lg shadow-2xl object-cover"
          />
        </div>

        <div className="container relative z-10 py-16">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo/Icon */}
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-1">
                  <div className="rounded-full bg-background/90 p-5">
                    <Droplets className="h-14 w-14 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title with Ethiopian colors stripe */}
            <div className="mb-8">
              <div className="inline-flex gap-1 mb-4">
                <span className="w-16 h-1.5 bg-secondary rounded-full" />
                <span className="w-16 h-1.5 bg-primary rounded-full" />
                <span className="w-16 h-1.5 bg-destructive rounded-full" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                <span className="text-foreground drop-shadow-lg">Gish Abay</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                  Sekela
                </span>
              </h1>
              <p className="mt-4 text-2xl md:text-3xl font-semibold text-secondary">
                Students Association
              </p>
            </div>

            {/* Description */}
            <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              United by our roots at the source of the Blue Nile. 
              <span className="text-foreground font-medium"> Together we support each other's academic journey</span> 
              {' '}and build a brighter future for our community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-xl hover:shadow-primary/25" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-xl hover:shadow-primary/25" asChild>
                    <Link to="/auth">
                      <Sparkles className="h-5 w-5" />
                      Join Our Community
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 backdrop-blur-sm bg-background/50" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">∞</div>
                <div className="text-sm text-muted-foreground">Unity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Us?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the power of community with our modern platform designed for Ethiopian students
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 bg-gradient-to-br from-card to-primary/5">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Easy Payments</h3>
            <p className="text-muted-foreground text-sm">
              Contribute via CBE or Telebirr with receipt tracking and instant verification
            </p>
          </Card>

          <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 bg-gradient-to-br from-card to-accent/5">
            <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-6 w-6 text-info" />
            </div>
            <h3 className="font-bold text-lg mb-2">Real-time Chat</h3>
            <p className="text-muted-foreground text-sm">
              Connect instantly with fellow students through our live messaging system
            </p>
          </Card>

          <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 bg-gradient-to-br from-card to-secondary/5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure & Transparent</h3>
            <p className="text-muted-foreground text-sm">
              All payments verified by admins and tracked transparently for the community
            </p>
          </Card>

          <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 bg-gradient-to-br from-card to-warning/5">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-bold text-lg mb-2">Strong Community</h3>
            <p className="text-muted-foreground text-sm">
              Join a growing network of students supporting each other's success
            </p>
          </Card>
        </div>
      </section>

      {/* About Gish Abay Section */}
      <section className="bg-gradient-to-r from-secondary/10 via-primary/10 to-accent/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Heritage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The Source of the <span className="text-accent">Blue Nile</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Gish Abay is a sacred place in Ethiopia where the Blue Nile (Abay) begins its journey. 
              Our association brings together students from this historic region, united by our shared 
              heritage and commitment to education. Like the mighty river that flows from our homeland, 
              we grow stronger together.
            </p>
            <div className="inline-flex gap-1">
              <span className="w-20 h-2 bg-secondary rounded-full" />
              <span className="w-20 h-2 bg-primary rounded-full" />
              <span className="w-20 h-2 bg-destructive rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="relative overflow-hidden p-8 md:p-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Our Family?
            </h2>
            <p className="text-muted-foreground mb-8">
              Become a member today and connect with fellow students from Gish Abay Sekela.
            </p>
            {!user && (
              <Button size="lg" className="gap-2 text-lg px-8 py-6" asChild>
                <Link to="/auth">
                  Get Started Now <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </Card>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
