import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Droplets, Users, LogIn, UserPlus, ArrowLeft, KeyRound } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { supabase } from '@/integrations/supabase/client';
import heroAbay from '@/assets/hero-abay.jpg';
import ethiopianFlag from '@/assets/ethiopian-flag.png';

const DEPARTMENTS = [
  'Computer Science', 'Data Science', 'IT', 'Software Engineering',
  'Information Systems (IS)', 'Mechanical Engineering', 'Chemical Engineering',
  'Electrical Engineering', 'Industrial Engineering', 'Food Engineering',
  'Civil Engineering', 'Management', 'Accounting', 'Marketing', 'NARM',
  'Biotechnology', 'Geology', 'Medicine', 'Pediatrics', 'Nursing',
  'Pharmacy', 'Health Officer (HO)', 'Medical Laboratory',
];

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  department: z.string().min(2, 'Department is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', phone: '', department: '', customDepartment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotData, setForgotData] = useState({ identifier: '', password: '', confirmPassword: '' });
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const identifier = loginData.identifier.trim();
    const isEmail = identifier.includes('@');
    let loginEmail = identifier;
    if (!isEmail) {
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      loginEmail = `${cleanPhone}@phone.local`;
    }

    const { error } = await signIn(loginEmail, loginData.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email/phone or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const department = signupData.department === 'Other'
      ? signupData.customDepartment
      : signupData.department;

    const dataToValidate = { ...signupData, department };

    const result = signupSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (signupData.department === 'Other' && !signupData.customDepartment.trim()) {
      setErrors({ customDepartment: 'Please enter your department' });
      return;
    }

    setIsLoading(true);
    const email = signupData.email.trim() || `${signupData.phone.replace(/[^0-9]/g, '')}@phone.local`;

    const { error } = await signUp(email, signupData.password, signupData.fullName, signupData.phone, department);
    setIsLoading(false);

    if (error) {
      const errorMessage = error.message.includes('already registered')
        ? 'This email/phone is already registered. Please login instead.'
        : error.message;
      toast({ title: 'Registration Failed', description: errorMessage, variant: 'destructive' });
    } else {
      toast({ title: 'Registration Successful!', description: 'Welcome to Gish Abay Sekela Students Association!' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10" style={{ backgroundImage: `url(${heroAbay})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-background/90 via-background/80 to-[hsl(var(--secondary))]/20 backdrop-blur-sm -z-10" />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Back to Home */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-foreground/80 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />Back to Home
            </Button>
          </Link>
        </div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-90">
          <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-xl object-cover" />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Droplets className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Gish Abay Sekela</h1>
            <p className="text-muted-foreground mt-1">Students Association</p>
            <div className="inline-flex gap-1 mt-3">
              <span className="w-8 h-1 bg-secondary rounded-full" />
              <span className="w-8 h-1 bg-primary rounded-full" />
              <span className="w-8 h-1 bg-destructive rounded-full" />
            </div>
          </div>

          <Card className="shadow-2xl bg-card/90 backdrop-blur-md border-2 border-transparent" style={{
            borderImage: 'linear-gradient(135deg, hsl(142 52% 36%), hsl(45 93% 47%), hsl(0 84% 60%)) 1',
          }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="gap-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LogIn className="h-4 w-4" />Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus className="h-4 w-4" />Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-in fade-in-50 duration-300">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login with your email or phone number</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-identifier">Email or Phone Number</Label>
                      <Input
                        id="login-identifier"
                        placeholder="your@email.com or 0912345678"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                        autoComplete="off"
                        className={errors.identifier ? 'border-destructive' : ''}
                      />
                      {errors.identifier && <p className="text-sm text-destructive">{errors.identifier}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <PasswordInput
                        id="login-password"
                        value={loginData.password}
                        onChange={(v) => setLoginData({ ...loginData, password: v })}
                        placeholder="••••••••"
                        show={showLoginPassword}
                        onToggle={() => setShowLoginPassword(!showLoginPassword)}
                        error={errors.password}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup" className="animate-in fade-in-50 duration-300">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join the Gish Abay Sekela Students Association</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name *</Label>
                      <Input
                        id="signup-name"
                        placeholder="Abebe Kebede"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        className={errors.fullName ? 'border-destructive' : ''}
                      />
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number *</Label>
                      <Input
                        id="signup-phone"
                        placeholder="0912345678"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-department">Department *</Label>
                      <Select
                        value={signupData.department}
                        onValueChange={(val) => setSignupData({ ...signupData, department: val })}
                      >
                        <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50 max-h-60">
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                    </div>
                    {signupData.department === 'Other' && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-custom-dept">Enter Your Department *</Label>
                        <Input
                          id="signup-custom-dept"
                          placeholder="Your department name"
                          value={signupData.customDepartment}
                          onChange={(e) => setSignupData({ ...signupData, customDepartment: e.target.value })}
                          className={errors.customDepartment ? 'border-destructive' : ''}
                        />
                        {errors.customDepartment && <p className="text-sm text-destructive">{errors.customDepartment}</p>}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email (Optional)</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <PasswordInput
                        id="signup-password"
                        value={signupData.password}
                        onChange={(v) => setSignupData({ ...signupData, password: v })}
                        placeholder="••••••••"
                        show={showSignupPassword}
                        onToggle={() => setShowSignupPassword(!showSignupPassword)}
                        error={errors.password}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                      <PasswordInput
                        id="signup-confirm-password"
                        value={signupData.confirmPassword}
                        onChange={(v) => setSignupData({ ...signupData, confirmPassword: v })}
                        placeholder="••••••••"
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        error={errors.confirmPassword}
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Users className="inline h-4 w-4 mr-1" />
            Connecting students from Gish Abay Sekela
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Reset Password
              </CardTitle>
              <CardDescription>Enter your registered email or phone and set a new password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setErrors({});

                  const id = forgotData.identifier.trim();
                  if (!id) { setErrors({ forgotIdentifier: 'Email or phone is required' }); return; }
                  if (forgotData.password.length < 6) { setErrors({ forgotPassword: 'Password must be at least 6 characters' }); return; }
                  if (forgotData.password !== forgotData.confirmPassword) { setErrors({ forgotConfirm: 'Passwords do not match' }); return; }

                  setIsLoading(true);

                  try {
                    const response = await supabase.functions.invoke('reset-password', {
                      body: { identifier: id, newPassword: forgotData.password },
                    });

                    if (response.error || response.data?.error) {
                      const msg = response.data?.error || response.error?.message || 'Failed to reset password';
                      toast({ title: 'Error', description: msg, variant: 'destructive' });
                      setIsLoading(false);
                      return;
                    }

                    // Password updated — now sign them in automatically
                    const isEmail = id.includes('@');
                    const loginEmail = isEmail ? id : `${id.replace(/[^0-9]/g, '')}@phone.local`;
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                      email: loginEmail,
                      password: forgotData.password,
                    });

                    setIsLoading(false);
                    setShowForgotPassword(false);
                    setForgotData({ identifier: '', password: '', confirmPassword: '' });

                    if (signInError) {
                      toast({ title: 'Password Updated', description: 'Your password has been reset. Please log in with your new password.' });
                    } else {
                      toast({ title: 'Success!', description: 'Password reset and logged in successfully.' });
                      navigate('/dashboard');
                    }
                  } catch (err) {
                    setIsLoading(false);
                    toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot-identifier">Email or Phone Number</Label>
                  <Input
                    id="forgot-identifier"
                    placeholder="your@email.com or 0912345678"
                    value={forgotData.identifier}
                    onChange={(e) => setForgotData({ ...forgotData, identifier: e.target.value })}
                    autoComplete="off"
                    className={errors.forgotIdentifier ? 'border-destructive' : ''}
                  />
                  {errors.forgotIdentifier && <p className="text-sm text-destructive">{errors.forgotIdentifier}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-new-password">New Password</Label>
                  <PasswordInput
                    id="forgot-new-password"
                    value={forgotData.password}
                    onChange={(v) => setForgotData({ ...forgotData, password: v })}
                    placeholder="••••••••"
                    show={showForgotNewPassword}
                    onToggle={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    error={errors.forgotPassword}
                  />
                  {errors.forgotPassword && <p className="text-sm text-destructive">{errors.forgotPassword}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-confirm-password">Confirm New Password</Label>
                  <PasswordInput
                    id="forgot-confirm-password"
                    value={forgotData.confirmPassword}
                    onChange={(v) => setForgotData({ ...forgotData, confirmPassword: v })}
                    placeholder="••••••••"
                    show={showForgotConfirmPassword}
                    onToggle={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    error={errors.forgotConfirm}
                  />
                  {errors.forgotConfirm && <p className="text-sm text-destructive">{errors.forgotConfirm}</p>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowForgotPassword(false); setErrors({}); }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
