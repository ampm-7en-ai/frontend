
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Sample data for agent performance
const agentData = [
  { name: 'Support Bot', conversations: 120, satisfaction: 85 },
  { name: 'Sales Bot', conversations: 98, satisfaction: 92 },
  { name: 'Tech Bot', conversations: 86, satisfaction: 78 },
  { name: 'Billing Bot', conversations: 75, satisfaction: 81 },
  { name: 'Product Bot', conversations: 62, satisfaction: 89 },
];

// Sample data for satisfaction
const satisfactionData = [
  { name: 'Delighted', value: 42 },
  { name: 'Satisfied', value: 28 },
  { name: 'Neutral', value: 15 },
  { name: 'Dissatisfied', value: 10 },
  { name: 'Frustrated', value: 5 },
];

// Sample data for channel distribution
const channelData = [
  { name: 'WhatsApp', value: 35 },
  { name: 'Web Chat', value: 25 },
  { name: 'Instagram', value: 20 },
  { name: 'Slack', value: 15 },
  { name: 'Email', value: 5 },
];

// Sample data for trend
const trendData = [
  { name: 'Mon', conversations: 25, resolutions: 20 },
  { name: 'Tue', conversations: 40, resolutions: 32 },
  { name: 'Wed', conversations: 35, resolutions: 28 },
  { name: 'Thu', conversations: 50, resolutions: 42 },
  { name: 'Fri', conversations: 45, resolutions: 40 },
  { name: 'Sat', conversations: 20, resolutions: 15 },
  { name: 'Sun', conversations: 15, resolutions: 12 },
];

interface AgentPerformanceChartProps {
  type: 'agent' | 'satisfaction' | 'channel' | 'trend';
  loading?: boolean;
}

// Colors for the various charts - using more subtle gradients
const SATISFACTION_COLORS = ['#4ade80', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];
const CHANNEL_COLORS = ['#25D366', '#3B82F6', '#E1306C', '#4A154B', '#4285F4'];
const BAR_COLORS = ['#8884d8', '#82ca9d'];
const LINE_COLORS = ['#8884d8', '#82ca9d'];

export function AgentPerformanceChart({ type, loading = false }: AgentPerformanceChartProps) {
  // Return loading skeleton if data is loading
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Agent Usage Chart (Bar Chart)
  if (type === 'agent') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={agentData}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          barSize={16}
          barGap={8}
        >
          <defs>
            <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            tickLine={false}
            textAnchor="end"
            height={50}
            interval={0}
            tick={(props) => {
              const { x, y, payload } = props;
              const name = payload.value;
              const shortName = name.replace(" Bot", "");
              return (
                <text x={x} y={y + 10} fill="#888" fontSize={10} textAnchor="middle">
                  {shortName}
                </text>
              );
            }}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            tickLine={false}
            domain={[0, 'dataMax + 20']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            formatter={(value: number) => [`${value}`, 'Conversations']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar 
            dataKey="conversations" 
            fill="url(#colorConversations)" 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            name="Conversations"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Satisfaction Distribution (Pie Chart)
  if (type === 'satisfaction') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            {SATISFACTION_COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`satisfaction-color-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={satisfactionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            animationDuration={1500}
          >
            {satisfactionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#satisfaction-color-${index})`} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} users`, 'Count']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Channel Distribution (Pie Chart)
  if (type === 'channel') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            {CHANNEL_COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`channel-color-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={channelData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            animationDuration={1500}
          >
            {channelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#channel-color-${index})`} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Percentage']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Trend (Line Chart)
  if (type === 'trend') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={trendData}
          margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorConversationsTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorResolutionsTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            tickLine={false}
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '6px',
              border: '1px solid #F3F4F6',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
          />
          <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="conversations" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={1500}
            name="Total Conversations"
          />
          <Line 
            type="monotone" 
            dataKey="resolutions" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            animationDuration={1500}
            animationBegin={300}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default case - return null if type doesn't match
  return null;
}
