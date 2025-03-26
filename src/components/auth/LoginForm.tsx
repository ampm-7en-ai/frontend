
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
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuth();
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
          
          <Button type="submit" className="w-full py-2 h-12">
            Sign in
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
