
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPendingVerificationEmail } = useAuth();

  const handleSignupSuccess = (data: any, email: string) => {
    // Just handle setting the email, navigation happens in the SignupForm
    setPendingVerificationEmail(email);
  };
  
  const handleOtpVerificationNeeded = (email: string) => {
    // Just handle setting the email, navigation happens in the LoginForm
    setPendingVerificationEmail(email);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%231e52f1" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8">
            <img src="/logo.svg" alt="7en.ai" className="h-16 mx-auto mb-6"/>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to 7en.ai
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Advanced AI-powered chatbot platform designed to revolutionize your business communications and customer engagement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Intelligent AI Agents</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Multi-platform Integration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Real-time Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/logo.svg" alt="7en.ai" className="h-12"/>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 p-1 bg-gray-50 rounded-xl">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-0">
                <LoginForm onOtpVerificationNeeded={handleOtpVerificationNeeded} />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-0">
                <SignupForm onSignupSuccess={handleSignupSuccess} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Footer links */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/contact" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Contact Support
              </a>
            </div>
            
            <div className="text-xs text-gray-500 space-x-4">
              <a href="/terms" className="hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <span>© 2023 7en.ai</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
