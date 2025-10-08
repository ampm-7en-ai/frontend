
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl, getRoleEndpoint } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { PermissionProvider, usePermission, Permission } from '@/context/PermissionContext';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import ModernButton from '@/components/dashboard/ModernButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
}

interface RolesResponse {
  message: string;
  data: Role[];
  status: string;
  permissions: string[];
}

const SecuritySettingsContent = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { getToken } = useAuth();
  const { availablePermissions, isLoading: isLoadingPermissions } = usePermission();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
        if (!token) {
          throw new Error('Authentication required');
        }
      const response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }

      const data: RolesResponse = await response.json();
      setRoles(data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to load role management data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [toast]);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsCreating(false);
    setName(role.name);
    setDescription(role.description);
    setIsActive(role.is_active);
    setSelectedPermissions(role.permissions.map(p => p.id));
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedRole(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setSelectedPermissions([]);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setIsCreating(false);
    setName('');
    setDescription('');
    setIsActive(true);
    setSelectedPermissions([]);
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
      if (selectedRole) {
        // Update existing role
        response = await fetch(getApiUrl(getRoleEndpoint(selectedRole.id)), {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(payload)
        });
      } else {
        // Create new role
        response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${selectedRole ? 'update' : 'create'} role`);
      }
      
      toast({
        title: "Success",
        description: `Role ${selectedRole ? 'updated' : 'created'} successfully`,
      });
      
      handleCancel();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Error",
        description: `Failed to ${selectedRole ? 'update' : 'create'} role`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(getApiUrl(getRoleEndpoint(roleId)), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      if (selectedRole?.id === roleId) {
        handleCancel();
      }
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  const showForm = !!(selectedRole || isCreating);

  return (
    <PlatformSettingsLayout
        title="Security Settings"
        description="Configure platform security, roles, and permissions"
      >
        <div className="space-y-6">
          {/* Role Management Section */}
          <Card className="p-6 bg-white dark:bg-neutral-800/50">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-6">
              <div>
                <CardTitle className="text-2xl">Role Management</CardTitle>
                <CardDescription className="text-base mt-2">
                  Define custom roles for agents with specific permissions
                </CardDescription>
              </div>
              <ModernButton 
                variant="primary" 
                onClick={handleCreateNew}
                size='sm'
                disabled={showForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </ModernButton>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  <span className="ml-3 text-muted-foreground">Loading roles...</span>
                </div>
              ) : (
                <div className="bg-white/50 dark:bg-neutral-800/50 rounded-xl border border-border/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-neutral-50/50 dark:bg-neutral-800/70 transition-colors dark:border-neutral-600">
                        <TableHead className="py-4 px-6 font-semibold">Role Name</TableHead>
                        <TableHead className="py-4 px-6 font-semibold">Description</TableHead>
                        <TableHead className="py-4 px-6 font-semibold">Permissions</TableHead>
                        <TableHead className="py-4 px-6 font-semibold">Status</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            No roles found. Add a new role to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        roles.map((role) => (
                          <TableRow 
                            key={role.id} 
                            className={`group hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 dark:border-neutral-600 transition-colors ${
                              selectedRole?.id === role.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                            }`}
                          >
                            <TableCell className="py-4 px-6 font-medium">{role.name}</TableCell>
                            <TableCell className="py-4 px-6">{role.description}</TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex flex-wrap gap-2 max-w-md">
                                {role.permissions.slice(0, 3).map((permission) => (
                                  <Badge key={permission.id} variant="waiting" className="text-xs">
                                    {permission.name.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                                {role.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{role.permissions.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge variant={role.is_active ? "success" : "secondary"}>
                                {role.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <ModernButton 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditRole(role)}
                                  disabled={showForm}
                                  iconOnly
                                  className="h-9 w-9"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </ModernButton>
                                <ModernButton 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.id)}
                                  disabled={showForm}
                                  iconOnly
                                  className="h-9 w-9 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </ModernButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Form Section */}
          {showForm && (
            <Card className="p-6 bg-white dark:bg-neutral-800/50">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl">
                  {selectedRole ? 'Edit Role' : 'Create New Role'}
                </CardTitle>
                <CardDescription>
                  {selectedRole ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
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
                      onClick={handleCancel} 
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
                          {selectedRole ? 'Saving...' : 'Creating...'}
                        </>
                      ) : (
                        selectedRole ? 'Save Changes' : 'Create Role'
                      )}
                    </ModernButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </PlatformSettingsLayout>
  );
};

const SecuritySettings = () => {
  return (
    <PermissionProvider>
      <SecuritySettingsContent />
    </PermissionProvider>
  );
};

export default SecuritySettings;
