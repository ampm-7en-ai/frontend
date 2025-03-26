import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { login } = useAuth();
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
      
      if (!response.ok) {
        if (data.non_field_errors) {
          if (data.non_field_errors.includes("Please verify your account first")) {
            const email = `${values.username}@example.com`;
            onOtpVerificationNeeded(email);
            
            toast({
              title: "Account Verification Required",
              description: "Please verify your account first",
              variant: "default",
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
        } else {
          toast({
            title: "Login Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      if (data.access && data.user_type) {
        const userRole = data.user_type === "business" ? "admin" : data.user_type;
        
        await login(values.username, values.password, {
          accessToken: data.access,
          refreshToken: data.refresh,
          userId: data.user_id,
          role: userRole
        });
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default",
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
      
      if (process.env.NODE_ENV === 'development') {
        if (values.username === 'admin' || values.username === 'superadmin') {
          const role = values.username === 'admin' ? 'admin' : 'superadmin';
          
          await login(values.username, values.password, {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token',
            userId: role === 'admin' ? 2 : 1,
            role: role
          });
          
          toast({
            title: "Development Mode Login",
            description: `Logged in as ${role}`,
            variant: "default",
          });
          
          navigate('/dashboard');
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">Log in to your account</h1>
      
      <div className="flex justify-center mb-6">
        <Tabs defaultValue="admin" className="w-auto">
          <TabsList size="xs" className="w-auto">
            <TabsTrigger value="admin" size="xs" onClick={() => form.setValue('username', 'admin')}>Business Admin</TabsTrigger>
            <TabsTrigger value="superadmin" size="xs" onClick={() => form.setValue('username', 'superadmin')}>Platform Admin</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
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
          
          <div className="text-xs text-dark-gray">
            Demo credentials: 
            <ul className="mt-1 ml-4 list-disc">
              <li>Admin: username "admin" / password "123456"</li>
              <li>Platform Admin: username "superadmin" / password "123456"</li>
            </ul>
          </div>
          
          <FormField
            control={form.control}
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
      
      <Button variant="outline" className="w-full">
        Sign in with SSO
      </Button>
    </>
  );
};

export default LoginForm;
