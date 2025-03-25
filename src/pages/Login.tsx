import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(username, password);
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error || "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">7en.ai</div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        <h1 className="text-2xl font-semibold text-center mb-6">Log in to your account</h1>
        
        <div className="flex justify-center mb-6">
          <Tabs defaultValue="admin" className="w-auto">
            <TabsList size="xs" className="w-auto">
              <TabsTrigger value="admin" size="xs" onClick={() => setUsername('admin')}>Business Admin</TabsTrigger>
              <TabsTrigger value="superadmin" size="xs" onClick={() => setUsername('superadmin')}>Platform Admin</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
              <input 
                id="username" 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                className="h-11 pl-9 pr-4 rounded-lg border border-medium-gray/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <a href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
              <input 
                id="password" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="h-11 pl-9 pr-10 rounded-lg border border-medium-gray/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-gray hover:text-black"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-xs text-dark-gray">
              Demo credentials: 
              <ul className="mt-1 ml-4 list-disc">
                <li>Admin: username "admin" / password "123456"</li>
                <li>Platform Admin: username "superadmin" / password "123456"</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-dark-gray"
              >
                Remember me
              </label>
            </div>
          </div>
          
          <Button type="submit" className="w-full py-2 h-12" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-medium-gray">
              or
            </span>
          </div>
          
          <Button variant="outline" className="w-full">
            Sign in with SSO
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-dark-gray">
          <p>
            Don't have an account?{' '}
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
    </div>
  );
};

export default Login;
