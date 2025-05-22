
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders, getApiUrl } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
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

const SecuritySettings = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {getToken} = useAuth();

  useEffect(() => {
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

    fetchRoles();
  }, [toast]);

  return (
    <PlatformSettingsLayout 
      title="Security Settings"
      description="Configure platform security, roles, and permissions"
    >
      <Tabs defaultValue="roles">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles">
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
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              
              <Button className="mt-4">Add New Role</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit">
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
                    <Button variant="outline" size="sm">Today</Button>
                    <Button variant="outline" size="sm">This Week</Button>
                    <Button variant="outline" size="sm">This Month</Button>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2025-05-06 14:32</TableCell>
                      <TableCell>admin@example.com</TableCell>
                      <TableCell>Agent Creation</TableCell>
                      <TableCell>Created Support Agent "Tier 2 Support"</TableCell>
                      <TableCell className="text-right">192.168.1.105</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-05-06 13:15</TableCell>
                      <TableCell>superadmin@example.com</TableCell>
                      <TableCell>Business Update</TableCell>
                      <TableCell>Updated quota for "Acme Corp"</TableCell>
                      <TableCell className="text-right">192.168.1.42</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2025-05-05 09:45</TableCell>
                      <TableCell>admin@example.com</TableCell>
                      <TableCell>Role Modification</TableCell>
                      <TableCell>Added "Invoice Access" to Billing Role</TableCell>
                      <TableCell className="text-right">192.168.1.105</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">Load More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PlatformSettingsLayout>
  );
};

export default SecuritySettings;
