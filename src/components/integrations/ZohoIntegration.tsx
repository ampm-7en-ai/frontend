import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { Label } from '@/components/ui/label';
import { Building2, ExternalLink, Shield, CheckCircle, Settings, Edit, Save, User, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { integrationApi } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ZohoStatus {
  is_connected: boolean;
  org_id?: string;
  department_name?: string;
  contact_email?: string;
  contact_name?: string;
  location?: string;
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
      const response = await integrationApi.zoho.getStatus();

      if (!response.ok) {
        throw new Error(`Failed to check Zoho status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setZohoStatus(result.data);
        // If connected, fetch organizations for potential reconfiguration
        if (result.data.is_connected) {
          fetchOrganizations();
        }
      }
    } catch (error) {
      console.error('Error checking Zoho status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await integrationApi.zoho.getOrganizations();

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
      const response = await integrationApi.zoho.getDepartments(orgId);

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
      const response = await integrationApi.zoho.getContacts(orgId);

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

      const response = await integrationApi.zoho.updateConfig(payload);

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
        // Refresh status to show updated configuration
        checkZohoStatus();
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
      const response = await integrationApi.zoho.getAuthUrl();

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
      const response = await integrationApi.zoho.unlink();

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

  // Get display values from status or fallback to "Not configured"
  const getDisplayValue = (value: string | undefined, fallback: string = "Not configured") => {
    return value && value.trim() !== '' ? value : fallback;
  };

  // Find organization name by ID
  const getOrganizationName = (orgId: string | undefined) => {
    if (!orgId) return "Not configured";
    const org = organizations.find(o => o.id === orgId);
    return org ? org.companyName : `Organization ID: ${orgId}`;
  };

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Checking Zoho Desk status..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
     

      {/* Current Configuration Cards */}
      {isConnected && zohoStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Configuration</h3>
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              icon={Edit}
            >
              {isEditingConfig ? 'Cancel' : 'Edit Settings'}
            </ModernButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Organization</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getOrganizationName(zohoStatus.org_id)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Department</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getDisplayValue(zohoStatus.department_name)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Primary Contact</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getDisplayValue(zohoStatus.contact_name)}
              </p>
              {zohoStatus.contact_email && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {zohoStatus.contact_email}
                </p>
              )}
            </div>
          </div>

          {/* Edit Configuration Form */}
          {isEditingConfig && organizations.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Organization</Label>
                  <ModernDropdown
                    value={selectedOrgId}
                    onValueChange={setSelectedOrgId}
                    options={organizationOptions}
                    placeholder="Select your organization..."
                  />
                </div>

                {departments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Department</Label>
                    <ModernDropdown
                      value={selectedDepartmentId}
                      onValueChange={setSelectedDepartmentId}
                      options={departmentOptions}
                      placeholder="Select department..."
                    />
                  </div>
                )}

                {contacts.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Primary Contact</Label>
                    <ModernDropdown
                      value={selectedContactId}
                      onValueChange={setSelectedContactId}
                      options={contactOptions}
                      placeholder="Select primary contact..."
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
                      size="sm"
                    >
                      {isSavingConfig ? "Saving..." : "Save Configuration"}
                    </ModernButton>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Management */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection Management</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {isConnected 
            ? "Your Zoho Desk integration is active and ready to streamline your support workflow." 
            : "Connect your Zoho Desk account to enable automated ticket management and customer support features."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected ? (
            <ModernButton 
              onClick={handleUnlink}
              disabled={isUnlinking}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              size="sm"
            >
              {isUnlinking ? "Disconnecting..." : "Disconnect Integration"}
            </ModernButton>
          ) : (
            <ModernButton 
              onClick={handleConnect}
              disabled={isConnecting}
              variant="primary"
            >
              {isConnecting ? "Connecting..." : "Connect Zoho Desk"}
            </ModernButton>
          )}
          <ModernButton 
            variant="outline" 
            onClick={() => window.open('https://desk.zoho.com/DeskAPIDocument', '_blank')}
            icon={ExternalLink}
            size="sm"
          >
            View Documentation
          </ModernButton>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Zoho Desk Capabilities</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Powerful features to enhance your customer support operations
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Multi-channel ticket management",
            "Automated workflow and routing", 
            "Customer portal and self-service",
            "SLA management and escalation",
            "Team collaboration and notes",
            "Advanced reporting and analytics"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZohoIntegration;
