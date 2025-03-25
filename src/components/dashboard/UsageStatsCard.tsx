
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import { Bot, CreditCard, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data for the usage history
const usageHistoryData = [
  { name: '1', value: 0, day: 'Mar 1' },
  { name: '3', value: 0, day: 'Mar 3' },
  { name: '5', value: 0, day: 'Mar 5' },
  { name: '7', value: 0, day: 'Mar 7' },
  { name: '9', value: 0, day: 'Mar 9' },
  { name: '11', value: 0, day: 'Mar 11' },
  { name: '13', value: 0, day: 'Mar 13' },
  { name: '15', value: 0, day: 'Mar 15' },
  { name: '17', value: 0, day: 'Mar 17' },
  { name: '19', value: 0, day: 'Mar 19' },
  { name: '21', value: 12, day: 'Mar 21' },
  { name: '23', value: 0, day: 'Mar 23' },
  { name: '25', value: 0, day: 'Mar 25' },
];

const UsageStatsCard = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Agent Usage</CardTitle>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              <SelectItem value="customer-service">Customer Service</SelectItem>
              <SelectItem value="sales">Sales Agent</SelectItem>
              <SelectItem value="support">Technical Support</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs border rounded-md px-2 py-1 flex items-center">
            2025-03-01 ~ 2025-03-25
            <button className="ml-1">×</button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold mb-1">9</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Credits used</span>
                    <span className="text-xs ml-2">/ 100</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold mb-1">1</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Agents used</span>
                    <span className="text-xs ml-2">/ 1</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Usage history</h3>
            <button className="text-primary text-sm">View details</button>
          </div>
          <div className="h-48 w-full">
            <AgentPerformanceChart type="trend" className="h-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStatsCard;
