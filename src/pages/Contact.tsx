import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Send, 
  Instagram, 
  Facebook, 
  Clock,
  MessageCircle 
} from 'lucide-react';
import heroAbay from '@/assets/hero-abay.jpg';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Message Sent! ✉️',
      description: 'Thank you for reaching out. We will get back to you soon.',
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'gishabaysekela@gmail.com',
      href: 'mailto:gishabaysekela@gmail.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+251 91 234 5678',
      href: 'tel:+251912345678',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Gish Abay, West Gojjam, Amhara',
      href: null,
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: 'Within 24 hours',
      href: null,
    },
  ];

  const socialLinks = [
    {
      icon: Send,
      label: 'Telegram',
      href: 'https://t.me/gishabaysekela',
      color: 'text-primary',
      bg: 'bg-primary/10 hover:bg-primary/20',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      href: 'https://instagram.com/gishabaysekela',
      color: 'text-accent',
      bg: 'bg-accent/10 hover:bg-accent/20',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      href: 'https://facebook.com/gishabaysekela',
      color: 'text-info',
      bg: 'bg-info/10 hover:bg-info/20',
    },
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
              <MessageCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Get in <span className="text-gradient-ethiopian">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              We'd love to hear from you. Reach out with any questions or suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-card/50 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Abebe Kebede"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="abebe@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="bg-background/50 resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="grid gap-4">
                  {contactInfo.map((info) => (
                    <Card key={info.label} className="bg-card/50 border-primary/20">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{info.label}</p>
                          {info.href ? (
                            <a 
                              href={info.href} 
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="font-medium">{info.value}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${social.bg} transition-colors`}
                    >
                      <social.icon className={`h-6 w-6 ${social.color}`} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <Card className="bg-card/50 border-primary/20 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-secondary via-secondary/80 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="font-medium">Gish Abay, West Gojjam</p>
                    <p className="text-sm text-muted-foreground">Source of the Blue Nile 🇪🇹</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
};

export default Contact;
