
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Star, Heart, Users, TrendingUp, Bot } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from 'lucide-react';

interface StatisticsChartsProps {
  satisfactionTrends?: Array<{ name: string; satisfaction: number; csat?: number; nps?: number; }>;
  satisfactionBreakdown?: Array<{ name: string; value: number; color: string; }>;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  satisfactionTrends = [],
  satisfactionBreakdown = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [conversationActiveTab, setConversationActiveTab] = useState('Today');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'satisfaction', label: 'Satisfaction' }
  ];

  const conversationTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  // Use real satisfaction trend data from API
  const satisfactionTrendData = satisfactionTrends.length > 0 ? satisfactionTrends.map(item => ({
    name: item.name,
    satisfaction: item.satisfaction,
    // Use actual CSAT and NPS values from API if available, otherwise fallback to 0
    csat: item.csat || 0,
    nps: item.nps || 0
  })) : [
    { name: 'Week 1', satisfaction: 8.8, csat: 4.2, nps: 55 },
    { name: 'Week 2', satisfaction: 9.1, csat: 4.4, nps: 62 },
    { name: 'Week 3', satisfaction: 8.7, csat: 4.1, nps: 48 },
    { name: 'Week 4', satisfaction: 9.3, csat: 4.6, nps: 71 },
    { name: 'Week 5', satisfaction: 9.5, csat: 4.8, nps: 78 },
    { name: 'Week 6', satisfaction: 9.2, csat: 4.7, nps: 68 },
    { name: 'Week 7', satisfaction: 9.6, csat: 4.9, nps: 82 },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-3xl overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              Customer Satisfaction
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Satisfaction metrics and trends
            </CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={satisfactionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--foreground))',
                  fontSize: '12px'
                }}
                formatter={(value, name) => {
                  if (name === 'Avg Satisfaction Score') {
                    return [`${value}/10`, name];
                  }
                  if (name === 'CSAT Score') {
                    return [`${value}/10`, name];
                  }
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                name="Avg Satisfaction Score"
              />
              <Line 
                type="monotone" 
                dataKey="csat" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="CSAT Score"
              />
              <Line 
                type="monotone" 
                dataKey="nps" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="NPS Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCharts;
