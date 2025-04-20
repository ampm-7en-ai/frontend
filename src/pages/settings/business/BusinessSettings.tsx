
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Building, Users, Lock, Settings, CreditCard, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/useSettings";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

const BusinessSettings = () => {
  const { data: settings, isLoading, error } = useSettings();
  const { toast } = useToast();
  
  const [businessName, setBusinessName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState("");
  
  // Agent settings state
  const [responseModel, setResponseModel] = React.useState("default_model");
  const [tokenLength, setTokenLength] = React.useState(512);
  const [temperature, setTemperature] = React.useState(0.7);
  
  React.useEffect(() => {
    if (settings) {
      // Set business details
      setBusinessName(settings.business_details.business_name || "");
      setEmail(settings.business_details.email || "");
      setPhone(settings.business_details.phone_number || "");
      setWebsite(settings.business_details.website || "");
      
      // Set agent settings
      setResponseModel(settings.global_agent_settings.response_model);
      setTokenLength(settings.global_agent_settings.token_length);
      setTemperature(settings.global_agent_settings.temperature);
    }
  }, [settings]);
  
  const handleBusinessProfileSave = () => {
    toast({
      title: "Profile Saved",
      description: "Your business profile has been updated successfully."
    });
  };

  const handleAgentSettingsSave = () => {
    toast({
      title: "Settings Saved",
      description: "Global agent settings have been updated successfully."
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading settings..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">Business Settings</h1>
      
      <Tabs defaultValue="business">
        <TabsList className="mb-4 w-full max-w-md">
          <TabsTrigger value="business" className="flex-1">Business Profile</TabsTrigger>
          <TabsTrigger value="agent" className="flex-1">Agent Settings</TabsTrigger>
          {settings?.permissions.can_manage_team && (
            <TabsTrigger value="team" className="flex-1">Team Management</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Update your organization's information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Your Business Name" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBusinessProfileSave}>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Usage
              </CardTitle>
              <CardDescription>
                Your current usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Websites Crawled</div>
                  <div className="text-2xl font-bold">{settings?.usage_metrics.websites_crawled}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tokens Used</div>
                  <div className="text-2xl font-bold">{settings?.usage_metrics.tokens_used.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Credits Used</div>
                  <div className="text-2xl font-bold">{settings?.usage_metrics.credits_used.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
            {settings?.permissions.can_manage_payment && (
              <CardFooter>
                <Button variant="outline">Upgrade Plan</Button>
                <Button variant="outline" className="ml-2">View Billing History</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Global Agent Settings
              </CardTitle>
              <CardDescription>
                Configure default settings for all agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responseModel">Response Model</Label>
                  <select 
                    id="responseModel" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={responseModel}
                    onChange={(e) => setResponseModel(e.target.value)}
                  >
                    <option value="default_model">Default Model</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-instant">Claude Instant</option>
                    <option value="claude-opus">Claude Opus</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tokenLength">Max Token Length: {tokenLength}</Label>
                  </div>
                  <Slider 
                    id="tokenLength"
                    min={128} 
                    max={2048} 
                    step={128} 
                    value={[tokenLength]} 
                    onValueChange={(values) => setTokenLength(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
                  </div>
                  <Slider 
                    id="temperature"
                    min={0} 
                    max={1} 
                    step={0.1} 
                    value={[temperature]} 
                    onValueChange={(values) => setTemperature(values[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More deterministic</span>
                    <span>More creative</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAgentSettingsSave}>Save Settings</Button>
              <Button variant="outline" className="ml-2">Reset to Defaults</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {settings?.permissions.can_manage_team && (
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage team members and their access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">David Chen</div>
                      <div className="text-sm text-muted-foreground">david@example.com</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-4">Admin</span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">sarah@example.com</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-4">Editor</span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <div className="font-medium">Michael Smith</div>
                      <div className="text-sm text-muted-foreground">michael@example.com</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-4">Viewer</span>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Invite Team Member</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessSettings;
