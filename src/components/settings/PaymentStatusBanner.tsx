
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertBanner } from '@/components/ui/alert-banner';
import { CheckCircle, XCircle, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PaymentStatusBanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  
  const success = searchParams.get('success');
  
  // Don't show banner if no success parameter or if manually closed
  if (!success || !isVisible) {
    return null;
  }
  
  const isSuccess = success === 'true';
  
  const handleClose = () => {
    setIsVisible(false);
    // Remove the success parameter from URL
    searchParams.delete('success');
    setSearchParams(searchParams);
  };
  
  const handleViewReceipt = () => {
    // This would typically navigate to a receipt page or open a receipt modal
    console.log('View receipt clicked');
    // For now, just log - you can implement actual receipt viewing logic here
  };
  
  return (
    <div className="mb-6 relative">
      <AlertBanner
        message={isSuccess ? "Payment successful." : "Payment failed."}
        variant={isSuccess ? "success" : "error"}
        icon={isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        className="pr-20"
      />
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClose}
        className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-transparent"
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* View Receipt link - only show on success */}
      {isSuccess && (
        <Button
          variant="link"
          size="sm"
          onClick={handleViewReceipt}
          className="absolute top-2 right-10 h-8 px-2 text-sm"
        >
          <FileText className="h-3 w-3 mr-1" />
          View Receipt
        </Button>
      )}
    </div>
  );
};
