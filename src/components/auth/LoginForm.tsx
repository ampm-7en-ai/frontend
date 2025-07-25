import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { GOOGLE_AUTH_CONFIG, GOOGLE_OAUTH_SCOPES } from '@/utils/auth-config';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import ModernButton from '@/components/dashboard/ModernButton';

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
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
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
                access: data.data.access,
                refresh: data.refresh || null,
                user_id: data.data.user_id,
                userData: {
                  username: data.data.userData.username,
                  email: data.data.userData.email || "google_user@example.com",
                  avatar: data.data.userData.avatar,
                  team_role: data.data.userData.team_role || null,
                  user_role: userRole,
                  permissions: data.data.userData.permissions || {},
                  is_verified: true
                }
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
      
      if (!data.data.userData.is_verified) {
        const email = data.data.userData.email || null;
        
        setPendingVerificationEmail(email);
        setNeedsVerification(true);
        
        toast({
          title: "Account Not Verified",
          description: data.message,
          variant: "destructive",
        });
        
        navigate('/verify', { state: { email } });
        return;
      }
      
      if (response.ok && data.data.access) {
        const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;
        
        await login(data.data.userData.username, values.password, {
          access: data.data.access,
          refresh: data.data.refresh || null,
          user_id: data.data.user_id,
          userData: {
            username: data.data.userData.username,
            email: data.data.userData.email || values.username,
            avatar: data.data.userData.avatar,
            team_role: data.data.userData.team_role || null,
            user_role: userRole,
            permissions: data.data.userData.permissions || {},
            is_verified: true
          }
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        });
        
        if (userRole === 'SUPERADMIN') {
          navigate('/dashboard/superadmin');
        } else if (userRole === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
        return;
      }
      
      if (!response.ok) {
        if (data.error.message) {
          if (data.error.message === "Please verify your account first") {
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
          } else if (data.error.message === "Invalid username or password") {
            form.setError("root", { 
              message: "Invalid username or password" 
            });
          } else {
            form.setError("root", { 
              message: data.error.message 
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>
      
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      variant="modern"
                      size="lg"
                      className="pl-12 pr-4"
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
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                  <button 
                    type="button" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPasswordOpen(true);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      variant="modern"
                      size="lg"
                      className="pl-12 pr-12"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">
              {form.formState.errors.root.message}
            </div>
          )}
          
          <ModernButton 
            type="submit" 
            variant="primary"
            size="lg"
            className="w-full h-11"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </ModernButton>
        </form>
      </Form>
      
      <div className="relative">
        <Separator className="bg-gray-200" />
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
          or continue with
        </span>
      </div>
      
      <div className="space-y-3">
        <ModernButton 
          variant="outline" 
          size="lg"
          className="w-full h-11"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05" />
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
          </svg>
          {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
        </ModernButton>
        
        <ModernButton 
          variant="outline" 
          size="lg"
          className="w-full h-11"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
          </svg>
          Sign in with SSO
        </ModernButton>
      </div>

      <ForgotPasswordDialog 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default LoginForm;
