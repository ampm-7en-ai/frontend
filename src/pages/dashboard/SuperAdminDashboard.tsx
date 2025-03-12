import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Building, Users, Bot, MessageSquare, ChevronRight, BarChart2, Zap, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardStatsGrid, { StatCardProps } from '@/components/layout/DashboardStatsGrid';

const SuperAdminDashboard = () => {
  const dashboardStats: StatCardProps[] = [
    {
      icon: <Building className="mr-2 h-4 w-4 text-primary" />,
      title: "Total Businesses",
      value: 24,
      change: "+3 from last month",
      route: "/businesses",
      linkText: "View all"
    },
    {
      icon: <Users className="mr-2 h-4 w-4 text-primary" />,
      title: "Domain Experts",
      value: 48,
      change: "+7 from last month",
      route: "/users",
      linkText: "View all"
    },
    {
      icon: <Bot className="mr-2 h-4 w-4 text-primary" />,
      title: "Active Agents",
      value: 187,
      change: "+15 from last month",
      route: "/analytics",
      linkText: "View stats"
    },
    {
      icon: <Zap className="mr-2 h-4 w-4 text-primary" />,
      title: "Monthly Revenue",
      value: "$47,500",
      change: "+12% from last month",
      route: "/settings/platform/billing",
      linkText: "View billing"
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardStatsGrid stats={dashboardStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Management</CardTitle>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <TabsContent value="usage" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                [API Usage & Resources Chart]
              </TabsContent>
              <TabsContent value="growth" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                [Business & User Growth Chart]
              </TabsContent>
              <TabsContent value="revenue" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Domain experts by specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { specialty: 'Marketing', count: 12, icon: User },
                { specialty: 'Technical Support', count: 9, icon: User },
                { specialty: 'HR', count: 6, icon: User },
                { specialty: 'Finance', count: 7, icon: User },
                { specialty: 'Sales', count: 14, icon: User },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <category.icon className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{category.specialty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{category.count} experts</span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                      <Link to={`/users?specialty=${category.specialty.toLowerCase()}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link to="/users">Manage Domain Experts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
