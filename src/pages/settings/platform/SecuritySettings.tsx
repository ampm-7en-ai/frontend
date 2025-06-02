
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import { PermissionProvider, Permission } from '@/context/PermissionContext';
import RoleEditDialog, { Role } from '@/components/settings/platform/RoleEditDialog';
import RoleCreateDialog from '@/components/settings/platform/RoleCreateDialog';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { useAuditLogs } from '@/hooks/useAuditLogs';

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
  
  // Use the audit logs hook
  const {
    logs: auditLogs,
    isLoading: isAuditLogsLoading,
    activePeriod,
    setPeriod,
    formatEventType,
    formatTimestamp
  } = useAuditLogs();

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

  const periodButtons = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: '3months', label: 'Past 3 Months' }
  ] as const;

  return (
    <PermissionProvider>
      <PlatformSettingsLayout 
        title="Security Settings"
        description="Configure platform security, roles, and permissions"
      >
        <div className="space-y-8">
          {/* Role Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Define custom roles for agents with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No roles found. Add a new role to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {role.permissions.map((permission) => (
                                <Badge key={permission.id} variant="outline" className="text-xs">
                                  {permission.name.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.is_active ? "success" : "secondary"}>
                              {role.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              
              <Button className="mt-4" onClick={handleOpenCreateDialog}>
                <Plus className="mr-1 h-4 w-4" />
                Add New Role
              </Button>
            </CardContent>
          </Card>

          {/* Audit Logs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View a log of all Super Admin actions for compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                  <div className="space-x-2">
                    {periodButtons.map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={activePeriod === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPeriod(key)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {isAuditLogsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading audit logs...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No audit logs found for the selected period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>User ID: {log.user}</TableCell>
                            <TableCell>{formatEventType(log.event_type)}</TableCell>
                            <TableCell>{log.entity_type} #{log.entity_id}</TableCell>
                            <TableCell>
                              {log.details.name ? `Name: ${log.details.name}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.status === 'success' ? 'success' : 'destructive'}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {log.ip_address || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
                
                {auditLogs.length > 0 && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm">Load More</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
