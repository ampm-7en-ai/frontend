
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPendingVerificationEmail } = useAuth();

  // Use useCallback to memoize these handlers and prevent unnecessary re-renders
  const handleSignupSuccess = useCallback((data: any, email: string) => {
    // Just handle setting the email, navigation happens in the SignupForm
    setPendingVerificationEmail(email);
  }, [setPendingVerificationEmail]);
  
  const handleOtpVerificationNeeded = useCallback((email: string) => {
    // Set the pending verification email and navigate to verification page
    setPendingVerificationEmail(email);
    navigate('/verify', { state: { email: email } });
  }, [setPendingVerificationEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">7en.ai</div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        <div className="p-8 bg-white rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onOtpVerificationNeeded={handleOtpVerificationNeeded} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignupSuccess={handleSignupSuccess} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-dark-gray">
            <p>
              Need help?{' '}
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
    </div>
  );
};

export default Login;
