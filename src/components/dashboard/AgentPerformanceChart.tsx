
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const agentPerformanceData = [
  { agent: 'Support Bot', conversations: 78, satisfaction: 85, responseTime: 0.8 },
  { agent: 'Sales Bot', conversations: 64, satisfaction: 92, responseTime: 0.6 },
  { agent: 'Technical Bot', conversations: 52, satisfaction: 78, responseTime: 1.2 },
  { agent: 'Billing Bot', conversations: 48, satisfaction: 88, responseTime: 0.9 },
  { agent: 'Product Bot', conversations: 42, satisfaction: 90, responseTime: 0.7 },
];

const channelData = [
  { name: 'Monday', whatsapp: 24, slack: 12, instagram: 8, freshdesk: 5 },
  { name: 'Tuesday', whatsapp: 18, slack: 22, instagram: 10, freshdesk: 7 },
  { name: 'Wednesday', whatsapp: 30, slack: 16, instagram: 12, freshdesk: 9 },
  { name: 'Thursday', whatsapp: 22, slack: 18, instagram: 15, freshdesk: 8 },
  { name: 'Friday', whatsapp: 26, slack: 20, instagram: 18, freshdesk: 11 },
  { name: 'Saturday', whatsapp: 14, slack: 8, instagram: 9, freshdesk: 3 },
  { name: 'Sunday', whatsapp: 10, slack: 6, instagram: 7, freshdesk: 2 },
];

const satisfactionData = [
  { name: 'Delighted', value: 35 },
  { name: 'Satisfied', value: 40 },
  { name: 'Neutral', value: 15 },
  { name: 'Dissatisfied', value: 7 },
  { name: 'Frustrated', value: 3 },
];

interface AgentPerformanceChartProps {
  type: 'agent' | 'channel' | 'satisfaction';
}

export function AgentPerformanceChart({ type }: AgentPerformanceChartProps) {
  const renderAgentChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={agentPerformanceData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="agent" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="conversations" fill="#8884d8" name="Conversations" />
        <Bar dataKey="satisfaction" fill="#82ca9d" name="Satisfaction %" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChannelChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={channelData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="whatsapp" fill="#25D366" name="WhatsApp" />
        <Bar dataKey="slack" fill="#4A154B" name="Slack" />
        <Bar dataKey="instagram" fill="#E1306C" name="Instagram" />
        <Bar dataKey="freshdesk" fill="#0052CC" name="Freshdesk" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSatisfactionChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={satisfactionData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip />
        <Bar 
          dataKey="value" 
          fill="#8884d8" 
          background={{ fill: '#eee' }}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case 'agent':
        return renderAgentChart();
      case 'channel':
        return renderChannelChart();
      case 'satisfaction':
        return renderSatisfactionChart();
      default:
        return renderAgentChart();
    }
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4 h-full">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
