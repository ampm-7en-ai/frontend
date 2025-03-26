
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits")
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpVerificationPanelProps {
  email: string;
  isVerifying: boolean;
  onVerifyOtp: (values: OtpFormValues) => void;
  onCancel?: () => void;
}

const OtpVerificationPanel: React.FC<OtpVerificationPanelProps> = ({
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
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">Verify Your Account</h2>
        <p className="text-muted-foreground mt-2">
          Enter the 6-digit OTP code sent to {email}
        </p>
      </div>
      
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
          
          <div className="flex justify-center">
            <Button 
              type="submit"
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify Account"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OtpVerificationPanel;
