
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
import { getApiUrl, getAuthHeaders } from '@/utils/api-config';
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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl('admin/custom-team-roles'), {
          headers: getAuthHeaders()
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
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="handoff">Handoff Rules</TabsTrigger>
          <TabsTrigger value="fallback">Fallback Config</TabsTrigger>
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
        
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Assign permissions to agents for specific businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent">Select Agent</Label>
                    <Select>
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing_agent">Billing Agent</SelectItem>
                        <SelectItem value="support_agent">Support Agent</SelectItem>
                        <SelectItem value="general_agent">General Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business">Assign to Business</Label>
                    <Select>
                      <SelectTrigger id="business">
                        <SelectValue placeholder="Select business" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acme">Acme Corp</SelectItem>
                        <SelectItem value="globex">Globex Industries</SelectItem>
                        <SelectItem value="stark">Stark Enterprises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="perm_read" />
                      <Label htmlFor="perm_read">Read Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="perm_write" />
                      <Label htmlFor="perm_write">Write Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="perm_delete" />
                      <Label htmlFor="perm_delete">Delete Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="perm_customer" />
                      <Label htmlFor="perm_customer">Customer Data Access</Label>
                    </div>
                  </div>
                </div>
                
                <Button>Assign Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="handoff">
          <Card>
            <CardHeader>
              <CardTitle>Handoff Rules</CardTitle>
              <CardDescription>Configure intent-based handoff rules with confidence thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intent</TableHead>
                    <TableHead>Target Agent</TableHead>
                    <TableHead>Confidence Threshold</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">billing_query</TableCell>
                    <TableCell>Billing Agent</TableCell>
                    <TableCell>85%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">support_request</TableCell>
                    <TableCell>Support Agent</TableCell>
                    <TableCell>80%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">technical_issue</TableCell>
                    <TableCell>Technical Support Agent</TableCell>
                    <TableCell>90%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Button className="mt-4">Add New Rule</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fallback">
          <Card>
            <CardHeader>
              <CardTitle>Fallback Configuration</CardTitle>
              <CardDescription>Set fallback agents for low-confidence responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultFallback">Default Fallback Agent</Label>
                  <Select>
                    <SelectTrigger id="defaultFallback">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Agent</SelectItem>
                      <SelectItem value="support">Support Agent</SelectItem>
                      <SelectItem value="human">Human Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confidenceThreshold">Low Confidence Threshold (%)</Label>
                  <Input id="confidenceThreshold" type="number" defaultValue="65" min="0" max="100" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Maximum Retry Attempts</Label>
                  <Input id="maxRetries" type="number" defaultValue="3" min="0" />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="humanEscalation" defaultChecked />
                  <Label htmlFor="humanEscalation">Allow Human Escalation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifyAdmin" defaultChecked />
                  <Label htmlFor="notifyAdmin">Notify Admins on Multiple Fallbacks</Label>
                </div>
              </div>
              
              <Button className="mt-4">Save Configuration</Button>
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
