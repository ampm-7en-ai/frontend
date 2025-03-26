
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits")
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isVerifying: boolean;
  onVerifyOtp: (values: OtpFormValues) => void;
}

const OtpVerificationDialog: React.FC<OtpVerificationDialogProps> = ({
  open,
  onOpenChange,
  email,
  isVerifying,
  onVerifyOtp
}) => {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ""
    }
  });

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Only allow explicitly closing the dialog through the Cancel button
      // Prevent closing when clicking outside
      if (newOpen === false && !isVerifying) {
        // If user is manually trying to close, only close if not verifying
        onOpenChange(false);
      } else if (newOpen === true) {
        // Always allow opening
        onOpenChange(true);
      }
    }}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Verify Your Account</DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP code sent to {email}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onVerifyOtp)} className="space-y-6">
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
              <Button variant="link" className="h-auto p-0" type="button">
                Resend OTP
              </Button>
            </div>
            
            <DialogFooter>
              <Button 
                type="button"
                onClick={() => {
                  if (!isVerifying) {
                    onOpenChange(false);
                  }
                }}
                variant="outline"
                className="mr-2"
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpVerificationDialog;
