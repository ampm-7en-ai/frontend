
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onOtpVerificationNeeded: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOtpVerificationNeeded }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, setPendingVerificationEmail, setNeedsVerification } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

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
      
      // Check if the response indicates the user is not verified
      if (data.error && data.error.includes("User not verified")) {
        // Extract email from the response
        const email = data.email || values.username;
        
        // Set verification status in auth context
        setPendingVerificationEmail(email);
        setNeedsVerification(true);
        
        // Show error toast with the verification message
        toast({
          title: "Account Not Verified",
          description: data.error,
          variant: "destructive",
        });
        
        // Navigate to verification page
        navigate('/verify', { state: { email } });
        return;
      }
      
      // If response is successful and contains access token, handle login
      if (response.ok && data.access) {
        const userRole = data.user_type === "business" ? "admin" : data.user_type;
        
        await login(values.username, values.password, {
          accessToken: data.access,
          refreshToken: data.refresh || null,
          userId: data.user_id,
          role: userRole,
          isVerified: true
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        });
        
        // Redirect based on user role
        if (userRole === 'superadmin') {
          navigate('/dashboard/superadmin');
        } else if (userRole === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
        return;
      }
      
      // Handle error response
      if (!response.ok) {
        if (data.non_field_errors) {
          if (data.non_field_errors.includes("Please verify your account first")) {
            // Get email from response if available
            const email = data.email || values.username;
            
            // Set verification status in auth context
            setPendingVerificationEmail(email);
            setNeedsVerification(true);
            
            // Navigate to verification page
            navigate('/verify', { state: { email } });
            
            toast({
              title: "Account Verification Required",
              description: "Please verify your account first",
              variant: "destructive",
            });
            return;
          } else if (data.non_field_errors.includes("Invalid login credentials")) {
            form.setError("root", { 
              message: "Invalid username or password" 
            });
          } else {
            form.setError("root", { 
              message: data.non_field_errors[0] 
            });
          }
        } else if (data.error) {
          // Handle generic error messages
          form.setError("root", { 
            message: data.error 
          });
          
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
        return;
      }
      
    } catch (error) {
      console.error("Login error:", error);
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
          
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium text-dark-gray cursor-pointer m-0 leading-none">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          
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
      
      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
          <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05" />
          <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </Button>
      
      <Button variant="outline" className="w-full mt-3">
        Sign in with SSO
      </Button>
    </>
  );
};

export default LoginForm;
