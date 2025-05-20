
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeDelta } from '@tremor/react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  RefreshCw, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { AgentHandoffNotification, HandoffType } from '@/components/conversations/AgentHandoffNotification';
import HandoffHistory from '@/components/conversations/HandoffHistory';
import { Button } from '@/components/ui/button';

// Sample data for the handoff statistics
const handoffStats = [
  {
    title: "Total Handoffs",
    value: 487,
    change: 12.3,
    changeType: "increase"
  },
  {
    title: "Avg. Resolution Time",
    value: "4m 23s",
    change: -8.5,
    changeType: "decrease"
  },
  {
    title: "Success Rate",
    value: "92%",
    change: 3.2,
    changeType: "increase"
  },
  {
    title: "Customer Satisfaction",
    value: "4.7/5",
    change: 0.3,
    changeType: "increase"
  }
];

// Sample data for active handoffs
const activeHandoffs = [
  {
    id: "h1",
    conversationId: "c12345",
    customer: "John Smith",
    from: "Sales Assistant",
    to: "Technical Support",
    reason: "Technical question beyond sales scope",
    status: "in-progress",
    time: "2 minutes ago"
  },
  {
    id: "h2",
    conversationId: "c12346",
    customer: "Alice Johnson",
    from: "General Assistant",
    to: "Billing Support",
    reason: "Billing dispute requires human review",
    status: "waiting",
    time: "5 minutes ago"
  },
  {
    id: "h3",
    conversationId: "c12347",
    customer: "Bob Miller",
    from: "Customer Support",
    to: "Technical Expert",
    reason: "Complex technical issue",
    status: "accepted",
    time: "1 minute ago"
  },
  {
    id: "h4",
    conversationId: "c12348",
    customer: "Emma Davis",
    from: "Sales Bot",
    to: "Human Sales Rep",
    reason: "Customer requested human agent",
    status: "completed",
    time: "10 minutes ago"
  }
];

// Sample data for handoff history
const handoffHistory = [
  {
    id: "h5",
    from: "General Assistant",
    to: "Technical Support",
    timestamp: "Today, 10:45 AM",
    reason: "Technical question beyond general knowledge"
  },
  {
    id: "h6",
    from: "Technical Support",
    to: "Senior Engineer",
    timestamp: "Today, 10:52 AM",
    reason: "Complex database issue requiring expert attention"
  },
  {
    id: "h7",
    from: "Senior Engineer",
    to: "Customer Success",
    timestamp: "Today, 11:30 AM",
    reason: "Issue resolved, follow-up required"
  }
];

// Sample data for agent performance
const agentPerformance = [
  {
    agent: "General Assistant",
    handoffsInitiated: 145,
    avgHandoffTime: "1m 12s",
    successRate: 94,
    topReason: "Technical questions"
  },
  {
    agent: "Sales Assistant",
    handoffsInitiated: 98,
    avgHandoffTime: "2m 05s",
    successRate: 91,
    topReason: "Complex pricing"
  },
  {
    agent: "Technical Support",
    handoffsInitiated: 76,
    avgHandoffTime: "3m 47s",
    successRate: 88,
    topReason: "Bug escalation"
  },
  {
    agent: "Customer Service",
    handoffsInitiated: 168,
    avgHandoffTime: "1m 35s",
    successRate: 95,
    topReason: "Account issues"
  }
];

// Helper function to get status badge for handoffs
const getHandoffStatusBadge = (status: string) => {
  switch (status) {
    case 'in-progress':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'waiting':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Waiting</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Completed</Badge>;
    case 'failed':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AgentHandoffs = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Handoffs</h1>
          <p className="text-muted-foreground">
            Monitor and manage conversation transfers between agents
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button size="sm" variant="outline" className="mr-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            Configure Rules
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 h-auto w-full max-w-2xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="active">Active Handoffs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {handoffStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center mt-1">
                    <BadgeDelta 
                      deltaType={stat.changeType as "increase" | "decrease" | "unchanged"} 
                      size="xs"
                    >
                      {stat.change}%
                    </BadgeDelta>
                    <span className="text-xs text-muted-foreground ml-1">vs last week</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Handoff Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Handoff Flow Visualization</CardTitle>
              <CardDescription>
                How conversations move between agents over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center">
                  <BarChart className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Handoff flow visualization chart would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Handoffs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Handoffs</CardTitle>
              <CardDescription>
                Latest conversation transfers between agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {handoffHistory.map((handoff) => (
                  <AgentHandoffNotification
                    key={handoff.id}
                    from={handoff.from}
                    to={handoff.to}
                    reason={handoff.reason}
                    timestamp={handoff.timestamp}
                    type="ai-to-ai"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Handoffs</CardTitle>
              <CardDescription>
                Currently ongoing conversation transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeHandoffs.map((handoff) => (
                    <TableRow key={handoff.id}>
                      <TableCell className="font-medium">{handoff.customer}</TableCell>
                      <TableCell>{handoff.from}</TableCell>
                      <TableCell>{handoff.to}</TableCell>
                      <TableCell className="max-w-xs truncate">{handoff.reason}</TableCell>
                      <TableCell>{getHandoffStatusBadge(handoff.status)}</TableCell>
                      <TableCell>{handoff.time}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="h-8">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Handoff Distribution</CardTitle>
                <CardDescription>
                  Current distribution by agent type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                        <span className="text-sm font-medium">AI to AI</span>
                      </div>
                      <Progress value={65} className="h-2 w-full bg-blue-100" />
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                        <span className="text-sm font-medium">AI to Human</span>
                      </div>
                      <Progress value={25} className="h-2 w-full bg-green-100" />
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                        <span className="text-sm font-medium">Human to AI</span>
                      </div>
                      <Progress value={8} className="h-2 w-full bg-purple-100" />
                    </div>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                        <span className="text-sm font-medium">Human to Human</span>
                      </div>
                      <Progress value={2} className="h-2 w-full bg-amber-100" />
                    </div>
                    <span className="text-sm font-medium">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Waiting</div>
                      <div className="text-2xl font-bold">8</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Completed Today</div>
                      <div className="text-2xl font-bold">47</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Failed Today</div>
                      <div className="text-2xl font-bold">3</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Handoff History</CardTitle>
              <CardDescription>
                Review past conversation transfers between agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HandoffHistory handoffs={handoffHistory} />
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Handoff Flow Patterns</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Common path: General → Technical → Customer Success</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">General Assistant</Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Technical Support</Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Customer Success</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">This pattern occurs in 32% of all handoffs</div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Common path: Sales → Billing → Customer Success</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Sales Assistant</Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">Billing Support</Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Customer Success</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">This pattern occurs in 18% of all handoffs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Handoff statistics by agent type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Handoffs Initiated</TableHead>
                    <TableHead>Avg Handoff Time</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Top Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentPerformance.map((agent, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{agent.agent}</TableCell>
                      <TableCell>{agent.handoffsInitiated}</TableCell>
                      <TableCell>{agent.avgHandoffTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={agent.successRate} className="h-2 w-24" />
                          <span>{agent.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{agent.topReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Pairing Optimization</CardTitle>
                <CardDescription>
                  Recommended agent combinations based on performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium mb-2 text-green-700">Optimal Pairing</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-blue-100 text-blue-800 mr-2">Sales Assistant</Badge>
                        <span className="text-gray-500">+</span>
                        <Badge className="bg-purple-100 text-purple-800 ml-2">Technical Support</Badge>
                      </div>
                      <div className="text-sm font-medium text-green-700">98% success</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h4 className="font-medium mb-2 text-blue-700">Recommended Pairing</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-amber-100 text-amber-800 mr-2">General Assistant</Badge>
                        <span className="text-gray-500">+</span>
                        <Badge className="bg-green-100 text-green-800 ml-2">Customer Service</Badge>
                      </div>
                      <div className="text-sm font-medium text-blue-700">95% success</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-amber-50">
                    <h4 className="font-medium mb-2 text-amber-700">Consider Improving</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className="bg-slate-100 text-slate-800 mr-2">Billing Support</Badge>
                        <span className="text-gray-500">+</span>
                        <Badge className="bg-purple-100 text-purple-800 ml-2">Technical Support</Badge>
                      </div>
                      <div className="text-sm font-medium text-amber-700">82% success</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Handoff Recommendations</CardTitle>
                <CardDescription>
                  AI-generated suggestions to improve handoff process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <h4 className="font-medium mb-1">Adjust Technical Support Triggers</h4>
                  <p className="text-sm text-muted-foreground">Technical handoffs are occurring too late in the conversation. Consider adding earlier triggers when technical terms are detected.</p>
                </div>
                
                <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                  <h4 className="font-medium mb-1">Customer Service Agent Pairing</h4>
                  <p className="text-sm text-muted-foreground">Customer Service agents perform 15% better when paired with Sales agents first. Consider adjusting your handoff flow.</p>
                </div>
                
                <div className="p-3 border-l-4 border-purple-500 bg-purple-50 rounded">
                  <h4 className="font-medium mb-1">Reduce Multi-step Handoffs</h4>
                  <p className="text-sm text-muted-foreground">40% of conversations require 3+ handoffs. Consider creating specialized agents that cover multiple domains.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentHandoffs;
