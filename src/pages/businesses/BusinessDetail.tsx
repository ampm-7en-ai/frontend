import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { useBusinessDetail } from '@/hooks/useBusinesses';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessDetail = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: business, isLoading, error } = useBusinessDetail(businessId);

  // Show error state
  if (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to load business details',
      variant: "destructive"
    });
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild disabled>
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Businesses
            </div>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <LoadingSpinner size="lg" text="Loading business data..." className="my-8" />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!business) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/businesses" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Businesses
            </Link>
          </Button>
        </div>
        
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-destructive mb-4">
              <Trash className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Business Details Not Found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find the business details you're looking for.</p>
            <Button asChild>
              <Link to="/businesses">Return to Business List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with data
  return (
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
                    <p className="text-lg font-medium">{business.business_info.name}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Email</h3>
                      <p>{business.business_info.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Phone</h3>
                      <p>{business.business_info.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Domain</h3>
                      <p>{business.business_info.domain === 'N/A' ? 'No domain set' : business.business_info.domain}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge className={`${
                      business.subscription.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                      business.subscription.status === 'trial' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                      'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }`}>
                      {business.subscription.status || 'No status'}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Subscription Plan</h3>
                      <p className="capitalize">{business.subscription.plan || 'No plan'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Billing Cycle</h3>
                      <p className="capitalize">{business.subscription.billing_cycle || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">Next Billing Date</h3>
                      <p>{business.subscription.next_billing_date ? 
                          new Date(business.subscription.next_billing_date).toLocaleDateString() : 
                          'Not applicable'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium mb-2">Account Created</h3>
                <p>{new Date(business.business_info.account_created).toLocaleString()}</p>
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
                <h2 className="text-xl font-bold">{business.business_info.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {business.business_info.domain === 'N/A' ? 'No domain set' : business.business_info.domain}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.account_statistics.admins}</div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.account_statistics.agents}</div>
                  <div className="text-sm text-muted-foreground">Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.account_statistics.conversations}</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{business.account_statistics.documents}</div>
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
              Users
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              AI Agents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle>Business Administrators</CardTitle>
                <Button size="sm">Add Admin</Button>
              </CardHeader>
              <CardContent>
                {business.administrators.length > 0 ? (
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
                      {business.administrators.map((admin) => (
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
                          <TableCell>{new Date(admin.last_active).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-1">No administrators found</h3>
                    <p>This business doesn't have any administrators yet.</p>
                  </div>
                )}
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
                    {business.agents.length > 0 ? (
                      business.agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.name}</TableCell>
                          <TableCell className="capitalize">{agent.agentType}</TableCell>
                          <TableCell>
                            <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'} className="capitalize">
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                          <h3 className="text-lg font-medium mb-1">No agents found</h3>
                          <p>This business doesn't have any AI agents yet.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default BusinessDetail;
