
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, QrCode, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

const WhatsAppIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+1 91********");
  const [registeredDate, setRegisteredDate] = useState("16 Sep 2024, 02:53 PM");
  const { toast } = useToast();

  // This would typically come from an API
  const qrCodeImageUrl = '/lovable-uploads/87d0de23-8725-4d62-bda2-2612a6fe494c.png';
  
  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setShowQrDialog(true);
    }, 1500);
  };
  
  const handleConfirmQrScan = () => {
    setShowQrDialog(false);
    setIsConnected(true);
    toast({
      title: "WhatsApp Connected",
      description: "Your WhatsApp Business account has been successfully connected.",
    });
  };
  
  const handleDisconnect = () => {
    // Show confirmation dialog in a real implementation
    setIsConnected(false);
    toast({
      title: "WhatsApp Disconnected",
      description: "Your WhatsApp Business account has been disconnected.",
    });
  };
  
  return (
    <div className="space-y-6">
      {isConnected ? (
        <>
          <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center gap-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-green-700">Connected to your WhatsApp Business phone number.</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">Your WhatsApp Test Bot</h3>
              <p className="text-muted-foreground">
                bot is linked to your WhatsApp Business with phone number {phoneNumber}<br />
                Registered at: {registeredDate}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Scan the QR below to chat with your bot on WhatsApp:</h4>
              <div className="border rounded-md p-4 bg-white w-fit">
                <img 
                  src={qrCodeImageUrl} 
                  alt="WhatsApp QR Code" 
                  className="max-w-[250px]"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                To unlink your WhatsApp Business phone number from 7en.ai, click this button:
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                size="sm"
              >
                Unlink
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Alert variant="default" className="bg-blue-50 border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Connect your WhatsApp Business API to enable automated responses via WhatsApp.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="font-medium">Getting Started with WhatsApp Integration</h3>
            <div className="space-y-2">
              <p>1. You'll need a WhatsApp Business account</p>
              <p>2. Click the Connect button below to start the integration process</p>
              <p>3. Scan the QR code to verify your WhatsApp Business number</p>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Connect WhatsApp Business
                </>
              )}
            </Button>
          </div>
        </>
      )}
      
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link your WhatsApp Business Account</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp Business app to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <img 
              src={qrCodeImageUrl} 
              alt="WhatsApp QR Code" 
              className="max-w-[250px]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmQrScan}>
              I've scanned the QR code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppIntegration;
