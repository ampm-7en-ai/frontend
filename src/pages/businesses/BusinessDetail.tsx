
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild disabled className="rounded-2xl">
              <div className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Businesses
              </div>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
              <CardHeader>
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-48" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-6">
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
            
            <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <LoadingSpinner size="lg" text="Loading business data..." className="my-8" />
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild className="rounded-2xl">
              <Link to="/businesses" className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Businesses
              </Link>
            </Button>
          </div>
          
          <Card className="py-12 bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="text-destructive mb-4">
                <Trash className="h-12 w-12" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Business Details Not Found</h2>
              <p className="text-muted-foreground mb-6">We couldn't find the business details you're looking for.</p>
              <Button asChild className="rounded-2xl">
                <Link to="/businesses">Return to Business List</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild className="rounded-2xl">
            <Link to="/businesses" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Businesses
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-2xl">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive flex items-center gap-1 rounded-2xl">
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Business Information</CardTitle>
              <CardDescription>Detailed information about this business account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Name</h3>
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100">{business.business_info.name}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Email</h3>
                      <p className="text-slate-600 dark:text-slate-400">{business.business_info.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Phone</h3>
                      <p className="text-slate-600 dark:text-slate-400">{business.business_info.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Domain</h3>
                      <p className="text-slate-600 dark:text-slate-400">{business.business_info.domain === 'N/A' ? 'No domain set' : business.business_info.domain}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                    <Badge className={`${
                      business.subscription.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                      business.subscription.status === 'trial' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                      'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    } rounded-full`}>
                      {business.subscription.status || 'No status'}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Subscription Plan</h3>
                      <p className="capitalize text-slate-600 dark:text-slate-400">{business.subscription.plan || 'No plan'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <CreditCard className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Billing Cycle</h3>
                      <p className="capitalize text-slate-600 dark:text-slate-400">{business.subscription.billing_cycle || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Next Billing Date</h3>
                      <p className="text-slate-600 dark:text-slate-400">{business.subscription.next_billing_date ? 
                          new Date(business.subscription.next_billing_date).toLocaleDateString() : 
                          'Not applicable'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-8" />
              <div>
                <h3 className="text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Account Created</h3>
                <p className="text-slate-600 dark:text-slate-400">{new Date(business.business_info.account_created).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Building className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{business.business_info.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {business.business_info.domain === 'N/A' ? 'No domain set' : business.business_info.domain}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{business.account_statistics.admins}</div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{business.account_statistics.agents}</div>
                  <div className="text-sm text-muted-foreground">Agents</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{business.account_statistics.conversations}</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{business.account_statistics.documents}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-3">
              <Button variant="outline" className="w-full rounded-2xl">View Usage Analytics</Button>
              <Button variant="outline" className="w-full rounded-2xl">Manage Subscription</Button>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            <TabsTrigger value="admins" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Shield className="h-4 w-4" />
              AI Agents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="admins">
            <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle className="text-slate-900 dark:text-slate-100">Business Administrators</CardTitle>
                <Button size="sm" className="rounded-2xl">Add Admin</Button>
              </CardHeader>
              <CardContent>
                {business.administrators.length > 0 ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
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
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                                    {admin.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{admin.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{admin.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-full">{admin.role}</Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{new Date(admin.last_active).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">No administrators found</h3>
                    <p>This business doesn't have any administrators yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="agents">
            <Card className="bg-white dark:bg-slate-800/50 border-0 rounded-3xl">
              <CardHeader className="flex-row justify-between items-center">
                <CardTitle className="text-slate-900 dark:text-slate-100">Business AI Agents</CardTitle>
                <Button size="sm" className="rounded-2xl">Add Agent</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
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
                            <TableCell className="capitalize text-slate-600 dark:text-slate-400">{agent.agentType}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={agent.status === 'Active' ? 'default' : 'secondary'} 
                                className={`capitalize rounded-full ${
                                  agent.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
                                }`}
                              >
                                {agent.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{agent.conversations}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-4">
                              <Shield className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-slate-100">No agents found</h3>
                            <p>This business doesn't have any AI agents yet.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessDetail;
