import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { Settings as SettingsIcon, User, Lock, ArrowLeft, Camera } from 'lucide-react';
import { useEffect } from 'react';
import { ImageCropper } from '@/components/ImageCropper';

export default function Settings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar cropping state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setDepartment(profile.department || '');
    }
  }, [user, profile, loading, navigate]);

  // Load avatar URL
  useEffect(() => {
    if (user) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/avatar.jpg`);
      // Check if avatar exists by appending a timestamp to bust cache
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
    const fileName = `${user!.id}/avatar.jpg`;
    
    // Try to remove old avatar first (ignore errors)
    await supabase.storage.from('avatars').remove([fileName]);
    
    const { error } = await supabase.storage.from('avatars').upload(fileName, blob, {
      upsert: true,
      contentType: 'image/jpeg',
    });

    if (error) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Update profile with avatar URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user!.id);
    
    setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    toast({ title: 'Profile photo updated!' });
    refreshProfile();
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, department }).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Profile updated successfully' }); refreshProfile(); },
    onError: (error) => { toast({ title: 'Failed to update profile', description: error.message, variant: 'destructive' }); },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
      if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: 'Password updated successfully' }); setNewPassword(''); setConfirmPassword(''); },
    onError: (error) => { toast({ title: 'Failed to update password', description: error.message, variant: 'destructive' }); },
  });

  const handleProfileSubmit = (e: React.FormEvent) => { e.preventDefault(); updateProfileMutation.mutate(); };
  const handlePasswordSubmit = (e: React.FormEvent) => { e.preventDefault(); updatePasswordMutation.mutate(); };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container py-8 flex-1">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 max-w-2xl">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />Profile Photo
              </CardTitle>
              <CardDescription>Upload and crop your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-28 w-28 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-2xl bg-primary/10">{getInitials(fullName || 'U')}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full">
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
                </div>
                <Button type="submit" disabled={updatePasswordMutation.isPending} className="w-full">
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onClose={() => setCropperOpen(false)}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
