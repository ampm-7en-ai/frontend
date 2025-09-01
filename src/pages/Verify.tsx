
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits")
});

type OtpFormValues = z.infer<typeof otpSchema>;

const Verify = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { 
    user, 
    isAuthenticated, 
    needsVerification, 
    pendingVerificationEmail, 
    setNeedsVerification,
    setPendingVerificationEmail 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = pendingVerificationEmail || (location.state?.email as string);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ""
    }
  });

  useEffect(() => {
    // If user is authenticated and doesn't need verification, redirect to dashboard
    if (isAuthenticated && !needsVerification && !location.state?.forcedVerification) {
      navigate('/dashboard');
    }
    
    // If no email for verification, go back to login
    if (!email && !user?.email) {
      navigate('/login');
    }
  }, [isAuthenticated, needsVerification, navigate, email, user?.email, location.state]);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const handleVerifyOtp = async (values: OtpFormValues) => {
    setIsVerifying(true);
    try {
      const payload = {
        email: email || user?.email,
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
        
        if (response.ok) {
          handleVerificationSuccess(data);
        } else {
          handleVerificationError(data);
        }
      } catch (error) {
        console.error('OTP verification call failed:', error);
        
        if (process.env.NODE_ENV === 'development') {
          const simulatedData = {
            status: "success",
            message: "OTP verified successfully",
            data: {
              user: {
                username: user?.name || "user",
                email: email || user?.email,
                role: user?.role || "admin"
              }
            }
          };
          
          handleVerificationSuccess(simulatedData);
          
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
      setIsVerifying(false);
    }
  };
  
  const handleVerificationSuccess = (data: any) => {
   // console.log('OTP verification successful:', data);
    
    setVerificationSuccess(true);
    setNeedsVerification(false);
    setPendingVerificationEmail(null);
    
    // Update local storage user data to reflect verification
    if (user) {
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Verification Successful",
      description: "Your account has been verified successfully",
      variant: "default",
    });
    
    // Wait a moment before redirecting
   // navigate('/dashboard');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };
  
  const handleVerificationError = (data: any) => {
    toast({
      title: "Verification Failed",
      description: data.message || "Invalid OTP. Please try again.",
      variant: "destructive",
    });
    form.setError('otp', { message: "Invalid OTP code" });
  };
  
  const handleResendOtp = async () => {
    if (!email && !user?.email) {
      toast({
        title: "Error",
        description: "No email address available for OTP resend",
        variant: "destructive",
      });
      return;
    }
    
    setIsResendingOtp(true);
    try {
      const payload = {
        email: email || user?.email
      };
      
      console.log('Sending OTP resend request for:', payload);
      
      const targetUrl = getApiUrl(API_ENDPOINTS.RESEND_OTP);
      
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
        
        if (response.ok) {
          toast({
            title: "OTP Sent",
            description: data.message || "A new verification code has been sent to your email",
            variant: "default",
          });
          
          // Start the resend cooldown timer (60 seconds)
          setResendCooldown(60);
          
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to resend verification code",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('OTP resend call failed:', error);
        
        if (process.env.NODE_ENV === 'development') {
          toast({
            title: "Development Mode",
            description: "OTP resend simulation: A new code would be sent to your email",
            variant: "default",
          });
          
          // Start the resend cooldown timer (60 seconds) even in development mode
          setResendCooldown(60);
          
        } else {
          toast({
            title: "Error",
            description: "Could not connect to verification service. Please try again later.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('OTP resend error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm text-center">
          <div className="mb-6 flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold">Verification Successful</h2>
            <p className="text-muted-foreground mt-2">
              Your account has been verified successfully
            </p>
          </div>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">
            <img src='/logo-new.svg' alt="7en AI" style={{width: "100px"}}/>
          </div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        <div className="p-8 bg-white rounded-3xl shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Verify Your Account</h2>
            <p className="text-muted-foreground mt-2">
              Enter the 6-digit OTP code sent to
            </p>
            <div className="flex items-center justify-center mt-1 space-x-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-medium">{email || user?.email}</span>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerifyOtp)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="mx-auto flex flex-col items-center">
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col items-center justify-center space-y-2 text-sm text-center">
                <p>Didn't receive the code?</p>
                {resendCooldown > 0 ? (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Resend available in {resendCooldown}s</span>
                  </div>
                ) : (
                  <Button 
                    variant="link" 
                    className="h-auto p-0" 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={isResendingOtp || resendCooldown > 0}
                  >
                    {isResendingOtp ? "Sending..." : "Resend OTP"}
                  </Button>
                )}
              </div>
              
              <div className="flex justify-center">
                <ModernButton 
                  type="submit"
                  disabled={isVerifying}
                  className="w-full"
                  variant='primary'
                  size='lg'
                >
                  {isVerifying ? "Verifying..." : "Verify Account"}
                </ModernButton>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Verify;
