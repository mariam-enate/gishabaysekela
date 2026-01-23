import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Target, Users, Heart, Award, BookOpen } from 'lucide-react';
import heroAbay from '@/assets/hero-abay.jpg';
import ethiopianFlag from '@/assets/ethiopian-flag.png';

const About = () => {
  const values = [
    {
      icon: Users,
      title: 'Unity',
      description: 'Bringing together students from Gish Abay Sekela to support each other.',
    },
    {
      icon: BookOpen,
      title: 'Education',
      description: 'Promoting academic excellence and continuous learning.',
    },
    {
      icon: Heart,
      title: 'Community',
      description: 'Building lasting connections and supporting our hometown.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for the highest standards in all our endeavors.',
    },
  ];

  const leadership = [
    { name: 'Abebe Kebede', role: 'President', department: 'Engineering' },
    { name: 'Tigist Hailu', role: 'Vice President', department: 'Medicine' },
    { name: 'Dawit Mengistu', role: 'Treasurer', department: 'Business' },
    { name: 'Hana Tesfaye', role: 'Secretary', department: 'Law' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroAbay})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30">
              <Droplets className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              About <span className="text-gradient-ethiopian">Our Association</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Uniting students from the sacred source of the Blue Nile
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Gish Abay Sekela Students Association is dedicated to fostering unity, 
                academic excellence, and cultural preservation among students originating 
                from Gish Abay Sekela, the sacred source of the Blue Nile (Abay).
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We strive to create a supportive community that helps members succeed 
                academically, professionally, and personally while maintaining strong 
                connections to our homeland.
              </p>
            </div>
            <div className="relative">
              <img
                src={ethiopianFlag}
                alt="Ethiopian Flag"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-float"
              />
              <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our History</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded by a group of passionate students from Gish Abay Sekela, our 
              association began with a simple goal: to support fellow students from 
              our beloved hometown. What started as informal gatherings has grown 
              into an organized community of hundreds of members across universities 
              in Ethiopia.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, we continue to honor our heritage while empowering the next 
              generation of leaders from the land where the mighty Blue Nile begins 
              its journey.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <Card key={leader.name} className="bg-card border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{leader.name}</h3>
                    <p className="text-primary font-medium">{leader.role}</p>
                    <p className="text-sm text-muted-foreground">{leader.department}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
};

export default About;
