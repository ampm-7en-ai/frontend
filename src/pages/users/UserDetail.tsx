import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { ArrowLeft, Save, Settings, Mail, Lock, User, CheckCircle, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'JD',
  role: 'editor',
  status: 'active',
  lastActive: '10 minutes ago',
  bio: 'A software engineer with a passion for building great products.',
  permissions: ['read', 'write'],
  isVerified: true
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the user data here
    console.log('Loading user with ID:', id);
  }, [id]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Updated",
        description: "User details have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<typeof user>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <MainLayout 
      pageTitle="User Details" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Users', href: '/users' },
        { label: user.name, href: '#' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              View and edit user details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                {user.isVerified ? (
                  <Badge variant="outline" className="mt-1">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-1">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => updateUser({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => updateUser({ email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <ModernDropdown
                      value={user.role}
                      onValueChange={(value) => updateUser({ role: value })}
                      options={roleOptions}
                      placeholder="Select role"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <ModernDropdown
                      value={user.status}
                      onValueChange={(value) => updateUser({ status: value })}
                      options={statusOptions}
                      placeholder="Select status"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={user.bio}
                    onChange={(e) => updateUser({ bio: e.target.value })}
                    placeholder="Write a short bio about the user"
                  />
                </div>
              </TabsContent>
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <Button variant="destructive">Reset Password</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserDetail;
