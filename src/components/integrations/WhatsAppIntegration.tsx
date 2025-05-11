
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader, QrCode, Check, AlertCircle, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { 
  initFacebookSDK, 
  loginWithFacebook, 
  getFacebookLoginStatus,
  getWhatsAppBusinessAccounts,
  getWhatsAppPhoneNumbers,
  logoutFromFacebook,
  registerWhatsAppWebhook
} from '@/utils/facebookSDK';
import { API_ENDPOINTS, BASE_URL, getAccessToken } from '@/utils/api-config';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhoneInputField from '@/components/ui/PhoneInputField';
import { Badge } from '@/components/ui/badge';

interface WhatsAppAccount {
  id: string;
  name: string;
}

interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating?: string;
}

const WhatsAppIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(true);
  const [businessAccounts, setBusinessAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [registeredDate, setRegisteredDate] = useState(new Date().toLocaleString());
  const [showAccountsDialog, setShowAccountsDialog] = useState(false);
  const { toast } = useToast();

  // QR code for demonstration purposes - in production, generate dynamically
  const qrCodeImageUrl = '/lovable-uploads/87d0de23-8725-4d62-bda2-2612a6fe494c.png';

  // Initialize Facebook SDK and check login status
  useEffect(() => {
    const initFacebook = async () => {
      try {
        await initFacebookSDK();
        const loginStatus = await getFacebookLoginStatus();
        
        // If already connected, fetch WhatsApp accounts
        if (loginStatus.status === 'connected') {
          const accounts = await getWhatsAppBusinessAccounts();
          setBusinessAccounts(accounts);
          
          // If we have existing connection data in localStorage, restore it
          const savedConnection = localStorage.getItem('whatsappConnection');
          if (savedConnection) {
            const connectionData = JSON.parse(savedConnection);
            setIsConnected(true);
            setSelectedAccountId(connectionData.accountId);
            setPhoneDisplay(connectionData.phoneDisplay);
            
            // Load phone numbers for the selected account
            if (connectionData.accountId) {
              const fb_token = JSON.parse(localStorage.getItem('fb_token'));
              const numbers = await getWhatsAppPhoneNumbers(connectionData.accountId,fb_token);
              setPhoneNumbers(numbers);
              setSelectedPhoneId(connectionData.phoneId);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Facebook SDK:", error);
        toast({
          title: "Facebook SDK Error",
          description: "Failed to initialize Facebook SDK. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsFacebookLoading(false);
      }
    };

    initFacebook();
  }, [toast]);

  // Handle Facebook login
  const handleConnectFacebook = async () => {
    setIsConnecting(true);
    
    try {
      const response = await loginWithFacebook();
      const fb_token = await response.authResponse.code;
      if (response.status === 'connected') {
        // Get available WhatsApp Business accounts
        const accounts = await getWhatsAppBusinessAccounts(fb_token);
        setBusinessAccounts(accounts);
        localStorage.setItem('fb_token',fb_token);
        
        if (accounts && accounts.length > 0) {
          setShowAccountsDialog(true);
        } else {
          toast({
            title: "No WhatsApp Business Accounts",
            description: "No WhatsApp Business accounts found. Please create one in the Meta Business Manager first.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Facebook. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle account selection
  const handleAccountSelect = async (accountId: string) => {
    setSelectedAccountId(accountId);
    
    try {
      // Get phone numbers for the selected account
      const numbers = await getWhatsAppPhoneNumbers(accountId);
      setPhoneNumbers(numbers);
      
      if (numbers && numbers.length > 0) {
        setSelectedPhoneId(numbers[0].id);
        setPhoneDisplay(numbers[0].display_phone_number);
      }
    } catch (error) {
      console.error("Error getting phone numbers:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve phone numbers for this account.",
        variant: "destructive"
      });
    }
  };
  
  // Confirm WhatsApp account connection
  const handleConfirmConnection = async () => {
    if (!selectedAccountId || !selectedPhoneId) {
      toast({
        title: "Selection Required",
        description: "Please select a WhatsApp Business account and phone number.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Register the webhook for receiving WhatsApp messages
      // In a real implementation, you would configure this on your backend
      const webhookUrl = `${window.location.origin}/api/whatsapp-webhook`;
      
      await registerWhatsAppWebhook(selectedAccountId, webhookUrl);
      
      // Save the connection in localStorage
      const connectionData = {
        accountId: selectedAccountId,
        phoneId: selectedPhoneId,
        phoneDisplay: phoneNumbers.find(p => p.id === selectedPhoneId)?.display_phone_number || '',
        connectedAt: new Date().toISOString()
      };
      localStorage.setItem('whatsappConnection', JSON.stringify(connectionData));
      
      // Update state
      setIsConnected(true);
      setShowAccountsDialog(false);
      
      // Display success message
      toast({
        title: "WhatsApp Connected",
        description: "Your WhatsApp Business account has been successfully connected.",
      });
      
      // Register with your backend (in a real implementation)
      const token = getAccessToken();
      if (token) {
        // Update backend with the connection details
        // This would be implemented in your API
        console.log("Sending connection details to backend:", connectionData);
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to establish WhatsApp Business connection.",
        variant: "destructive"
      });
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      // In a real implementation, you would also notify your backend
      await logoutFromFacebook();
      
      // Remove saved connection
      localStorage.removeItem('whatsappConnection');
      
      // Reset state
      setIsConnected(false);
      setBusinessAccounts([]);
      setSelectedAccountId('');
      setPhoneNumbers([]);
      setSelectedPhoneId('');
      
      toast({
        title: "WhatsApp Disconnected",
        description: "Your WhatsApp Business account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect WhatsApp Business account.",
        variant: "destructive"
      });
    }
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
                Your bot is linked to your WhatsApp Business with phone number {phoneDisplay}<br />
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
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 p-2 rounded-full">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Connect WhatsApp Business</h3>
              </div>
              <p className="text-green-800">
                Connect your WhatsApp Business account to enable automated responses to your customers.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded p-4 border border-green-100">
                <h4 className="font-medium text-green-800 mb-2">Integration Benefits:</h4>
                <ul className="space-y-2 text-green-700">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Engage customers on their preferred messaging platform</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Automate responses to common customer questions</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Provide 24/7 automated customer support</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>Transfer complex queries to human agents when needed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded p-4 border border-green-100">
                <h4 className="font-medium text-green-800 mb-2">What You'll Need:</h4>
                <ul className="space-y-2 text-green-700">
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>A Facebook Business Account</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span>A WhatsApp Business Phone Number</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleConnectFacebook} 
                disabled={isConnecting || isFacebookLoading}
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : isFacebookLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    Connect WhatsApp Business
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* WhatsApp Account Selection Dialog */}
      <Dialog open={showAccountsDialog} onOpenChange={setShowAccountsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Business Account</DialogTitle>
            <DialogDescription>
              Select the WhatsApp Business account and phone number you want to connect.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="account" className="text-sm font-medium">WhatsApp Business Account</label>
              <Select
                value={selectedAccountId}
                onValueChange={handleAccountSelect}
              >
                <SelectTrigger id="account" className="w-full">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {businessAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedAccountId && (
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                {phoneNumbers.length > 0 ? (
                  <Select
                    value={selectedPhoneId}
                    onValueChange={setSelectedPhoneId}
                  >
                    <SelectTrigger id="phone" className="w-full">
                      <SelectValue placeholder="Select a phone number" />
                    </SelectTrigger>
                    <SelectContent>
                      {phoneNumbers.map((phone) => (
                        <SelectItem key={phone.id} value={phone.id}>
                          {phone.display_phone_number} 
                          {phone.quality_rating && (
                            <Badge variant="outline" className="ml-2">
                              {phone.quality_rating}
                            </Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No phone numbers available for this account.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccountsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmConnection}
              disabled={!selectedAccountId || !selectedPhoneId}
            >
              Connect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppIntegration;
