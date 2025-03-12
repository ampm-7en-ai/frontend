
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Bot, MessageSquare, ChevronRight, BarChart2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  return (
    <MainLayout pageTitle="Platform Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-4 w-4 text-primary" />
                Total Businesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">+3 from last month</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to="/businesses" className="flex items-center">
                    View all <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Domain Experts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">48</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">+7 from last month</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to="/users" className="flex items-center">
                    View all <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bot className="mr-2 h-4 w-4 text-primary" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">187</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">+15 from last month</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to="/analytics" className="flex items-center">
                    View stats <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="mr-2 h-4 w-4 text-primary" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$47,500</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">+12% from last month</p>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to="/settings/platform/billing" className="flex items-center">
                    View billing <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Businesses</CardTitle>
              <CardDescription>Latest businesses added to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'b1', name: 'Acme Corporation', industry: 'Technology', agents: 12, users: 8, status: 'active' },
                  { id: 'b2', name: 'Globex Industries', industry: 'Manufacturing', agents: 8, users: 5, status: 'active' },
                  { id: 'b3', name: 'Soylent Corp', industry: 'Food & Beverage', agents: 5, users: 4, status: 'pending' },
                  { id: 'b4', name: 'Initech Solutions', industry: 'Consulting', agents: 3, users: 2, status: 'active' },
                ].map((business) => (
                  <div key={business.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-card/50 hover:bg-accent/5 transition-colors">
                    <div>
                      <h3 className="font-medium text-sm">{business.name}</h3>
                      <p className="text-xs text-muted-foreground">{business.industry}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm">{business.agents} agents</div>
                        <div className="text-xs text-muted-foreground">{business.users} experts</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        business.status === 'active' ? 'bg-green-100 text-green-700' : 
                        business.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <Link to={`/businesses/${business.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/businesses">View All Businesses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Domain Experts</CardTitle>
              <CardDescription>Recently added domain specialists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'u1', name: 'Jane Doe', role: 'Marketing Specialist', business: 'Acme Corp' },
                  { id: 'u2', name: 'John Smith', role: 'Technical Support', business: 'Globex Industries' },
                  { id: 'u3', name: 'Alice Johnson', role: 'HR Manager', business: 'Initech Solutions' },
                  { id: 'u4', name: 'Bob Williams', role: 'Sales Expert', business: 'Soylent Corp' },
                ].map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-md bg-card/50 hover:bg-accent/5 transition-colors">
                    <div>
                      <h3 className="font-medium text-sm">{user.name}</h3>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                      <p className="text-xs text-muted-foreground">{user.business}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                      <Link to={`/users/${user.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/users">View All Experts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                Platform Performance
              </CardTitle>
              <CardDescription>Key metrics across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="usage">
                <TabsList className="mb-4">
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="growth">Growth</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
                <TabsContent value="usage" className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  [API Usage & Resources Chart]
                </TabsContent>
                <TabsContent value="growth" className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Business & User Growth Chart]
                </TabsContent>
                <TabsContent value="revenue" className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Revenue & Subscription Chart]
                </TabsContent>
              </Tabs>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/analytics">View Detailed Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SuperAdminDashboard;
