
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface OtpResendTimerProps {
  cooldown: number;
  isResending: boolean;
  onResend: () => void;
}

const OtpResendTimer: React.FC<OtpResendTimerProps> = ({
  cooldown,
  isResending,
  onResend
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 text-sm text-center">
      <p>Didn't receive the code?</p>
      {cooldown > 0 ? (
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Resend available in {cooldown}s</span>
        </div>
      ) : (
        <Button 
          variant="link" 
          className="h-auto p-0" 
          type="button" 
          onClick={onResend}
          disabled={isResending || cooldown > 0}
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </Button>
      )}
    </div>
  );
};

export default OtpResendTimer;
