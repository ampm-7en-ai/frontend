
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Clock, MessageSquare, Activity } from 'lucide-react';
import { AgentPerformanceSummary as AgentPerformanceSummaryType, AgentPerformanceComparison, AdminDashboardData } from '@/hooks/useAdminDashboard';

type AgentPerformanceSummaryProps = {
  agentPerformanceSummary: AgentPerformanceSummaryType;
  agentPerformanceComparison: AgentPerformanceComparison[];
  conversationChannel: AdminDashboardData.conversation_channel;
};

// Sample data for channel statistics
const channelStats = [
  { channel: 'WhatsApp', count: 64, percentage: 50 },
  { channel: 'Slack', count: 32, percentage: 25 },
  { channel: 'Instagram', count: 21, percentage: 16 },
  { channel: 'Freshdesk', count: 11, percentage: 9 },
];

const AgentPerformanceSummary = ({ 
  agentPerformanceSummary, 
  agentPerformanceComparison,
  conversationChannel 
}: AgentPerformanceSummaryProps) => {
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
                  <h3 className="text-2xl font-bold mt-1">{agentPerformanceSummary.avg_response_time.value}s</h3>
                  <p className={`text-xs flex items-center mt-1 ${agentPerformanceSummary.avg_response_time.change_direction === 'decrease' ? 'text-red-600' : 'text-green-600'}`}>
                    {agentPerformanceSummary.avg_response_time.change_direction === 'decrease' ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {agentPerformanceSummary.avg_response_time.change_direction === 'decrease' ? '-' : '+'}
                    {agentPerformanceSummary.avg_response_time.change}s from last month
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
                  <h3 className="text-2xl font-bold mt-1">{agentPerformanceSummary.total_conversations.value.toLocaleString()}</h3>
                  <p className={`text-xs flex items-center mt-1 ${agentPerformanceSummary.total_conversations.change_direction === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {agentPerformanceSummary.total_conversations.change_direction === 'increase' ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {agentPerformanceSummary.total_conversations.change !== 0 ? (
                      <>
                        {agentPerformanceSummary.total_conversations.change_direction === 'increase' ? '+' : '-'}
                        {agentPerformanceSummary.total_conversations.change}% from last month
                      </>
                    ) : (
                      'No change from last month'
                    )}
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
                  <h3 className="text-2xl font-bold mt-1">{agentPerformanceSummary.user_satisfaction.value}%</h3>
                  <p className={`text-xs flex items-center mt-1 ${agentPerformanceSummary.user_satisfaction.change_direction === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {agentPerformanceSummary.user_satisfaction.change_direction === 'increase' ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {agentPerformanceSummary.user_satisfaction.change !== 0 ? (
                      <>
                        {agentPerformanceSummary.user_satisfaction.change_direction === 'increase' ? '+' : '-'}
                        {agentPerformanceSummary.user_satisfaction.change}% from last month
                      </>
                    ) : (
                      'No change from last month'
                    )}
                  </p>
                </div>
                <div className="p-2 rounded-md bg-amber-100">
                  <Activity className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Conversation Channels Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">Conversation Channels</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {channelStats.map((item, index) => (
              <Card key={index} className="border p-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{item.channel}</span>
                  <span className="text-lg font-bold">{item.count}</span>
                  <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{item.percentage}%</span>
                </div>
              </Card>
            ))}
          </div>
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
                {agentPerformanceComparison.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-100 text-sm">
                    <td className="py-3 font-medium">{agent.agent_name}</td>
                    <td className="py-3">{agent.conversations}</td>
                    <td className="py-3">{agent.avg_response_time}s</td>
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
