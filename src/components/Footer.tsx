import { Send, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Social Links - Bottom Left */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">Connect with us</p>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/gishabaysekela"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm hidden sm:inline">Telegram</span>
              </a>
              <a
                href="https://instagram.com/gishabaysekela"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Instagram className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm hidden sm:inline">Instagram</span>
              </a>
              <a
                href="https://facebook.com/gishabaysekela"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-info transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-info/10 group-hover:bg-info/20 transition-colors">
                  <Facebook className="h-4 w-4 text-info" />
                </div>
                <span className="text-sm hidden sm:inline">Facebook</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-left md:text-right">
            <p>© {new Date().getFullYear()} Gish Abay Sekela Students Association</p>
            <p className="text-xs mt-1">Connecting students, building futures 🇪🇹</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
