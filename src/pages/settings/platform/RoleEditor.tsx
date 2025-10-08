
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl, getRoleEndpoint } from '@/utils/api-config';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { PermissionProvider, usePermission } from '@/context/PermissionContext';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ModernButton from '@/components/dashboard/ModernButton';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Array<{ id: number; name: string; description: string }>;
  is_active: boolean;
  created_at: string;
}

const RoleEditorContent = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { availablePermissions, isLoading: isLoadingPermissions } = usePermission();
  const isEditMode = !!roleId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && roleId) {
      fetchRoleDetails();
    }
  }, [roleId]);

  const fetchRoleDetails = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(getRoleEndpoint(Number(roleId))), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role details');
      }

      const result = await response.json();
      const roleData = result.data;

      setName(roleData.name);
      setDescription(roleData.description);
      setIsActive(roleData.is_active);
      setSelectedPermissions(roleData.permissions.map((p: any) => p.id));
    } catch (error) {
      console.error('Error fetching role details:', error);
      toast({
        title: "Error",
        description: "Failed to load role details.",
        variant: "destructive"
      });
      navigate('/settings/platform/security');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(current => 
      current.includes(permissionId) 
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        name,
        description,
        permission_ids: selectedPermissions,
        is_active: isActive
      };

      let response;
      if (isEditMode) {
        response = await fetch(getApiUrl(getRoleEndpoint(Number(roleId))), {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} role`);
      }

      toast({
        title: "Success",
        description: `Role ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      navigate('/settings/platform/security');
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} role`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PlatformSettingsLayout
        title={isEditMode ? "Edit Role" : "Create Role"}
        description={isEditMode ? "Update role details and permissions" : "Define a new role with specific permissions"}
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading role details..." />
        </div>
      </PlatformSettingsLayout>
    );
  }

  return (
    <PlatformSettingsLayout
      title={isEditMode ? "Edit Role" : "Create Role"}
      description={isEditMode ? "Update role details and permissions" : "Define a new role with specific permissions"}
    >
      <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <ModernButton
              variant="ghost"
              onClick={() => navigate('/settings/platform/security')}
              iconOnly
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </ModernButton>
            <div className="flex items-center gap-3">
              <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {isEditMode ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground mt-1">
                  {isEditMode ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  variant="modern"
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Support Agent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-3 h-10">
                  <Switch 
                    id="active-status" 
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="active-status" className="!mt-0">
                    {isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role's responsibilities"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <Label>Permissions</Label>
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" text="Loading permissions..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox 
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {permission.name.replace(/_/g, ' ')}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <ModernButton 
                onClick={() => navigate('/settings/platform/security')} 
                type="button" 
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </ModernButton>
              <ModernButton 
                type="submit" 
                variant="primary"
                disabled={isSubmitting || !name}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Role'
                )}
              </ModernButton>
            </div>
          </form>
        </div>
      </section>
    </PlatformSettingsLayout>
  );
};

const RoleEditor = () => {
  return (
    <PermissionProvider>
      <RoleEditorContent />
    </PermissionProvider>
  );
};

export default RoleEditor;
