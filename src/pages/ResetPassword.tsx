
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/utils/api-config';
import { RECAPTCHA_CONFIG } from '@/utils/auth-config';
import ModernButton from '@/components/dashboard/ModernButton';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token || !email) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or incomplete.",
        variant: "destructive",
      });
      navigate('/login');
    }
    
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [token, email, navigate, toast]);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token || !email) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Execute reCAPTCHA
      let recaptchaToken: string | undefined;
      try {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_CONFIG.SITE_KEY, { action: 'reset_password' });
      } catch (error) {
        console.error('reCAPTCHA error:', error);
        toast({
          title: "Verification Failed",
          description: "Could not verify reCAPTCHA. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const response = await authApi.resetPassword(token, email, values.newPassword, recaptchaToken);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setIsSuccess(true);
        form.reset();
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset successfully.",
          variant: "default",
        });
      } else {
        // Handle API error responses
        if (data.error) {
          if (data.error.fields && data.error.fields.token) {
            setErrorMessage(data.error.fields.token[0]);
          } else {
            setErrorMessage(data.error.message || 'Failed to reset password. Please try again.');
          }
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage('Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
        <div className="p-8 bg-white dark:bg-neutral-800/60 rounded-3xl shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="text-primary">
              <img src="/logo-new.svg" alt="7en.ai" style={{height:"45px"}}/>
            </div>
          </div>
          
          {!isSuccess ? (
            <>
              <h1 className="text-2xl font-semibold text-center mb-2">Reset your password</h1>
              <p className="text-center text-gray-400 mb-6">
                Enter your new password below
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4 z-10" />
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password" 
                              className="h-11 pl-9 pr-10" 
                              {...field}
                              variant="modern"
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
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4 z-10" />
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password" 
                              className="h-11 pl-9 pr-10" 
                              {...field}
                              variant="modern"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-gray hover:text-black"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {errorMessage && (
                    <div className="text-sm font-medium text-destructive">
                      {errorMessage}
                    </div>
                  )}
                  
                  <ModernButton 
                    type="submit" 
                    className="w-full py-2 h-12"
                    disabled={isSubmitting}
                    variant="primary"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </ModernButton>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md border border-green-200 dark:border-green-600/30 mb-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Password Reset Successful!</h2>
                <p className="dark:text-gray-200">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </div>
              <Link to="/login">
                <ModernButton variant='primary' className="w-full">
                  Go to Login
                </ModernButton>
              </Link>
            </div>
          )}
          
          
          
          <div className="mt-8 text-center text-xs text-gray-400">
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
            <p className="mt-2">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Service</a> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
