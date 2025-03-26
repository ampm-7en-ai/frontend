
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  registrationResponse: any;
  onProceedToOtp: () => void;
}

const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({
  open,
  onOpenChange,
  email,
  registrationResponse,
  onProceedToOtp
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Verification Required</DialogTitle>
          <DialogDescription>
            We've sent a verification email to {email}. 
            Please check your inbox for the 6-digit OTP code to verify your account.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 p-4 rounded-md text-sm">
          <p className="font-semibold mb-2">Registration Details:</p>
          {registrationResponse && (
            <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-xs">
              {JSON.stringify(registrationResponse, null, 2)}
            </pre>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="mr-2"
          >
            Close
          </Button>
          <Button 
            onClick={onProceedToOtp}
            variant="default"
          >
            Enter OTP Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationDialog;
