
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl, getRoleEndpoint } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { PermissionProvider, usePermission, Permission } from '@/context/PermissionContext';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import ModernButton from '@/components/dashboard/ModernButton';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();

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

  const handleEditRole = (roleId: number) => {
    navigate(`/settings/platform/security/role/${roleId}`);
  };

  const handleCreateNew = () => {
    navigate('/settings/platform/security/role');
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

  return (
    <PlatformSettingsLayout 
      title="Security Settings"
      description="Configure platform security, roles, and permissions"
    >
      <div className="space-y-6">
        {/* Role Management Section */}
        <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                  <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Role Management</h2>
                  <p className="text-muted-foreground dark:text-muted-foreground mt-1">
                    Define custom roles for agents with specific permissions
                  </p>
                </div>
              </div>
              <ModernButton 
                variant="primary" 
                onClick={handleCreateNew}
                size='sm'
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </ModernButton>
            </div>
          </div>
          <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
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
                          className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 dark:border-neutral-600 transition-colors"
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
                                onClick={() => handleEditRole(role.id)}
                                iconOnly
                                className="h-9 w-9"
                              >
                                <Edit2 className="h-4 w-4" />
                              </ModernButton>
                              <ModernButton 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
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
            </div>
          </section>
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
