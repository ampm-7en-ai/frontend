import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { GOOGLE_AUTH_CONFIG, GOOGLE_OAUTH_SCOPES } from '@/utils/auth-config';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onOtpVerificationNeeded: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOtpVerificationNeeded }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, setPendingVerificationEmail, setNeedsVerification } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      
      const googleAuth = (window as any).google?.accounts?.oauth2;
      
      if (!googleAuth) {
        toast({
          title: "Google Sign-In Error",
          description: "Google authentication is not available. Please try again later.",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
        return;
      }
      
      const client = googleAuth.initTokenClient({
        client_id: GOOGLE_AUTH_CONFIG.CLIENT_ID,
        scope: GOOGLE_OAUTH_SCOPES,
        redirect_uri: GOOGLE_AUTH_CONFIG.REDIRECT_URI,
        callback: async (tokenResponse: any) => {
          console.log("Google OAuth token response:", tokenResponse);
          
          if (tokenResponse.error) {
            console.error('Google Sign-In error:', tokenResponse.error);
            toast({
              title: "Google Sign-In Failed",
              description: "There was an error signing in with Google. Please try again.",
              variant: "destructive",
            });
            setIsGoogleLoading(false);
            return;
          }
          
          try {
            const formData = new FormData();
            formData.append('sso_token', tokenResponse.access_token);
            formData.append('provider', 'google');
            
            console.log("Sending SSO request to endpoint:", API_ENDPOINTS.SSO_LOGIN);
            
            const apiUrl = getApiUrl(API_ENDPOINTS.SSO_LOGIN);
            console.log("Full API URL:", apiUrl);
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              body: formData,
            });
            
            console.log("SSO login response status:", response.status);
            
            const data = await response.json();
            console.log("Google SSO login response:", data);
            
            if (response.ok && data.data.access) {
              const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;
              
              await login(data.data.userData.username || "Google User", "", {
                accessToken: data.data.access,
                refreshToken: data.refresh || null,
                userId: data.data.user_id,
                role: userRole,
                email: data.data.userData.email || "google_user@example.com",
                isVerified: true
              });
              
              toast({
                title: "Login Successful",
                description: "Welcome back!",
                variant: "default",
              });
              
              if (userRole === 'superadmin') {
                navigate('/dashboard/superadmin');
              } else if (userRole === 'admin') {
                navigate('/dashboard/admin');
              } else {
                navigate('/dashboard');
              }
            } else if (data.error) {
              toast({
                title: "Login Failed",
                description: data.error,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Login Failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Google SSO login error:", error);
            toast({
              title: "Login Failed",
              description: "Could not complete Google sign-in. Please try again later.",
              variant: "destructive",
            });
          } finally {
            setIsGoogleLoading(false);
          }
        }
      });
      
      client.requestAccessToken();
      
    } catch (error) {
      console.error("Google Sign-In initialization error:", error);
      toast({
        title: "Google Sign-In Error",
        description: "Could not initialize Google Sign-In. Please try again later.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services script loaded');
      };
      script.onerror = () => {
        console.error('Error loading Google Identity Services script');
      };
      document.head.appendChild(script);
    };
    
    loadGoogleScript();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      
      const apiUrl = getApiUrl(API_ENDPOINTS.LOGIN);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log("Login response:", data);
      
      if (data.error && data.error.message.includes("User not verified")) {
        const email = data.error.email || values.username;
        
        setPendingVerificationEmail(email);
        setNeedsVerification(true);
        
        toast({
          title: "Account Not Verified",
          description: data.error.message,
          variant: "destructive",
        });
        
        navigate('/verify', { state: { email } });
        return;
      }
      
      if (response.ok && data.data.access) {
        const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;
        
        await login(data.data.userData.username, values.password, {
          accessToken: data.data.access,
          refreshToken: data.refresh || null,
          userId: data.data.user_id,
          email: data.data.userData.email || values.username,
          role: userRole,
          isVerified: true
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        });
        
        if (userRole === 'superadmin') {
          navigate('/dashboard/superadmin');
        } else if (userRole === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
        return;
      }
      
      if (!response.ok) {
        if (data.error.fields.non_field_errors) {
          if (data.error.fields.non_field_errors.includes("Please verify your account first")) {
            const email = data.email || values.username;
            
            setPendingVerificationEmail(email);
            setNeedsVerification(true);
            
            navigate('/verify', { state: { email } });
            
            toast({
              title: "Account Verification Required",
              description: "Please verify your account first",
              variant: "destructive",
            });
            return;
          } else if (data.error.fields.non_field_errors.includes("Invalid login credentials")) {
            form.setError("root", { 
              message: "Invalid username or password" 
            });
          } else {
            form.setError("root", { 
              message: data.error.fields.non_field_errors[0] 
            });
          }
        } else if (data.error) {
          form.setError("root", { 
            message: data.error.message 
          });
          
          toast({
            title: "Login Failed",
            description: data.error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
    } catch (error) {
      console.log("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="text-primary font-bold text-3xl">7en.ai</div>
      </div>
      
      <h1 className="text-2xl font-semibold text-center mb-6">Log in to your account</h1>
      
      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleLogin)}>
          <FormField
            control={form.control}
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
            control={form.control}
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
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full py-2 h-12"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-medium-gray">
          or
        </span>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
          <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05" />
          <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
        </svg>
        {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
      </Button>
      
      <Button variant="outline" className="w-full mt-3">
        Sign in with SSO
      </Button>
    </>
  );
};

export default LoginForm;
