
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/utils/api-config';
import ModernButton from '../dashboard/ModernButton';

// Schema for the forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email,setEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setEmail(values.email)
    
    try {
      const response = await authApi.forgotPassword(values.email);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setIsSuccess(true);
        form.reset();
      } else {
        // Handle API error responses
        if (data.error) {
          if (data.error.fields && data.error.fields.email) {
            form.setError('email', { 
              message: data.error.fields.email[0] 
            });
          } else {
            setErrorMessage(data.error.message || 'Failed to send password reset email. Please try again.');
          }
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMessage('Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    form.reset();
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {!isSuccess ? 
              "Enter your email address and we'll send you a link to reset your password." :
              "Password reset instructions sent!"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4 z-10" />
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          className="pl-9"
                          {...field}
                          variant='modern'
                        />
                      </FormControl>
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
              
              <DialogFooter>
                <ModernButton type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </ModernButton>
                <ModernButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </ModernButton>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">
                Password reset instructions have been sent to <span className="font-semibold">{email}</span>. 
                Please check your email inbox and follow the instructions to reset your password.
              </p>
            </div>
            <DialogFooter>
              <ModernButton onClick={handleDialogClose}>
                Close
              </ModernButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
