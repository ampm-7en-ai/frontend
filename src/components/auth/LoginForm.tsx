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
  const [isAppleLoading, setIsAppleLoading] = useState(false);
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

  const handleSSOLogin = async (provider: 'google' | 'apple', token: string) => {
    try {
      const formData = new FormData();
      formData.append('sso_token', token);
      formData.append('provider', provider);
      
      console.log(`Sending ${provider.toUpperCase()} SSO request to endpoint:`, API_ENDPOINTS.SSO_LOGIN);
      
      const apiUrl = getApiUrl(API_ENDPOINTS.SSO_LOGIN);
      console.log("Full API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`${provider.toUpperCase()} SSO login response status:`, response.status);
      
      const data = await response.json();
      console.log(`${provider.toUpperCase()} SSO login response:`, data);
      
      if (response.ok && data.data.access) {
        const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;
        
        await login(data.data.userData.username || `${provider} User`, "", {
          access: data.data.access,
          refresh: data.refresh || null,
          user_id: data.data.user_id,
          userData: {
            username: data.data.userData.username,
            email: data.data.userData.email || `${provider}_user@example.com`,
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
      console.error(`${provider.toUpperCase()} SSO login error:`, error);
      toast({
        title: "Login Failed",
        description: `Could not complete ${provider} sign-in. Please try again later.`,
        variant: "destructive",
      });
    }
  };

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
        redirect_uris: GOOGLE_AUTH_CONFIG.REDIRECT_URI,
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
          
          await handleSSOLogin('google', tokenResponse.access_token);
          setIsGoogleLoading(false);
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

  const handleAppleLogin = async () => {
    try {
      setIsAppleLoading(true);
      
      const AppleID = (window as any).AppleID;
      
      if (!AppleID) {
        toast({
          title: "Apple Sign-In Error",
          description: "Apple authentication is not available. Please try again later.",
          variant: "destructive",
        });
        setIsAppleLoading(false);
        return;
      }
      
      AppleID.auth.init({
        clientId: 'com.7en.ai.web',
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true
      });
      
      const data = await AppleID.auth.signIn();
      console.log("Apple OAuth response:", data);
      
      if (data.authorization && data.authorization.id_token) {
        await handleSSOLogin('apple', data.authorization.id_token);
      } else {
        toast({
          title: "Apple Sign-In Failed",
          description: "Could not get authentication token from Apple.",
          variant: "destructive",
        });
      }
      
      setIsAppleLoading(false);
      
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);
      
      // Don't show error for user cancellation
      if (error.error !== 'popup_closed_by_user') {
        toast({
          title: "Apple Sign-In Error",
          description: "Could not complete Apple sign-in. Please try again later.",
          variant: "destructive",
        });
      }
      
      setIsAppleLoading(false);
    }
  };

  useEffect(() => {
    const loadScripts = () => {
      // Load Google Script
      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;
      googleScript.onload = () => {
        console.log('Google Identity Services script loaded');
      };
      googleScript.onerror = () => {
        console.error('Error loading Google Identity Services script');
      };
      document.head.appendChild(googleScript);
      
      // Load Apple Script
      const appleScript = document.createElement('script');
      appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      appleScript.async = true;
      appleScript.defer = true;
      appleScript.onload = () => {
        console.log('Apple ID Services script loaded');
      };
      appleScript.onerror = () => {
        console.error('Error loading Apple ID Services script');
      };
      document.head.appendChild(appleScript);
    };
    
    loadScripts();
    
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
      
      // Check if we have a successful response with data
      if (response.ok && data.data && data.data.userData) {
        // Check verification status
        if (!data.data.userData.is_verified) {
          const email = data.data.userData.email || null;
          
          setPendingVerificationEmail(email);
          setNeedsVerification(true);
          
          toast({
            title: "Account Not Verified",
            description: data.message || "Please verify your account first",
            variant: "destructive",
          });
          
          navigate('/verify', { state: { email } });
          return;
        }
        
        // User is verified, proceed with login
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
      
      // Handle error responses
      if (!response.ok) {
        // Check for error in response data
        if (data.error && data.error.message) {
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
        } else if (data.message) {
          // Use the message from the response
          form.setError("root", { 
            message: data.message 
          });
          
          toast({
            title: "Login Failed",
            description: data.message,
            variant: "destructive",
          });
        } else {
          // Fallback error message
          toast({
            title: "Login Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // If we reach here, something unexpected happened
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
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
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>
      
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Username</FormLabel>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
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
                  <FormLabel className="text-foreground font-medium">Password</FormLabel>
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
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
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
        <Separator className="bg-border" />
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
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
          onClick={handleAppleLogin}
          disabled={isAppleLoading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M13.604 7.379c-.028-2.721 2.227-4.027 2.327-4.088-1.267-1.853-3.24-2.108-3.943-2.137-1.678-.169-3.271 0.987-4.123 0.987-0.851 0-2.169-0.963-3.565-0.936-1.835 0.028-3.523 1.066-4.466 2.71-1.903 3.299-0.487 8.188 1.367 10.864 0.907 1.31 1.991 2.779 3.414 2.723 1.395-0.055 1.921-0.901 3.607-0.901 1.686 0 2.184 0.901 3.565 0.873 1.471-0.028 2.423-1.331 3.33-2.64 1.05-1.513 1.481-2.987 1.509-3.064-0.028-0.014-2.89-1.108-2.918-4.39z" fill="currentColor"/>
            <path d="M11.652 3.123c0.752-0.914 1.267-2.178 1.128-3.44-1.094 0.042-2.422 0.732-3.205 1.647-0.702 0.817-1.323 2.122-1.156 3.358 1.225 0.098 2.478-0.619 3.232-1.564z" fill="currentColor"/>
          </svg>
          {isAppleLoading ? "Signing in..." : "Sign in with Apple"}
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
