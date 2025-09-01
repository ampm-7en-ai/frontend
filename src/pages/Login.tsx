
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPendingVerificationEmail } = useAuth();
  const { theme } = useAppTheme();

  const handleSignupSuccess = (data: any, email: string) => {
    setPendingVerificationEmail(email);
  };
  
  const handleOtpVerificationNeeded = (email: string) => {
    setPendingVerificationEmail(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background dark:from-neutral-900 dark:via-neutral-800/30 dark:to-neutral-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 dark:bg-[hsla(0,0%,0%,0.95)] bg-gray-100"></div>
      
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-white dark:bg-[hsla(0,0%,0%,0.95)] dark:[background-image:radial-gradient(at_center_bottom,hsla(18,72%,65%,0.35)_0px,transparent_55%),radial-gradient(at_top_right,hsla(45,80%,55%,0.25)_0px,transparent_60%),radial-gradient(at_80%_0%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_87%_5%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_0%_100%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_80%_100%,hsla(0,0%,0%,0.9)_0px,transparent_50%),radial-gradient(at_0%_0%,hsla(0,0%,0%,0.9)_0px,transparent_50%)] text-white shadow-lg [background-image:none]"></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
            <div className="max-w-lg text-center space-y-8">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <img 
                    src={theme === 'dark' ? "/logo-white-new.svg" : "/logo-new.svg"} 
                    alt="7en.ai" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Advanced AI-powered chatbot platform designed to revolutionize your business communications.
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-slate-50/80 dark:bg-neutral-800/70 rounded-xl border border-slate-200/50 dark:border-neutral-600/50 shadow-sm">
                  <div className="w-12 h-12 bg-neutral-700/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Intelligent AI Agents</h3>
                    <p className="text-sm text-muted-foreground">Smart automated responses</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-slate-50/80 dark:bg-neutral-800/70 rounded-xl border border-slate-200/50 dark:border-neutral-600/50 shadow-sm">
                  <div className="w-12 h-12 bg-neutral-700/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Multi-platform Integration</h3>
                    <p className="text-sm text-muted-foreground">Connect everywhere</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 bg-slate-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-slate-200/50 dark:border-neutral-600/50 shadow-sm">
                  <div className="w-12 h-12 bg-neutral-700/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Real-time Analytics</h3>
                    <p className="text-sm text-muted-foreground">Track performance insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary rounded-xl flex items-center justify-center">
                <img 
                  src={theme === 'dark' ? "/logo-white-icon-new.svg" : "/logo-icon-new.svg"} 
                  alt="7en.ai" 
                  className="h-6 w-6"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">7en.ai</h2>
            </div>
            
            {/* Form Card */}
            <div className="dark:bg-neutral-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/20 p-8 relative overflow-hidden">
              {/* Card Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl"></div>
              
              <div className="relative z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 p-1 dark:bg-neutral-800 rounded-2xl h-12">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-xl font-medium h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="rounded-xl font-medium h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
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
            </div>
            
            {/* Footer */}
            <div className="mt-8 text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                Need help?{' '}
                <a href="/contact" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Contact Support
                </a>
              </div>
              
              <div className="text-xs text-muted-foreground space-x-4">
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <span>•</span>
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <span>•</span>
                <span>© 2023 7en.ai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
