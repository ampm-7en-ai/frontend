
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Clock, 
  Activity, 
  Calendar, 
  Mail, 
  UserCircle,
  Lock
} from 'lucide-react';

// Mock user data
const mockUsers = {
  '1': {
    id: '1',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 minutes ago',
    avatar: '',
    phone: '+49 123 4567890',
    department: 'Engineering',
    title: 'Lead Developer',
    createdAt: 'January 15, 2023',
    lastLogin: 'Today at 10:23 AM',
    permissions: ['View Dashboard', 'Manage Users', 'Edit Settings', 'Access API', 'View Reports', 'Create Workflows'],
    twoFactorEnabled: true,
    loginAttempts: 0,
    notes: 'Key platform administrator handling technical integrations.'
  },
};

const UserDetail = () => {
  const { id } = useParams();
  const user = id ? mockUsers[id as keyof typeof mockUsers] : null;

  if (!user) {
    return (
      <MainLayout 
        pageTitle="User Not Found" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Unknown User', href: '#' }
        ]}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <p className="text-gray-500 mb-6">The user you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User List
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout 
      pageTitle="User Details" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Users', href: '/users' },
        { label: user.name, href: `#` }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">Reset Password</Button>
            <Button variant={user.status === 'Active' ? 'destructive' : 'default'}>
              {user.status === 'Active' ? 'Deactivate' : 'Activate'} User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card - Left Column */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
                <Badge variant="outline" className={`mt-2 ${getStatusColor(user.status)}`}>
                  {user.status}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Role & Department</p>
                    <p className="text-sm text-gray-500">{user.role} • {user.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-gray-500">{user.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Activity</p>
                    <p className="text-sm text-gray-500">{user.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Right Column */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">User Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update the user's personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" defaultValue={user.title} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" defaultValue={user.department} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={user.phone} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue={user.status.toLowerCase()}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role & Permissions
                    </CardTitle>
                    <CardDescription>Manage what this user can access in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">User Role</Label>
                        <Select defaultValue={user.role.toLowerCase()}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">Roles determine default permissions for the user</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-3">Custom Permissions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {user.permissions.map((permission, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox id={`permission-${i}`} defaultChecked />
                              <Label htmlFor={`permission-${i}`}>{permission}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button>Save Permission Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage account security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Two-Factor Authentication</span>
                        <span className="text-sm text-gray-500">
                          {user.twoFactorEnabled ? 'Enabled' : 'Disabled'} - Additional security layer
                        </span>
                      </div>
                      <div>
                        <Button variant={user.twoFactorEnabled ? "outline" : "default"}>
                          {user.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Password Reset</span>
                        <span className="text-sm text-gray-500">
                          Send password reset instructions
                        </span>
                      </div>
                      <div>
                        <Button variant="outline">Send Reset Link</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Login Attempts</span>
                        <span className="text-sm text-gray-500">
                          {user.loginAttempts > 0 
                            ? `${user.loginAttempts} failed login attempts` 
                            : 'No failed login attempts'}
                        </span>
                      </div>
                      <div>
                        <Button variant="outline" disabled={user.loginAttempts === 0}>
                          Reset Counter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activity Log
                    </CardTitle>
                    <CardDescription>Recent user activity and system interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample activity logs */}
                      <div className="border-l-2 border-gray-200 pl-4 ml-2 py-1">
                        <p className="text-sm font-medium">Logged in successfully</p>
                        <p className="text-xs text-gray-500">Today at 10:23 AM • IP: 192.168.1.1</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 ml-2 py-1">
                        <p className="text-sm font-medium">Updated team settings</p>
                        <p className="text-xs text-gray-500">Yesterday at 4:55 PM • IP: 192.168.1.1</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 ml-2 py-1">
                        <p className="text-sm font-medium">Created new workflow</p>
                        <p className="text-xs text-gray-500">July 5, 2023 at 2:30 PM • IP: 192.168.1.1</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 ml-2 py-1">
                        <p className="text-sm font-medium">Password changed</p>
                        <p className="text-xs text-gray-500">July 1, 2023 at 11:15 AM • IP: 192.168.1.1</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 ml-2 py-1">
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-gray-500">January 15, 2023 at 9:00 AM • IP: 192.168.1.1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDetail;
