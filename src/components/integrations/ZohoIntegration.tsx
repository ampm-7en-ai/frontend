
import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent } from '@/components/ui/modern-card';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, ExternalLink, Shield, CheckCircle, AlertCircle, Users, Phone, Mail, Settings, Zap, ChevronDown } from 'lucide-react';
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

  // Transform data for modern dropdown
  const organizationOptions = organizations.map(org => ({
    value: org.id,
    label: org.companyName,
    logo: org.logoURL,
    description: `Portal: ${org.portalURL.split('/').pop()}`
  }));

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name,
    description: `Department ID: ${dept.id}`
  }));

  const contactOptions = contacts.map(contact => ({
    value: contact.id,
    label: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    description: contact.email,
    logo: contact.photoURL || undefined
  }));

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
          <ModernCardContent>
            <Accordion type="single" collapsible defaultValue="organization" className="space-y-4">
              {/* Organization Selection */}
              <AccordionItem value="organization" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">Organization Selection</span>
                    {selectedOrg && (
                      <span className="text-sm text-muted-foreground">
                        Selected: {selectedOrg.companyName}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Choose Organization</Label>
                    <ModernDropdown
                      value={selectedOrgId}
                      onValueChange={setSelectedOrgId}
                      options={organizationOptions}
                      placeholder="Select your organization..."
                      className="w-full"
                    />
                  </div>
                  
                  {selectedOrg && (
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
                      <img 
                        src={selectedOrg.logoURL} 
                        alt={selectedOrg.companyName} 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{selectedOrg.companyName}</p>
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
                </AccordionContent>
              </AccordionItem>

              {/* Department Selection */}
              {departments.length > 0 && (
                <AccordionItem value="department" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Department Selection</span>
                      {selectedDepartmentId && (
                        <span className="text-sm text-muted-foreground">
                          Selected: {departments.find(d => d.id === selectedDepartmentId)?.name}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Choose Department</Label>
                      <ModernDropdown
                        value={selectedDepartmentId}
                        onValueChange={setSelectedDepartmentId}
                        options={departmentOptions}
                        placeholder="Select department..."
                        className="w-full"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Contact Selection */}
              {contacts.length > 0 && (
                <AccordionItem value="contact" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="font-medium">Primary Contact</span>
                      {selectedContactId && (
                        <span className="text-sm text-muted-foreground">
                          Selected: {contacts.find(c => c.id === selectedContactId)?.email}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Choose Primary Contact</Label>
                      <ModernDropdown
                        value={selectedContactId}
                        onValueChange={setSelectedContactId}
                        options={contactOptions}
                        placeholder="Select primary contact..."
                        className="w-full"
                      />
                    </div>
                    
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
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Save Configuration */}
            {selectedDepartmentId && selectedContactId && (
              <div className="pt-6 border-t mt-6">
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
