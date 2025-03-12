
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart2, Building, Calendar, CreditCard, Download, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PlatformAnalytics = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">Review platform-wide statistics and performance metrics.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <Building className="h-4 w-4 text-primary" />
              Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,843</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-primary" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24,328</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+18.3%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-primary" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$126,580</div>
            <div className="flex items-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+7.4%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Business and user growth over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [Growth Chart - Businesses & Users]
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conversation Volume</CardTitle>
                <CardDescription>Total conversations by week</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [Conversation Volume Chart]
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [Revenue Chart]
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
              <CardDescription>Detailed business account statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">124</div>
                    <div className="text-xs text-muted-foreground">79% of total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trial Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">18</div>
                    <div className="text-xs text-muted-foreground">11% of total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Inactive Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">14</div>
                    <div className="text-xs text-muted-foreground">9% of total</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [Business Distribution Chart by Plan & Status]
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Metrics</CardTitle>
              <CardDescription>Platform user statistics and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">2,216</div>
                    <div className="text-xs text-muted-foreground">78% of total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">New Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">387</div>
                    <div className="text-xs text-muted-foreground">Last 30 days</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">18:32</div>
                    <div className="text-xs text-muted-foreground">minutes:seconds</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [User Activity & Engagement Chart]
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance and subscription metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$42,193</div>
                    <div className="text-xs text-green-600">↑ $3,428 (8.8%)</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">ARR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$506,316</div>
                    <div className="text-xs text-green-600">↑ 9.2% YoY</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$270</div>
                    <div className="text-xs text-green-600">↑ 2.3% MoM</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">2.1%</div>
                    <div className="text-xs text-green-600">↓ 0.4% vs prev.</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                [Revenue Breakdown by Plan Type & Region]
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAnalytics;
