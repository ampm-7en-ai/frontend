import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import OtpVerificationPanel from '@/components/auth/OtpVerificationPanel';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';

type OtpFormValues = {
  otp: string;
};

const Login = () => {
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignupSuccess = (data: any, email: string) => {
    setRegistrationResponse(data);
    setVerificationEmail(email);
    setShowOtpVerification(true);
    
    toast({
      title: "OTP Verification Required",
      description: `We've sent a 6-digit OTP code to ${email}. Please verify your account.`,
      variant: "default",
    });
  };

  const handleVerifyOtp = async (values: OtpFormValues) => {
    setVerificationInProgress(true);
    try {
      const payload = {
        email: verificationEmail,
        otp: values.otp
      };
      
      console.log('Sending OTP verification data:', payload);
      
      const targetUrl = getApiUrl(API_ENDPOINTS.VERIFY_OTP);
      
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        handleOtpVerificationResponse(data, response.ok);
      } catch (error) {
        console.error('OTP verification call failed:', error);
        
        if (process.env.NODE_ENV === 'development') {
          const simulatedData = {
            status: "success",
            message: "OTP verified successfully",
            data: {
              user: {
                username: registrationResponse?.data?.user?.username || "user",
                email: verificationEmail,
                role: "admin"
              }
            }
          };
          
          handleOtpVerificationResponse(simulatedData, true);
          
          toast({
            title: "Development Mode",
            description: "Using simulated OTP verification response",
            variant: "default",
          });
        } else {
          toast({
            title: "Verification Error",
            description: "Could not connect to verification service. Please try again later.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerificationInProgress(false);
    }
  };
  
  const handleOtpVerificationResponse = (data: any, isSuccess: boolean) => {
    console.log('OTP verification response:', data);
    
    if (isSuccess) {
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully",
        variant: "default",
      });
      
      setShowOtpVerification(false);
      
      if (data.data?.user) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setTimeout(() => {
          toast({
            title: "Please Log In",
            description: "Your account is verified. Please log in with your credentials.",
            variant: "default",
          });
          setActiveTab("login");
        }, 500);
      }
    } else {
      toast({
        title: "Verification Failed",
        description: data.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">7en.ai</div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        {showOtpVerification ? (
          <OtpVerificationPanel 
            email={verificationEmail}
            isVerifying={verificationInProgress}
            onVerifyOtp={handleVerifyOtp}
          />
        ) : (
          <div className="p-8 bg-white rounded-lg shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
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
        )}
      </div>
    </div>
  );
};

export default Login;
