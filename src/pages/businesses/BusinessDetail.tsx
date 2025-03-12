
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building, 
  ChevronLeft, 
  Clock, 
  CreditCard, 
  Edit, 
  Globe, 
  Mail, 
  MoreHorizontal, 
  Phone, 
  Shield, 
  Tag, 
  Trash, 
  User, 
  Users 
} from 'lucide-react';

const BusinessDetail = () => {
  const { businessId } = useParams<{ businessId: string }>();

  // Sample business data
  const business = {
    id: businessId,
    name: 'Acme Corporation',
    domain: 'acmecorp.com',
    email: 'admin@acmecorp.com',
    phone: '+1 (555) 123-4567',
    plan: 'enterprise',
    status: 'active',
    billingCycle: 'annual',
    nextBillingDate: '2024-01-15',
    createdAt: '2023-01-15T10:30:00',
    logoUrl: '', // Empty for now, would be a URL to logo image
    admins: [
      { id: 'a1', name: 'John Smith', email: 'john@acmecorp.com', role: 'Admin', lastActive: '2023-06-10T08:45:00' },
      { id: 'a2', name: 'Sarah Johnson', email: 'sarah@acmecorp.com', role: 'Admin', lastActive: '2023-06-09T16:20:00' },
      { id: 'a3', name: 'Michael Brown', email: 'michael@acmecorp.com', role: 'Admin', lastActive: '2023-06-08T12:15:00' },
    ],
    agents: [
      { id: 'ag1', name: 'Sales Assistant', type: 'sales', status: 'active', conversations: 128 },
      { id: 'ag2', name: 'Support Helper', type: 'support', status: 'active', conversations: 256 },
      { id: 'ag3', name: 'Product Specialist', type: 'product', status: 'inactive', conversations: 64 },
    ]
  };

  return (
    <MainLayout 
      pageTitle={business.name}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Businesses', href: '/businesses' },
        { label: business.name, href: `/businesses/${businessId}` },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/businesses" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Businesses
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive flex items-center gap-1">
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Detailed information about this business account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Business Name</h3>
                    <p className="text-lg font-medium">{business.name}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Email</h3>
                      <p>{business.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Phone</h3>
                      <p>{business.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Domain</h3>
                      <p>{business.domain}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Subscription Plan</h3>
                      <p className="capitalize">{business.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Billing Cycle</h3>
                      <p className="capitalize">{business.billingCycle}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Next Billing Date</h3>
                      <p>{new Date(business.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium mb-2">Account Created</h3>
                <p>{new Date(business.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{business.name}</h2>
                <p className="text-sm text-muted-foreground">{business.domain}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.admins.length}</div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.agents.length}</div>
                  <div className="text-sm text-muted-foreground">Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">384</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <Button variant="outline" className="w-full">View Usage Analytics</Button>
              <Button variant="outline" className="w-full">Manage Subscription</Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="admins" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Agents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle>Business Administrators</CardTitle>
                <Button size="sm">Add Admin</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {business.admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {admin.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{admin.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.role}</TableCell>
                        <TableCell>{new Date(admin.lastActive).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agents">
            <Card>
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle>Business AI Agents</CardTitle>
                <Button size="sm">Add Agent</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {business.agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="capitalize">{agent.type}</TableCell>
                        <TableCell>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{agent.conversations}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BusinessDetail;
