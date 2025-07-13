
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ExternalLink, Shield, CheckCircle, AlertCircle, Users, Phone, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getAccessToken, getApiUrl } from '@/utils/api-config';

interface ZohoStatus {
  is_connected: boolean;
  domain?: string;
}

interface ZohoOrganization {
  id: string;
  companyName: string;
  logoURL: string;
  portalURL: string;
}

interface ZohoDepartment {
  id: string;
  name: string;
}

interface ZohoContact {
  id: string;
  firstName: string | null;
  lastName: string;
  email: string;
  photoURL: string | null;
  webUrl: string;
}

const ZohoIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [zohoStatus, setZohoStatus] = useState<ZohoStatus | null>(null);
  const [organizations, setOrganizations] = useState<ZohoOrganization[]>([]);
  const [departments, setDepartments] = useState<ZohoDepartment[]>([]);
  const [contacts, setContacts] = useState<ZohoContact[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const { toast } = useToast();

  // Check Zoho connection status on component mount
  useEffect(() => {
    checkZohoStatus();
  }, []);

  // Fetch organizations when connected
  useEffect(() => {
    if (zohoStatus?.is_connected) {
      fetchOrganizations();
    }
  }, [zohoStatus]);

  // Fetch departments and contacts when organization is selected
  useEffect(() => {
    if (selectedOrgId) {
      fetchDepartments(selectedOrgId);
      fetchContacts(selectedOrgId);
    }
  }, [selectedOrgId]);

  const checkZohoStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/status/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check Zoho status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking Zoho status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(getApiUrl('zoho/orgs/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setOrganizations(result.data.data.map((org: any) => ({
          id: org.id.toString(),
          companyName: org.companyName,
          logoURL: org.logoURL,
          portalURL: org.portalURL
        })));
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchDepartments = async (orgId: string) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(getApiUrl(`zoho/departments/?org_id=${orgId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setDepartments(result.data.data.map((dept: any) => ({
          id: dept.id,
          name: dept.name
        })));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchContacts = async (orgId: string) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(getApiUrl(`zoho/contacts/?org_id=${orgId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setContacts(result.data.data.map((contact: any) => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          photoURL: contact.photoURL,
          webUrl: contact.webUrl
        })));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedDepartmentId || !selectedContactId) {
      toast({
        title: "Missing Selection",
        description: "Please select both a department and a contact.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
      const selectedContact = contacts.find(c => c.id === selectedContactId);

      const payload = {
        department_id: selectedDepartmentId,
        department_name: selectedDepartment?.name || '',
        contact_id: selectedContactId,
        contact_email: selectedContact?.email || '',
        contact_name: `${selectedContact?.firstName || ''} ${selectedContact?.lastName || ''}`.trim(),
        location: "us"
      };

      const response = await fetch(getApiUrl('zoho/update-config/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save configuration: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        toast({
          title: "Configuration Saved",
          description: "Zoho Desk configuration has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/auth/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Zoho auth URL: ${response.status}`);
      }

      const result = await response.json();
      console.log('Zoho auth URL response:', result);

      if (result.status === 'success' && result.data?.auth_url) {
        // Open auth URL in new browser window
        window.open(result.data.auth_url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the new window that opened.",
        });
        
        // Refresh status after a delay to check if connection was successful
        setTimeout(() => {
          checkZohoStatus();
        }, 3000);
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error getting Zoho auth URL:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate Zoho Desk connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(getApiUrl('zoho/unlink/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to unlink Zoho: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus({ is_connected: false });
        toast({
          title: "Successfully Unlinked",
          description: "Zoho Desk integration has been disconnected.",
        });
      }
    } catch (error) {
      console.error('Error unlinking Zoho:', error);
      toast({
        title: "Unlink Failed",
        description: "Unable to disconnect Zoho Desk integration.",
        variant: "destructive"
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const isConnected = zohoStatus?.is_connected || false;
  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Connect Zoho Desk</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Integrate with Zoho Desk to streamline customer support and automate ticket management workflows.
          </p>
        </div>
        {isCheckingStatus ? (
          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50">
            Checking...
          </Badge>
        ) : (
          <Badge 
            variant={isConnected ? "success" : "outline"} 
            className={isConnected 
              ? "text-green-800 border-green-200 bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
              : "text-slate-500 border-slate-200 bg-slate-50 dark:bg-slate-700/50"
            }
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </>
            )}
          </Badge>
        )}
      </div>

      {isConnected && organizations.length > 0 && (
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Configuration
            </CardTitle>
            <CardDescription>
              Select your organization, department, and contact to configure Zoho Desk integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Selection */}
            <div className="space-y-3">
              <Label>Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-3">
                        <img src={org.logoURL} alt={org.companyName} className="w-6 h-6 rounded" />
                        <span>{org.companyName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedOrg && (
                <div className="flex items-center gap-2 mt-2">
                  <ModernButton
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedOrg.portalURL, '_blank')}
                    icon={ExternalLink}
                  >
                    Open Portal
                  </ModernButton>
                </div>
              )}
            </div>

            {/* Department Selection */}
            {departments.length > 0 && (
              <div className="space-y-3">
                <Label>Department</Label>
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contact Selection */}
            {contacts.length > 0 && (
              <div className="space-y-3">
                <Label>Contact</Label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={contact.photoURL || undefined} />
                            <AvatarFallback className="text-xs">
                              {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{`${contact.firstName || ''} ${contact.lastName || ''}`.trim()}</span>
                            <span className="text-xs text-muted-foreground">{contact.email}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedContactId && (
                  <div className="flex items-center gap-2 mt-2">
                    <ModernButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selectedContact = contacts.find(c => c.id === selectedContactId);
                        if (selectedContact?.webUrl) {
                          window.open(selectedContact.webUrl, '_blank');
                        }
                      }}
                      icon={ExternalLink}
                    >
                      View Profile
                    </ModernButton>
                  </div>
                )}
              </div>
            )}

            {/* Save Configuration Button */}
            {selectedDepartmentId && selectedContactId && (
              <div className="pt-4">
                <ModernButton
                  onClick={handleSaveConfiguration}
                  disabled={isSavingConfig}
                  variant="gradient"
                >
                  {isSavingConfig ? "Saving..." : "Save Configuration"}
                </ModernButton>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Integration Management
          </CardTitle>
          <CardDescription>
            {isConnected 
              ? "Your Zoho Desk integration is active and ready to use." 
              : "Connect your Zoho Desk account to enable ticket automation."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 pt-4">
            {isConnected ? (
              <ModernButton 
                onClick={handleUnlink}
                disabled={isUnlinking}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {isUnlinking ? "Unlinking..." : "Unlink Zoho Desk"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
              >
                {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://desk.zoho.com/DeskAPIDocument', '_blank')}
              icon={ExternalLink}
            >
              API Documentation
            </ModernButton>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-900 dark:text-red-100">Zoho Desk Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>• Multi-channel ticket management</li>
            <li>• Automated workflow and routing</li>
            <li>• Customer portal and self-service</li>
            <li>• SLA management and escalation</li>
            <li>• Team collaboration and notes</li>
            <li>• Advanced reporting and analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZohoIntegration;
