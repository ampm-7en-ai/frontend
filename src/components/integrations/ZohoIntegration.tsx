import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ExternalLink, Shield, CheckCircle, Settings, Zap, Edit, Save } from 'lucide-react';
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
  const [isEditingConfig, setIsEditingConfig] = useState(false);
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
        setIsEditingConfig(false);
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
        window.open(result.data.auth_url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        toast({
          title: "Authentication Started",
          description: "Please complete the authentication in the new window that opened.",
        });
        
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
      <div className="mb-8 pl-2">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Zoho Desk Integration</h2>
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
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Integrate with Zoho Desk to streamline customer support and automate ticket management workflows across your organization.
        </p>
      </div>

      {/* Configuration Section */}
      {isConnected && organizations.length > 0 && (
        <section className="p-8">
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Configuration Settings</h3>
              </div>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => setIsEditingConfig(!isEditingConfig)}
                icon={isEditingConfig ? undefined : Edit}
              >
                {isEditingConfig ? 'Cancel' : 'Edit'}
              </ModernButton>
            </div>

            {isEditingConfig ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Organization</Label>
                  <ModernDropdown
                    value={selectedOrgId}
                    onValueChange={setSelectedOrgId}
                    options={organizationOptions}
                    placeholder="Select your organization..."
                    className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                </div>

                {departments.length > 0 && (
                  <div>
                    <Label className="text-base font-medium mb-3 block">Department</Label>
                    <ModernDropdown
                      value={selectedDepartmentId}
                      onValueChange={setSelectedDepartmentId}
                      options={departmentOptions}
                      placeholder="Select department..."
                      className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                    />
                  </div>
                )}

                {contacts.length > 0 && (
                  <div>
                    <Label className="text-base font-medium mb-3 block">Primary Contact</Label>
                    <ModernDropdown
                      value={selectedContactId}
                      onValueChange={setSelectedContactId}
                      options={contactOptions}
                      placeholder="Select primary contact..."
                      className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl"
                    />
                  </div>
                )}

                {selectedDepartmentId && selectedContactId && (
                  <div className="flex justify-end pt-4">
                    <ModernButton 
                      onClick={handleSaveConfiguration}
                      disabled={isSavingConfig}
                      variant="primary" 
                      icon={Save}
                    >
                      {isSavingConfig ? "Saving..." : "Save Settings"}
                    </ModernButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Organization</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedOrg?.companyName || 'Not selected'}
                    </p>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Department</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {departments.find(d => d.id === selectedDepartmentId)?.name || 'Not selected'}
                    </p>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Primary Contact</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {contacts.find(c => c.id === selectedContactId)?.email || 'Not selected'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Connection Management */}
      <section className="p-8">
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {isConnected 
              ? "Your Zoho Desk integration is active and ready to streamline your support workflow." 
              : "Connect your Zoho Desk account to enable automated ticket management and customer support features."
            }
          </p>
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
        </div>
      </section>

      {/* Features Overview */}
      <section className="p-8">
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zoho Desk Capabilities</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Powerful features to enhance your customer support operations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Multi-channel ticket management",
              "Automated workflow and routing", 
              "Customer portal and self-service",
              "SLA management and escalation",
              "Team collaboration and notes",
              "Advanced reporting and analytics"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZohoIntegration;
