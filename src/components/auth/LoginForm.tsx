
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import ModernButton from '@/components/dashboard/ModernButton';
import ForgotPasswordDialog from './ForgotPasswordDialog';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onOtpVerificationNeeded: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onOtpVerificationNeeded }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const targetUrl = getApiUrl(API_ENDPOINTS.LOGIN);
      
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Check if API returned a message for success
          if (data.message) {
            toast({
              title: "Login Status",
              description: data.message,
              variant: "success",
            });
          }
          
          // Handle successful login
          await login(values.email, values.password, data);
        } else {
          // Handle API error responses
          handleLoginError(data, values.email);
        }
      } catch (error) {
        console.error('Login API call failed:', error);
        
        // Fallback for development
        if (process.env.NODE_ENV === 'development') {
          await login(values.email, values.password);
          
          toast({
            title: "Development Mode",
            description: "Using simulated login for demonstration purposes",
            variant: "default",
          });
        } else {
          toast({
            title: "Connection Error",
            description: "Could not connect to login service. Please try again later.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (data: any, email: string) => {
    console.log('Login error response:', data);
    
    // Check for API message field first
    if (data.message) {
      toast({
        title: "Login Failed",
        description: data.message,
        variant: "destructive",
      });
      return;
    }
    
    // Handle specific error cases
    if (data.detail) {
      if (data.detail.includes('not verified') || data.detail.includes('verification')) {
        onOtpVerificationNeeded(email);
        toast({
          title: "Account Not Verified",
          description: "Please verify your email address to continue.",
          variant: "warning",
        });
      } else {
        toast({
          title: "Login Failed",
          description: data.detail,
          variant: "destructive",
        });
      }
    } else if (data.error) {
      // Handle nested error object
      const errorMessage = typeof data.error === 'string' ? data.error : 
                          data.error.message || 'Login failed. Please check your credentials.';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      // Generic fallback
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600">Sign in to your 7en.ai account</p>
      </div>
      
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
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
                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary/20 focus:ring-2"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          
          <ModernButton 
            type="submit" 
            variant="primary"
            size="lg"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </ModernButton>
        </form>
      </Form>
      
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default LoginForm;
