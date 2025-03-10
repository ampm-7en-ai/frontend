
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, MoreHorizontal, Plus, Search, UserPlus } from 'lucide-react';

const TeamSettings = () => {
  // Mock team data
  const teamMembers = [
    { id: 1, name: 'Anna Schmidt', email: 'anna@7en.ai', role: 'Admin', status: 'Active', lastActive: '2 minutes ago' },
    { id: 2, name: 'Markus Weber', email: 'markus@7en.ai', role: 'Editor', status: 'Active', lastActive: '1 hour ago' },
    { id: 3, name: 'Julia Fischer', email: 'julia@7en.ai', role: 'Viewer', status: 'Inactive', lastActive: '3 days ago' },
    { id: 4, name: 'Thomas Müller', email: 'thomas@7en.ai', role: 'Editor', status: 'Active', lastActive: '5 hours ago' },
    { id: 5, name: 'Sarah Becker', email: 'sarah@7en.ai', role: 'Viewer', status: 'Pending', lastActive: 'Never' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team Management</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Team Member
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team and assign roles</CardDescription>
        </CardHeader>

        <div className="px-6 py-4 border-b flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search team members..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Role</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Roles</DropdownMenuItem>
                <DropdownMenuItem>Admin</DropdownMenuItem>
                <DropdownMenuItem>Editor</DropdownMenuItem>
                <DropdownMenuItem>Viewer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'Admin' ? 'default' : member.role === 'Editor' ? 'outline' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      member.status === 'Active' ? 'default' : 
                      member.status === 'Inactive' ? 'secondary' : 'outline'
                    }>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.lastActive}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Define what each role can do</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Admin</h3>
              <p className="text-sm text-muted-foreground">Full access to all settings and features. Can manage team members and billing.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Editor</h3>
              <p className="text-sm text-muted-foreground">Can create and manage agents, conversations, and knowledge bases. Cannot access billing or team settings.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Viewer</h3>
              <p className="text-sm text-muted-foreground">Read-only access to agents, conversations, and analytics. Cannot make changes to any settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;
