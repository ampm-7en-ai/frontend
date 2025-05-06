
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Users, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  Shield, 
  Zap, 
  Server, 
  Database,
  AlertCircle,
  CheckCircle,
  WifiHigh
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BusinessAdminStats } from '@/components/dashboard/BusinessAdminStats';

const SuperAdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Platform Dashboard</h2>
          <p className="text-muted-foreground">Overview of your entire platform</p>
        </div>
        <Button asChild>
          <Link to="/system-health" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            System Health
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
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
              <MessageSquare className="mr-2 h-4 w-4 text-primary" />
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14,392</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">+8% from last week</p>
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

      {/* Business Admin Stats & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Admin Stats Card - Replacing Quick Access */}
        <BusinessAdminStats />
        
        {/* Redesigned System Status Card - More minimal and cleaner */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Service health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <Progress value={98} className="h-1.5" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <Progress value={99} className="h-1.5" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">LLM Services</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                </div>
                <Progress value={72} className="h-1.5" />
              </div>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <Progress value={95} className="h-1.5" />
              </div>
            </div>
            
            <div className="bg-muted/40 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <WifiHigh className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Uptime</span>
                    <span className="text-sm">99.98%</span>
                  </div>
                  <Progress value={99.98} className="h-1.5 mt-1" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link to="/system-health" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  View detailed status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System notifications from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              title: 'High Memory Usage',
              description: 'LLM Service worker process exceeded memory threshold',
              time: '12 minutes ago',
              severity: 'warning',
            },
            { 
              title: 'API Rate Limit',
              description: 'Business ID B1023 exceeded API rate limits',
              time: '43 minutes ago',
              severity: 'warning',
            },
            { 
              title: 'Database Backup Completed',
              description: 'Weekly backup completed successfully',
              time: '2 hours ago',
              severity: 'success',
            },
          ].map((alert, index) => (
            <div key={index} className="flex items-start gap-3 p-2 border-b last:border-b-0 border-border">
              {alert.severity === 'warning' ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-medium text-sm">{alert.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
              <Link to="/system-health">
                View all alerts <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
