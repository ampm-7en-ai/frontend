
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Clock, MessageSquare, Activity } from 'lucide-react';

// Sample data for agent performance comparison
const agentPerformanceData = [
  { 
    agent: 'Customer Support Agent', 
    conversations: 1203, 
    responseTime: '1.2s',
    satisfaction: 92
  },
  { 
    agent: 'Sales Assistant', 
    conversations: 845, 
    responseTime: '1.5s',
    satisfaction: 88
  },
  { 
    agent: 'Technical Support', 
    conversations: 532, 
    responseTime: '2.1s',
    satisfaction: 85
  },
];

const AgentPerformanceSummary = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Agent Performance Summary</CardTitle>
        <CardDescription>Agent performance metrics and conversation statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  <h3 className="text-2xl font-bold mt-1">1.5s</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    -0.3s from last month
                  </p>
                </div>
                <div className="p-2 rounded-md bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <h3 className="text-2xl font-bold mt-1">2,580</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-2 rounded-md bg-green-100">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">User Satisfaction</p>
                  <h3 className="text-2xl font-bold mt-1">88%</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +3% from last month
                  </p>
                </div>
                <div className="p-2 rounded-md bg-amber-100">
                  <Activity className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Agent Performance Comparison</h3>
          <p className="text-xs text-muted-foreground">Compare metrics across your AI agents.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Conversations</th>
                  <th className="pb-2 font-medium">Avg. Response Time</th>
                  <th className="pb-2 font-medium">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformanceData.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 text-sm">
                    <td className="py-3 font-medium">{agent.agent}</td>
                    <td className="py-3">{agent.conversations}</td>
                    <td className="py-3">{agent.responseTime}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span>{agent.satisfaction}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${agent.satisfaction}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceSummary;
