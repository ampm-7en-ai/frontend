
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
    setPendingVerificationEmail(email);
  };
  
  const handleOtpVerificationNeeded = (email: string) => {
    setPendingVerificationEmail(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
            <div className="max-w-lg text-center space-y-8">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <img src="/logo.svg" alt="7en.ai" className="h-8 w-8"/>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to 7en.ai
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Advanced AI-powered chatbot platform designed to revolutionize your business communications.
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Intelligent AI Agents</h3>
                    <p className="text-sm text-gray-600">Smart automated responses</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Multi-platform Integration</h3>
                    <p className="text-sm text-gray-600">Connect everywhere</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
                    <p className="text-sm text-gray-600">Track performance insights</p>
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
                <img src="/logo.svg" alt="7en.ai" className="h-6 w-6"/>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">7en.ai</h2>
            </div>
            
            {/* Form Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              {/* Card Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl"></div>
              
              <div className="relative z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 p-1 bg-gray-100/80 rounded-2xl h-12">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-xl font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="rounded-xl font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
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
    </div>
  );
};

export default Login;
