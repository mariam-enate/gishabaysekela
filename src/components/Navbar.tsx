import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Droplets, User, LogOut, Shield, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-none">Gish Abay Sekela</h1>
            <p className="text-xs text-muted-foreground">Students Association</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
                  <Link to="/admin">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && (
                        <p className="font-medium">{profile.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}