import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Server, RefreshCw, Database, Cpu, MemoryStick, HardDrive } from 'lucide-react';

const SystemHealth = () => {
  return (
    <div className="space-y-6">
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
              <Cpu className="mr-2 h-4 w-4 text-primary" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Swap Usage</div>
                  <div className="text-2xl font-bold">12%</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Page Faults</div>
                  <div className="text-2xl font-bold">23/min</div>
                </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">IOPS</div>
                  <div className="text-2xl font-bold">124</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Latency</div>
                  <div className="text-2xl font-bold">5ms</div>
                </div>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Issues</CardTitle>
            <CardDescription>Recent system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 'a1',
                  title: 'High Memory Usage',
                  description: 'LLM Service worker process exceeded memory threshold',
                  time: '12 minutes ago',
                  severity: 'warning',
                },
                { 
                  id: 'a2',
                  title: 'API Rate Limit',
                  description: 'Business ID B1023 exceeded API rate limits',
                  time: '43 minutes ago',
                  severity: 'warning',
                },
                { 
                  id: 'a3',
                  title: 'Database Backup Completed',
                  description: 'Weekly backup completed successfully',
                  time: '2 hours ago',
                  severity: 'success',
                },
                { 
                  id: 'a4',
                  title: 'SSL Certificate Expiring',
                  description: 'Certificate for api.example.com expires in 14 days',
                  time: '1 day ago',
                  severity: 'warning',
                },
              ].map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border border-border rounded-md bg-card/50 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start gap-3">
                    {alert.severity === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium text-sm">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
            <CardDescription>System maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 'm1',
                  title: 'Database Optimization',
                  description: 'Scheduled for tonight at 2:00 AM',
                  status: 'scheduled',
                  impact: 'No downtime expected',
                },
                { 
                  id: 'm2',
                  title: 'LLM Model Update',
                  description: 'Deploying new version of GPT-4-turbo',
                  status: 'in-progress',
                  impact: 'Possible latency increase for 30 minutes',
                },
                { 
                  id: 'm3',
                  title: 'Security Patches',
                  description: 'OS-level security updates',
                  status: 'completed',
                  impact: 'Completed with no issues',
                  completedTime: 'Yesterday at 4:32 PM',
                },
              ].map((task) => (
                <div key={task.id} className="p-3 border border-border rounded-md bg-card/50 hover:bg-accent/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{task.title}</h3>
                    <Badge variant="outline" className={
                      task.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {task.status === 'scheduled' ? 'Scheduled' :
                       task.status === 'in-progress' ? 'In Progress' :
                       'Completed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{
                    task.status === 'completed' ? 
                    `Completed: ${task.completedTime}` : 
                    `Impact: ${task.impact}`
                  }</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="outline" className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealth;
