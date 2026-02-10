import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Droplets, Users, LogIn, UserPlus } from 'lucide-react';
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
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    department: '',
    customDepartment: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
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
    
    // Determine if identifier is email or phone
    const identifier = loginData.identifier.trim();
    const isEmail = identifier.includes('@');
    
    let loginEmail = identifier;
    if (!isEmail) {
      // Phone login: use phone@placeholder format
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
    
    // Use email if provided, otherwise create phone-based email
    const email = signupData.email.trim() || `${signupData.phone.replace(/[^0-9]/g, '')}@phone.local`;
    
    const { error } = await signUp(
      email,
      signupData.password,
      signupData.fullName,
      signupData.phone,
      department
    );
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
      <div className="fixed inset-0 bg-background/85 backdrop-blur-sm -z-10" />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
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

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-2"><LogIn className="h-4 w-4" />Login</TabsTrigger>
                <TabsTrigger value="signup" className="gap-2"><UserPlus className="h-4 w-4" />Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
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
                        className={errors.identifier ? 'border-destructive' : ''}
                      />
                      {errors.identifier && <p className="text-sm text-destructive">{errors.identifier}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
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
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className={errors.confirmPassword ? 'border-destructive' : ''}
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

      <Footer />
    </div>
  );
}
