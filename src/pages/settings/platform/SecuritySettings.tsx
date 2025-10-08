
import React, { useEffect, useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import { PermissionProvider } from '@/context/PermissionContext';
import RoleEditDialog, { Role } from '@/components/settings/platform/RoleEditDialog';
import RoleCreateDialog from '@/components/settings/platform/RoleCreateDialog';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import ModernButton from '@/components/dashboard/ModernButton';

interface RolesResponse {
  message: string;
  data: Role[];
  status: string;
  permissions: string[];
}

const SecuritySettings = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      setAvailablePermissions(data.permissions);
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
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <PermissionProvider>
      <PlatformSettingsLayout 
        title="Security Settings"
        description="Configure platform security, roles, and permissions"
      >
        <div className="space-y-8">
          {/* Role Management Section */}
          <ModernCard variant="glass" className="p-0 bg-white dark:bg-neutral-800/50 rounded-2xl">
            <ModernCardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <ModernCardTitle className="text-2xl">Role Management</ModernCardTitle>
                  <ModernCardDescription className="text-base mt-2">
                    Define custom roles for agents with specific permissions
                  </ModernCardDescription>
                </div>
                <ModernButton 
                  variant="primary" 
                  onClick={handleOpenCreateDialog}
                  className=""
                  size='sm'
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Role
                </ModernButton>
              </div>
            </ModernCardHeader>
            <ModernCardContent className="pt-0">
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
                          <TableRow key={role.id} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 dark:border-neutral-600 transition-colors">
                            <TableCell className="py-4 px-6 font-medium">{role.name}</TableCell>
                            <TableCell className="py-4 px-6">{role.description}</TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="flex flex-wrap gap-2 max-w-md">
                                {role.permissions.map((permission) => (
                                  <Badge key={permission.id} variant="waiting" className="text-xs">
                                    {permission.name.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge variant={role.is_active ? "success" : "secondary"}>
                                {role.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <ModernButton 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditRole(role)}
                                className="px-4 py-2"
                              >
                                Edit
                              </ModernButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Role Edit Dialog */}
        <RoleEditDialog 
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          role={selectedRole}
          onRoleUpdated={fetchRoles}
        />

        {/* Role Create Dialog */}
        <RoleCreateDialog
          isOpen={isCreateDialogOpen}
          onClose={handleCloseCreateDialog}
          onRoleCreated={fetchRoles}
        />
      </PlatformSettingsLayout>
    </PermissionProvider>
  );
};

export default SecuritySettings;
