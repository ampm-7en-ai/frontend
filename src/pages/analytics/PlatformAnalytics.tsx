
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const PlatformAnalytics = () => {
  return (
    <MainLayout 
      pageTitle="Platform Analytics" 
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Platform Analytics', href: '/analytics' }
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Businesses</CardTitle>
                  <CardDescription>Platform-wide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground mt-1">+3 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Active Agents</CardTitle>
                  <CardDescription>Across all businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">187</div>
                  <p className="text-xs text-muted-foreground mt-1">+15 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                  <CardDescription>All subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$47,500</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Business Growth
                  </CardTitle>
                  <CardDescription>New business accounts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    [Business Growth Chart]
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Subscription Distribution
                  </CardTitle>
                  <CardDescription>By plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    [Subscription Distribution Chart]
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Platform Usage Trends
                </CardTitle>
                <CardDescription>API calls and resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Platform Usage Chart]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Placeholder content for other tabs */}
          <TabsContent value="businesses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>Performance metrics by business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Business Analytics Content]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>Resource consumption metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Usage Analytics Content]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Response times and system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                  [Performance Analytics Content]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PlatformAnalytics;
