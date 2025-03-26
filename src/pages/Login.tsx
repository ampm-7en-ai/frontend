
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Globe, Building, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

const signupSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone_number: z.string().min(10, "Valid phone number is required"),
  website: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      business_name: '',
      email: '',
      password: '',
      phone_number: '',
      website: '',
      address: '',
      username: '',
      terms: false
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await login(values.username, values.password);
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error || "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('bussiness_name', values.business_name);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('phone_number', values.phone_number);
      formData.append('website', values.website || '');
      formData.append('address', values.address);
      formData.append('username', values.username);

      const response = await fetch('https://7en.ai/api/users/register/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setRegistrationResponse(data);
      
      if (response.ok) {
        setVerificationOpen(true);
        toast({
          title: "Registration Successful",
          description: "Please check your email for verification",
          variant: "default",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Please check your information and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">7en.ai</div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <h1 className="text-2xl font-semibold text-center mb-6">Log in to your account</h1>
            
            <div className="flex justify-center mb-6">
              <Tabs defaultValue="admin" className="w-auto">
                <TabsList size="xs" className="w-auto">
                  <TabsTrigger value="admin" size="xs" onClick={() => loginForm.setValue('username', 'admin')}>Business Admin</TabsTrigger>
                  <TabsTrigger value="superadmin" size="xs" onClick={() => loginForm.setValue('username', 'superadmin')}>Platform Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Form {...loginForm}>
              <form className="space-y-5" onSubmit={loginForm.handleSubmit(handleLogin)}>
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Username</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            className="h-11 pl-9 pr-4" 
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex justify-between">
                        <FormLabel>Password</FormLabel>
                        <a href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="h-11 pl-9 pr-10" 
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-gray hover:text-black"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-xs text-dark-gray">
                  Demo credentials: 
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Admin: username "admin" / password "123456"</li>
                    <li>Platform Admin: username "superadmin" / password "123456"</li>
                  </ul>
                </div>
                
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-dark-gray cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full py-2 h-12" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-medium-gray">
                or
              </span>
            </div>
            
            <Button variant="outline" className="w-full">
              Sign in with SSO
            </Button>
          </TabsContent>
          
          <TabsContent value="signup">
            <h1 className="text-2xl font-semibold text-center mb-6">Create your account</h1>
            
            <Form {...signupForm}>
              <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
                <FormField
                  control={signupForm.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                        <FormControl>
                          <Input 
                            placeholder="Your Business Name" 
                            className="pl-9" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                          <FormControl>
                            <Input 
                              placeholder="username" 
                              className="pl-9" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="email@example.com" 
                              className="pl-9" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                          <FormControl>
                            <Input 
                              type={showSignupPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-9 pr-10" 
                              {...field} 
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-gray hover:text-black"
                          >
                            {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                          <FormControl>
                            <Input 
                              placeholder="+1234567890" 
                              className="pl-9" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={signupForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                        <FormControl>
                          <Input 
                            placeholder="www.example.com" 
                            className="pl-9" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                        <FormControl>
                          <Input 
                            placeholder="Business Address" 
                            className="pl-9" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 mt-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="grid gap-1 leading-none">
                        <FormLabel className="text-sm font-medium text-dark-gray cursor-pointer">
                          I agree to the 
                          <a href="/terms" className="text-primary hover:underline ml-1">
                            Terms of Service
                          </a> and 
                          <a href="/privacy" className="text-primary hover:underline ml-1">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-12 mt-6" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-sm text-dark-gray">
          <p>
            Need help?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>
        
        <div className="mt-8 text-center text-xs text-medium-gray">
          <p>© 2023 7en.ai. All rights reserved.</p>
          <div className="mt-1 space-x-2">
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
            <span>·</span>
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
      
      {/* Email Verification Dialog */}
      <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription>
              We've sent a verification email to {signupForm.getValues().email}. 
              Please check your inbox and follow the instructions to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-md text-sm">
            <p className="font-semibold mb-2">Registration Details:</p>
            {registrationResponse && (
              <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-xs">
                {JSON.stringify(registrationResponse, null, 2)}
              </pre>
            )}
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => setVerificationOpen(false)}
              variant="default"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
