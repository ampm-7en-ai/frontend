import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from '@/components/ui/modern-card';
import { ModernInput } from '@/components/ui/modern-input';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ExternalLink, Shield, CheckCircle, AlertCircle, Users, Phone, Mail, Settings, Zap } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/25">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Zoho Desk Integration</h1>
            {isCheckingStatus ? (
              <ModernStatusBadge status="loading">
                Checking...
              </ModernStatusBadge>
            ) : (
              <ModernStatusBadge status={isConnected ? "connected" : "disconnected"}>
                {isConnected ? "Connected" : "Not Connected"}
              </ModernStatusBadge>
            )}
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Integrate with Zoho Desk to streamline customer support and automate ticket management workflows across your organization.
          </p>
        </div>
      </div>

      {/* Configuration Section - Only show when connected */}
      {isConnected && organizations.length > 0 && (
        <ModernCard variant="glass" className="border-primary/20">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              Configuration Settings
            </ModernCardTitle>
            <ModernCardDescription>
              Configure your Zoho Desk integration by selecting your organization, department, and primary contact.
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-8">
            {/* Organization Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose your organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-3 py-1">
                        <img 
                          src={org.logoURL} 
                          alt={org.companyName} 
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="font-medium">{org.companyName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedOrg && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <img 
                    src={selectedOrg.logoURL} 
                    alt={selectedOrg.companyName} 
                    className="w-10 h-10 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{selectedOrg.companyName}</p>
                    <p className="text-sm text-muted-foreground">Selected Organization</p>
                  </div>
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
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Department
                </Label>
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>{dept.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contact Selection */}
            {contacts.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Primary Contact
                </Label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select primary contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={contact.photoURL || undefined} />
                            <AvatarFallback className="text-xs font-medium">
                              {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {`${contact.firstName || ''} ${contact.lastName || ''}`.trim()}
                            </p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedContactId && (
                  <div className="flex justify-end">
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const selectedContact = contacts.find(c => c.id === selectedContactId);
                        if (selectedContact?.webUrl) {
                          window.open(selectedContact.webUrl, '_blank');
                        }
                      }}
                      icon={ExternalLink}
                    >
                      View Contact Profile
                    </ModernButton>
                  </div>
                )}
              </div>
            )}

            {/* Save Configuration */}
            {selectedDepartmentId && selectedContactId && (
              <div className="pt-4 border-t">
                <ModernButton
                  onClick={handleSaveConfiguration}
                  disabled={isSavingConfig}
                  variant="gradient"
                  size="lg"
                  icon={Zap}
                  className="w-full"
                >
                  {isSavingConfig ? "Saving Configuration..." : "Save Configuration"}
                </ModernButton>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Connection Management */}
      <ModernCard variant="elevated">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            Connection Management
          </ModernCardTitle>
          <ModernCardDescription>
            {isConnected 
              ? "Your Zoho Desk integration is active and ready to streamline your support workflow." 
              : "Connect your Zoho Desk account to enable automated ticket management and customer support features."
            }
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <ModernButton 
                onClick={handleUnlink}
                disabled={isUnlinking}
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                {isUnlinking ? "Disconnecting..." : "Disconnect Integration"}
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleConnect}
                disabled={isConnecting}
                variant="gradient"
                size="lg"
              >
                {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
              </ModernButton>
            )}
            <ModernButton 
              variant="outline" 
              onClick={() => window.open('https://desk.zoho.com/DeskAPIDocument', '_blank')}
              icon={ExternalLink}
            >
              View Documentation
            </ModernButton>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Features Overview */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle>Zoho Desk Capabilities</ModernCardTitle>
          <ModernCardDescription>
            Powerful features to enhance your customer support operations
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Multi-channel ticket management",
              "Automated workflow and routing", 
              "Customer portal and self-service",
              "SLA management and escalation",
              "Team collaboration and notes",
              "Advanced reporting and analytics"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default ZohoIntegration;
