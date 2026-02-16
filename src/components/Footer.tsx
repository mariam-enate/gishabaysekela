import { useState } from 'react';
import { Send, Instagram, Facebook, MapPin, Heart } from 'lucide-react';
import { TelegramPaymentModal } from '@/components/TelegramPaymentModal';

export function Footer() {
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  return (
    <footer className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 border-t-4 border-primary py-10">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Social Links - Bottom Left */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold text-foreground">Connect with us</p>
            </div>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setTelegramModalOpen(true)}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-300 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 group-hover:from-primary group-hover:to-primary/80 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 border border-primary/20">
                  <Send className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Telegram</span>
              </button>
              <a
                href="https://instagram.com/frekal21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-accent transition-all duration-300 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 group-hover:from-accent group-hover:to-accent/80 group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300 border border-accent/20">
                  <Instagram className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Instagram</span>
              </a>
              <a
                href="https://facebook.com/frekal21"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-info transition-all duration-300 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-info/30 to-info/10 group-hover:from-info group-hover:to-info/80 group-hover:shadow-lg group-hover:shadow-info/30 transition-all duration-300 border border-info/20">
                  <Facebook className="h-5 w-5 text-info group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Facebook</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-foreground">© {new Date().getFullYear()} Gish Abay Sekela Students Association</p>
            <p className="text-xs mt-2 text-muted-foreground flex items-center gap-1 justify-start md:justify-end">
              Made with <Heart className="h-3 w-3 text-destructive fill-destructive animate-pulse" /> in Ethiopia 🇪🇹
            </p>
          </div>
        </div>
      </div>

      <TelegramPaymentModal open={telegramModalOpen} onOpenChange={setTelegramModalOpen} />
    </footer>
  );
}
