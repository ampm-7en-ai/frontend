import React, { useState, useEffect } from 'react';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ModernStatusBadge } from '@/components/ui/modern-status-badge';
import { ModernAlert, ModernAlertDescription } from '@/components/ui/modern-alert';
import { Label } from '@/components/ui/label';
import { Building2, ExternalLink, Shield, CheckCircle, Settings, Edit, Save, User, Mail, RefreshCw, AlertTriangle } from 'lucide-react';
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

interface ErrorState {
  organizations: string | null;
  departments: string | null;
  contacts: string | null;
  isAuthError: boolean;
}

const ZohoIntegration = ({setAppConnection}) => {
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
  const [loadingStates, setLoadingStates] = useState({
    organizations: false,
    departments: false,
    contacts: false
  });
  const [errors, setErrors] = useState<ErrorState>({
    organizations: null,
    departments: null,
    contacts: null,
    isAuthError: false
  });
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

  // Pre-populate form when entering edit mode
  useEffect(() => {
    if (isEditingConfig && zohoStatus) {
      if (zohoStatus.org_id) {
        setSelectedOrgId(zohoStatus.org_id);
      }
      // We'll set department and contact IDs after fetching the lists
    }
  }, [isEditingConfig, zohoStatus]);

  const parseApiError = (error: any, defaultMessage: string): string => {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return defaultMessage;
  };

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
          setAppConnection({zoho: "connected"});
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
    setLoadingStates(prev => ({ ...prev, organizations: true }));
    setErrors(prev => ({ ...prev, organizations: null, isAuthError: false }));
    
    try {
      console.log('Fetching Zoho organizations...');
      const response = await integrationApi.zoho.getOrganizations();

      if (response.status === 401) {
        console.log('401 error fetching organizations - authentication expired');
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, 'Your Zoho authentication has expired. Please reconnect to continue.');
        
        setErrors(prev => ({ 
          ...prev, 
          organizations: errorMessage,
          isAuthError: true 
        }));
        return;
      }

      if (!response.ok) {
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, `Failed to fetch organizations: ${response.status}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status === 'success') {
        const orgs = result.data.data.map((org: any) => ({
          id: org.id.toString(),
          companyName: org.companyName,
          logoURL: org.logoURL,
          portalURL: org.portalURL
        }));
        setOrganizations(orgs);
        console.log('Successfully fetched organizations:', orgs.length);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      const errorMessage = parseApiError(error, 'Failed to load organizations. Please try again.');
      setErrors(prev => ({ ...prev, organizations: errorMessage }));
    } finally {
      setLoadingStates(prev => ({ ...prev, organizations: false }));
    }
  };

  const fetchDepartments = async (orgId: string) => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    setErrors(prev => ({ ...prev, departments: null }));
    
    try {
      console.log('Fetching departments for org:', orgId);
      const response = await integrationApi.zoho.getDepartments(orgId);

      if (response.status === 401) {
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, 'Authentication expired while fetching departments.');
        setErrors(prev => ({ ...prev, departments: errorMessage, isAuthError: true }));
        return;
      }

      if (!response.ok) {
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, `Failed to fetch departments: ${response.status}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status === 'success') {
        const depts = result.data.data.map((dept: any) => ({
          id: dept.id,
          name: dept.name
        }));
        setDepartments(depts);
        
        // Pre-select department if editing and we have a match
        if (isEditingConfig && zohoStatus?.department_name) {
          const matchingDept = depts.find((d: any) => d.name === zohoStatus.department_name);
          if (matchingDept) {
            setSelectedDepartmentId(matchingDept.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      const errorMessage = parseApiError(error, 'Failed to load departments. Please try again.');
      setErrors(prev => ({ ...prev, departments: errorMessage }));
    } finally {
      setLoadingStates(prev => ({ ...prev, departments: false }));
    }
  };

  const fetchContacts = async (orgId: string) => {
    setLoadingStates(prev => ({ ...prev, contacts: true }));
    setErrors(prev => ({ ...prev, contacts: null }));
    
    try {
      console.log('Fetching contacts for org:', orgId);
      const response = await integrationApi.zoho.getContacts(orgId);

      if (response.status === 401) {
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, 'Authentication expired while fetching contacts.');
        setErrors(prev => ({ ...prev, contacts: errorMessage, isAuthError: true }));
        return;
      }

      if (!response.ok) {
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, `Failed to fetch contacts: ${response.status}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status === 'success') {
        const contactsList = result.data.data.map((contact: any) => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          photoURL: contact.photoURL,
          webUrl: contact.webUrl
        }));
        setContacts(contactsList);
        
        // Pre-select contact if editing and we have a match
        if (isEditingConfig && zohoStatus?.contact_email) {
          const matchingContact = contactsList.find((c: any) => c.email === zohoStatus.contact_email);
          if (matchingContact) {
            setSelectedContactId(matchingContact.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      const errorMessage = parseApiError(error, 'Failed to load contacts. Please try again.');
      setErrors(prev => ({ ...prev, contacts: errorMessage }));
    } finally {
      setLoadingStates(prev => ({ ...prev, contacts: false }));
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
        const errorResult = await response.json();
        const errorMessage = parseApiError(errorResult, `Failed to save configuration: ${response.status}`);
        throw new Error(errorMessage);
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
        // Redirect to auth URL in current tab
        window.location.href = result.data.auth_url;
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
        setAppConnection({ zoho: "not_connected" });
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

  const handleRetryFetch = (type: 'organizations' | 'departments' | 'contacts') => {
    switch (type) {
      case 'organizations':
        fetchOrganizations();
        break;
      case 'departments':
        if (selectedOrgId) fetchDepartments(selectedOrgId);
        break;
      case 'contacts':
        if (selectedOrgId) fetchContacts(selectedOrgId);
        break;
    }
  };

  const handleEditToggle = () => {
    setIsEditingConfig(!isEditingConfig);
    if (!isEditingConfig) {
      // Clear any previous errors when entering edit mode
      setErrors({
        organizations: null,
        departments: null,
        contacts: null,
        isAuthError: false
      });
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Configuration</h3>
            <ModernButton
              variant="outline"
              size="sm"
              onClick={handleEditToggle}
              icon={Edit}
            >
              {isEditingConfig ? 'Cancel' : 'Edit Settings'}
            </ModernButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-slate-200 dark:border-neutral-600">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Organization</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getOrganizationName(zohoStatus.org_id)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-slate-200 dark:border-neutral-600">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h4 className="font-medium text-slate-900 dark:text-slate-100">Department</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getDisplayValue(zohoStatus.department_name)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-slate-200 dark:border-neutral-600">
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
          {isEditingConfig && (
            <div className="border-t border-slate-200 dark:border-neutral-700 pt-6">
              <div className="space-y-6">
                {/* Authentication Error Alert */}
                {errors.isAuthError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                          Authentication Required
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                          Your Zoho authentication has expired. Please reconnect to continue.
                        </p>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={handleConnect}
                          disabled={isConnecting}
                          className="bg-white dark:bg-neutral-800 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          {isConnecting ? 'Reconnecting...' : 'Reconnect'}
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Organization</Label>
                  {loadingStates.organizations ? (
                    <div className="flex items-center gap-2 p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800/50">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Loading organizations...</span>
                    </div>
                  ) : errors.organizations ? (
                    <div className="space-y-2">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                              {errors.organizations}
                            </p>
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryFetch('organizations')}
                              icon={RefreshCw}
                              className="bg-white dark:bg-neutral-800 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                            >
                              Retry
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ModernDropdown
                      value={selectedOrgId}
                      onValueChange={setSelectedOrgId}
                      options={organizationOptions}
                      placeholder="Select your organization..."
                      disabled={errors.isAuthError}
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Department</Label>
                  {loadingStates.departments ? (
                    <div className="flex items-center gap-2 p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800/50">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Loading departments...</span>
                    </div>
                  ) : errors.departments ? (
                    <div className="space-y-2">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                              {errors.departments}
                            </p>
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryFetch('departments')}
                              icon={RefreshCw}
                              className="bg-white dark:bg-neutral-800 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                            >
                              Retry
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedOrgId ? (
                    <ModernDropdown
                      value={selectedDepartmentId}
                      onValueChange={setSelectedDepartmentId}
                      options={departmentOptions}
                      placeholder="Select department..."
                      disabled={errors.isAuthError}
                    />
                  ) : (
                    <div className="p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-sm text-slate-500 dark:text-slate-400">
                      Please select an organization first
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block text-slate-700 dark:text-slate-300">Primary Contact</Label>
                  {loadingStates.contacts ? (
                    <div className="flex items-center gap-2 p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800/50">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Loading contacts...</span>
                    </div>
                  ) : errors.contacts ? (
                    <div className="space-y-2">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                              {errors.contacts}
                            </p>
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryFetch('contacts')}
                              icon={RefreshCw}
                              className="bg-white dark:bg-neutral-800 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                            >
                              Retry
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedOrgId ? (
                    <ModernDropdown
                      value={selectedContactId}
                      onValueChange={setSelectedContactId}
                      options={contactOptions}
                      placeholder="Select primary contact..."
                      disabled={errors.isAuthError}
                    />
                  ) : (
                    <div className="p-3 border border-slate-200 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-sm text-slate-500 dark:text-slate-400">
                      Please select an organization first
                    </div>
                  )}
                </div>

                {selectedDepartmentId && selectedContactId && !errors.isAuthError && (
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
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-6">
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
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-6">
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
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50 border border-slate-200 dark:border-neutral-600">
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
