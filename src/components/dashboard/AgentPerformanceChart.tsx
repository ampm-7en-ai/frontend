
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
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
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
  { name: 'Delighted', value: 35, color: '#10B981' },
  { name: 'Satisfied', value: 40, color: '#60A5FA' },
  { name: 'Neutral', value: 15, color: '#9CA3AF' },
  { name: 'Dissatisfied', value: 7, color: '#F97316' },
  { name: 'Frustrated', value: 3, color: '#EF4444' },
];

const trendData = [
  { day: 'Mon', conversations: 125 },
  { day: 'Tue', conversations: 132 },
  { day: 'Wed', conversations: 146 },
  { day: 'Thu', conversations: 138 },
  { day: 'Fri', conversations: 152 },
  { day: 'Sat', conversations: 94 },
  { day: 'Sun', conversations: 82 },
];

interface AgentPerformanceChartProps {
  type: 'agent' | 'channel' | 'satisfaction' | 'trend';
}

export function AgentPerformanceChart({ type }: AgentPerformanceChartProps) {
  const renderAgentChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={agentPerformanceData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="conversationsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="agent" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <ChartTooltip
          content={(props) => {
            if (!props.active || !props.payload) return null;
            return (
              <div className="rounded-lg bg-white p-2 shadow-lg border border-gray-100 text-xs">
                <p className="font-semibold mb-1">{props.payload[0]?.payload.agent}</p>
                {props.payload.map((entry, index) => (
                  <p key={index} className="text-xs">
                    <span className="font-medium">{entry.name}: </span>
                    <span>{entry.value}</span>
                    {entry.name === 'Satisfaction' && '%'}
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36} 
          iconType="circle" 
          iconSize={8}
        />
        <Bar 
          dataKey="conversations" 
          name="Conversations" 
          fill="url(#conversationsGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={30}
          animationDuration={1500}
        />
        <Bar 
          dataKey="satisfaction" 
          name="Satisfaction %" 
          fill="url(#satisfactionGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={30}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderChannelChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={channelData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="whatsappGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#25D366" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#25D366" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="slackGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A154B" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4A154B" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="instagramGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E1306C" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#E1306C" stopOpacity={0.2}/>
          </linearGradient>
          <linearGradient id="freshdeskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0052CC" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#0052CC" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <ChartTooltip
          content={(props) => {
            if (!props.active || !props.payload) return null;
            return (
              <div className="rounded-lg bg-white p-2 shadow-lg border border-gray-100 text-xs">
                <p className="font-semibold mb-1">{props.payload[0]?.payload.name}</p>
                {props.payload.map((entry, index) => (
                  <p key={index} className="text-xs">
                    <span className="font-medium">{entry.name}: </span>
                    <span>{entry.value} conversations</span>
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36} 
          iconType="circle" 
          iconSize={8}
        />
        <Bar 
          dataKey="whatsapp" 
          name="WhatsApp" 
          fill="url(#whatsappGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={8}
          animationDuration={1500}
        />
        <Bar 
          dataKey="slack" 
          name="Slack" 
          fill="url(#slackGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={8}
          animationDuration={1500}
        />
        <Bar 
          dataKey="instagram" 
          name="Instagram" 
          fill="url(#instagramGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={8}
          animationDuration={1500}
        />
        <Bar 
          dataKey="freshdesk" 
          name="Freshdesk" 
          fill="url(#freshdeskGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={8}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSatisfactionChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <Pie
          data={satisfactionData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          animationDuration={1500}
        >
          {satisfactionData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke="none" 
              className="hover:opacity-80 transition-opacity"
            />
          ))}
        </Pie>
        <ChartTooltip
          content={(props) => {
            if (!props.active || !props.payload?.length === 0) return null;
            const data = props.payload[0]?.payload;
            return (
              <div className="rounded-lg bg-white p-2 shadow-lg border border-gray-100 text-xs">
                <p className="font-semibold mb-1">{data.name}</p>
                <p className="text-xs">
                  <span className="font-medium">Value: </span>
                  <span>{data.value}%</span>
                </p>
              </div>
            );
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          align="center" 
          layout="horizontal" 
          iconType="circle" 
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={trendData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickLine={false} 
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <ChartTooltip
          content={(props) => {
            if (!props.active || !props.payload) return null;
            const data = props.payload[0]?.payload;
            return (
              <div className="rounded-lg bg-white p-2 shadow-lg border border-gray-100 text-xs">
                <p className="font-semibold mb-1">{data.day}</p>
                <p className="text-xs">
                  <span className="font-medium">Conversations: </span>
                  <span>{data.conversations}</span>
                </p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="conversations"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }}
          activeDot={{ r: 6, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
          animationDuration={1500}
        />
      </LineChart>
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
      case 'trend':
        return renderTrendChart();
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
