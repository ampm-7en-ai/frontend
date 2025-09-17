import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, ChevronLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS, authApi } from '@/utils/api-config';
import { GOOGLE_AUTH_CONFIG, GOOGLE_OAUTH_SCOPES } from '@/utils/auth-config';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import ModernButton from '@/components/dashboard/ModernButton';
import { useAppTheme } from '@/hooks/useAppTheme';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Login code must be exactly 6 digits")
});

const otpLoginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type OtpLoginFormValues = z.infer<typeof otpLoginSchema>;

interface LoginFormProps {
  onOtpVerificationNeeded: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOtpVerificationNeeded }) => {
  const [emailEntered, setEmailEntered] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { login, setPendingVerificationEmail, setNeedsVerification } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useAppTheme();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  });

  const emailForm = useForm<OtpLoginFormValues>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: {
      email: '',
    }
  });


  const isValidEmail = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const handleEmailSubmit = (values: OtpLoginFormValues) => {
    setCurrentEmail(values.email);
    setEmailEntered(true);
    // Pre-fill the username field for password login
    form.setValue('username', values.email);
  };

  const handleSendOtpCode = async () => {
    setIsSendingOtp(true);
    
    try {
      const response = await authApi.codeLogin(currentEmail);
      
      if (response.ok) {
        const data = await response.json();
        setOtpEmail(currentEmail);
        setShowOtpVerification(true);
        
        toast({
          title: "Login Code Sent",
          description: data.message || "Login code sent to your email.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error?.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast({
        title: "Error",
        description: "Could not send OTP. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpCode = async (values: { otp: string }) => {
    setIsVerifyingOtp(true);
    
    try {
      const response = await authApi.verifyCodeLogin(otpEmail, values.otp);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data && data.data.userData) {
          // Check verification status
          if (!data.data.userData.is_verified) {
            setPendingVerificationEmail(otpEmail);
            setNeedsVerification(true);
            
            toast({
              title: "Account Not Verified",
              description: data.message || "Please verify your account first",
              variant: "destructive",
            });
            
            navigate('/verify', { state: { email: otpEmail } });
            return;
          }
          
          // User is verified, proceed with login
          const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;
          
          await login(data.data.userData.username, "", {
            access: data.data.access,
            refresh: data.data.refresh || null,
            user_id: data.data.user_id,
            userData: {
              username: data.data.userData.username,
              email: data.data.userData.email || otpEmail,
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
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Invalid Code",
          description: errorData.error?.message || "The login code is invalid or expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast({
        title: "Error",
        description: "Could not verify login code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  const resetOtpFlow = () => {
    setShowOtpVerification(false);
    setOtpEmail('');
  };

  const handleShowPasswordField = () => {
    setShowPasswordField(true);
  };

  const resetEmailFlow = () => {
    setEmailEntered(false);
    setCurrentEmail('');
    setShowPasswordField(false);
    setShowOtpVerification(false);
    setOtpEmail('');
    emailForm.reset();
    form.reset();
    otpForm.reset();
  };

  const handleSSOLogin = async (provider: 'google' | 'apple', token: string) => {
    try {
      const formData = new FormData();
      formData.append('sso_token', token);
      formData.append('provider', provider);
      
      console.log(`Sending ${provider.toUpperCase()} SSO request to endpoint:`, API_ENDPOINTS.SSO_LOGIN);
      
      const apiUrl = getApiUrl(API_ENDPOINTS.SSO_LOGIN+"?provider="+provider);
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
        clientId: 'com.ampmlabs.7enai.signin',
        scope: 'name email',
        redirectURI: window.location.origin+"/dashboard",
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

  //check email
  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || "");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        
      </div>

      {showOtpVerification ? (
        <div className="space-y-4">
          <div className="text-left">
            <ModernButton
                onClick={resetEmailFlow}
                variant='outline'
                size='sm'
                className="!ml-0 gap-2"
                iconOnly
              >
                <ChevronLeft className="h-4 w-4" />
              </ModernButton>
          </div>
          
      <div className="w-full p-6 bg-transparent rounded-lg">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Enter Login Code</h2>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to {otpEmail}
          </p>
        </div>
        
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtpCode)} className="space-y-6">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="mx-auto flex flex-col items-center">
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-center">
              <ModernButton 
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full"
              >
                {isVerifyingOtp ? "Verifying..." : "Login"}
              </ModernButton>
            </div>
          </form>
        </Form>
      </div>
          
        </div>
      ) : !emailEntered ? (
        /* Email Input Step */
        <Form {...emailForm}>
          <form className="space-y-4" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                      <FormLabel className="text-foreground font-medium">Email</FormLabel>
                      <button 
                        type="button" 
                        className="text-sm text-muted-foreground hover:text-foreground font-normal transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          //display password field
                        }}
                      >
                        Use password
                      </button>
                    </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="Enter your email" 
                        variant="modern"
                        size="lg"
                        className="pl-10 pr-4"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <ModernButton 
              type="submit" 
              variant="primary"
              size="lg"
              className="w-full h-11"
            >
              Get code
            </ModernButton>
          </form>
        </Form>
      ) : !showPasswordField ? (
        /* Login Options Step */
        <div className="space-y-4">
          <div className="text-center border-b border-border pb-4">
            <div className="flex flex-row-reverse items-center justify-between space-x-2 text-sm text-muted-foreground">
              <div className='flex gap-2 items-center text-foreground'>
                {isEmail(currentEmail) ? <Mail className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>{currentEmail}</span>
              </div>
              <ModernButton
                onClick={resetEmailFlow}
                variant='outline'
                size='sm'
                className="!ml-0 gap-2"
                iconOnly
              >
                <ChevronLeft className="h-4 w-4" />
              </ModernButton>
            </div>
          </div>
          
          <div className="space-y-3 flex items-center gap-3 justify-between">
            {isEmail(currentEmail) && (
              <ModernButton 
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-11"
                onClick={handleSendOtpCode}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "Sending code..." : "Send OTP Code"}
              </ModernButton>
            )}
            
            <ModernButton 
              type="button"
              variant="primary"
              size="lg"
              className="w-full h-11 !mt-0"
              onClick={handleShowPasswordField}
            >
              Enter Password
            </ModernButton>
          </div>
        </div>
      ) : (
        /* Password and OTP Options Step */
        <div className="space-y-4">
          <div className="text-center border-b border-border pb-4">
            <div className="flex flex-row-reverse items-center justify-between space-x-2 text-sm text-muted-foreground">
              <div className='flex gap-2 items-center text-foreground'>
                {
                isEmail(currentEmail) ? <Mail className="h-4 w-4" /> : <User className="h-4 w-4" />
              }
              <span>{currentEmail}</span>
              </div>
              <ModernButton
                onClick={resetEmailFlow}
                variant='outline'
                size='sm'
                className="!ml-0 gap-2"
                iconOnly
              >
                <ChevronLeft className="h-4 w-4" />
              </ModernButton>
            </div>
          </div>
          
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-foreground font-medium">Password</FormLabel>
                      <button 
                        type="button" 
                        className="text-sm text-muted-foreground hover:text-foreground font-normal transition-colors"
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
                          className="pl-10 pr-10"
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
              
              <div className="space-y-3">
                <ModernButton 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  className="w-full h-11"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </ModernButton>
                
                
              </div>
            </form>
          </Form>
        </div>
      )}
      
      {!showOtpVerification && !emailEntered && (
        <>
          <div className="relative">
            <Separator className="bg-neutral-400/10" />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:bg-neutral-900 bg-gray-100 px-3 text-sm text-muted-foreground mr-1">
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
              <svg fill={theme === "dark" ? "#ffffff" : "#000000"} width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{marginRight:"4px"}}>
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              {isAppleLoading ? "Signing in..." : "Sign in with Apple"}
            </ModernButton>
          </div>
        </>
      )}

      <ForgotPasswordDialog 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default LoginForm;
