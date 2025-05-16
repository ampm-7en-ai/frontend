
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { setPendingVerificationEmail } = useAuth();
  
  // Get the redirect URL from query params if it exists
  const redirectUrl = searchParams.get('redirect');

  const handleSignupSuccess = (data: any, email: string) => {
    // Just handle setting the email, navigation happens in the SignupForm
    setPendingVerificationEmail(email);
  };
  
  const handleOtpVerificationNeeded = (email: string) => {
    // Just handle setting the email, navigation happens in the LoginForm
    setPendingVerificationEmail(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
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
          
          {/* Link back to main site */}
          <div className="mt-4 text-center text-sm">
            <a href="https://7en.ai" className="text-primary hover:underline">
              ← Back to main site
            </a>
          </div>
          
          <div className="mt-8 text-center text-xs text-medium-gray">
            <p>© {new Date().getFullYear()} 7en.ai. All rights reserved.</p>
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
