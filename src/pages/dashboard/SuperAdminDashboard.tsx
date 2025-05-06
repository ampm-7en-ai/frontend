
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { 
  Building, 
  Users, 
  Bot, 
  MessageSquare, 
  ChevronRight, 
  BarChart2, 
  Zap, 
  Shield, 
  Server, 
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start mb-6" variant="github">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
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

          {/* System Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-primary" />
                      API Services
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <Progress value={24} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">24% load • 124ms response time</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-primary" />
                      Database
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <Progress value={36} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">36% connection pool • 47ms query time</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-primary" />
                      LLM Services
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                  </div>
                  <Progress value={78} className="h-1.5" />
                  <div className="text-xs text-muted-foreground">78% load • 1.2s inference time</div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/system-health" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    View detailed system health
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Key Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>Quick access to platform configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center text-center" asChild>
                    <Link to="/settings/platform/general">
                      <Settings className="h-6 w-6 mb-2" />
                      <span className="text-sm">General Settings</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center text-center" asChild>
                    <Link to="/settings/platform/security">
                      <Shield className="h-6 w-6 mb-2" />
                      <span className="text-sm">Security</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center text-center" asChild>
                    <Link to="/settings/platform/llm-providers">
                      <Bot className="h-6 w-6 mb-2" />
                      <span className="text-sm">LLM Providers</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center text-center" asChild>
                    <Link to="/settings/platform/billing">
                      <Zap className="h-6 w-6 mb-2" />
                      <span className="text-sm">Billing</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
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
        </TabsContent>
        
        <TabsContent value="businesses" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Business Management</h2>
              <p className="text-muted-foreground">Manage businesses on the platform</p>
            </div>
            <Button asChild>
              <Link to="/businesses/add" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Business
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Businesses</CardTitle>
              <CardDescription>All businesses registered on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 'b1', name: 'Acme Corporation', industry: 'Technology', agents: 12, users: 8, status: 'active' },
                    { id: 'b2', name: 'Globex Industries', industry: 'Manufacturing', agents: 8, users: 5, status: 'active' },
                    { id: 'b3', name: 'Soylent Corp', industry: 'Food & Beverage', agents: 5, users: 4, status: 'pending' },
                    { id: 'b4', name: 'Initech Solutions', industry: 'Consulting', agents: 3, users: 2, status: 'active' },
                    { id: 'b5', name: 'Wayne Enterprises', industry: 'Conglomerate', agents: 14, users: 9, status: 'active' },
                    { id: 'b6', name: 'Stark Industries', industry: 'Technology', agents: 10, users: 7, status: 'active' },
                  ].map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell>{business.industry}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          business.status === 'active' ? 'bg-green-100 text-green-800' : 
                          business.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'
                        }>
                          {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{business.agents}</TableCell>
                      <TableCell>{business.users}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/businesses/${business.id}`}>
                            Manage <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/businesses">View All Businesses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          {/* System health metrics similar to the SystemHealth page */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Server className="mr-2 h-4 w-4 text-primary" />
                  API Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Status</div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Response Time: 124ms
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Load</span>
                    <span>24%</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="mr-2 h-4 w-4 text-primary" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Status</div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Query Time: 47ms
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Connection Pool</span>
                    <span>36%</span>
                  </div>
                  <Progress value={36} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Bot className="mr-2 h-4 w-4 text-primary" />
                  LLM Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Status</div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Inference Time: 1.2s
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Load</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>Current server resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="compute">
                <TabsList className="mb-4">
                  <TabsTrigger value="compute">Compute</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                </TabsList>
                
                <TabsContent value="compute" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">CPU Usage</div>
                      <div>42%</div>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Active Processes</div>
                      <div className="text-2xl font-bold">127</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Average Load (15m)</div>
                      <div className="text-2xl font-bold">0.76</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="memory" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">Memory Usage</div>
                      <div>68% (13.6GB / 20GB)</div>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </TabsContent>
                
                <TabsContent value="storage" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="font-medium">Disk Usage</div>
                      <div>53% (265GB / 500GB)</div>
                    </div>
                    <Progress value={53} className="h-2" />
                  </div>
                </TabsContent>
                
                <TabsContent value="network" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Inbound Traffic</div>
                      <div className="text-2xl font-bold">12.4 MB/s</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Outbound Traffic</div>
                      <div className="text-2xl font-bold">8.7 MB/s</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-2">
            <Button asChild>
              <Link to="/system-health" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                View Full System Health
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
