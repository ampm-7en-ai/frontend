
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Clock, MessageCircle, Star, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AgentPerformanceSummary as PerformanceSummaryType, AgentPerformanceComparison } from '@/hooks/useAdminDashboard';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentPerformanceSummaryProps {
  agentPerformanceSummary: PerformanceSummaryType;
  agentPerformanceComparison: AgentPerformanceComparison[];
  conversationChannel: Record<string, number>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AgentPerformanceSummary: React.FC<AgentPerformanceSummaryProps> = ({
  agentPerformanceSummary,
  agentPerformanceComparison,
  conversationChannel,
}) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [selectedChannel, setSelectedChannel] = useState('all');

  const timeTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  // Generate conversation data based on selected filters
  const generateConversationData = () => {
    let baseData;
    
    if (activeTab === 'Today') {
      baseData = [
        { name: '6AM', queries: 15, conversions: 8 },
        { name: '9AM', queries: 25, conversions: 12 },
        { name: '12PM', queries: 45, conversions: 28 },
        { name: '3PM', queries: 65, conversions: 42 },
        { name: '6PM', queries: 50, conversions: 30 },
        { name: '9PM', queries: 30, conversions: 18 },
        { name: '12AM', queries: 10, conversions: 5 },
      ];
    } else if (activeTab === '1W') {
      baseData = [
        { name: 'Mo', queries: 65, conversions: 32 },
        { name: 'Tu', queries: 78, conversions: 45 },
        { name: 'We', queries: 82, conversions: 53 },
        { name: 'Th', queries: 70, conversions: 40 },
        { name: 'Fr', queries: 90, conversions: 58 },
        { name: 'Sa', queries: 50, conversions: 28 },
        { name: 'Su', queries: 40, conversions: 22 },
      ];
    } else if (activeTab === '1M') {
      baseData = [
        { name: 'Jan', queries: 1850, conversions: 920 },
        { name: 'Feb', queries: 2100, conversions: 1260 },
        { name: 'Mar', queries: 2350, conversions: 1530 },
        { name: 'Apr', queries: 2000, conversions: 1200 },
        { name: 'May', queries: 2600, conversions: 1690 },
        { name: 'Jun', queries: 2200, conversions: 1320 },
      ];
    } else { // 1Y
      baseData = [
        { name: '2023', queries: 18500, conversions: 9200 },
        { name: '2024', queries: 25600, conversions: 16900 },
        { name: '2025', queries: 22000, conversions: 13200 },
      ];
    }

    // Modify data based on selected channel
    let multiplier = 1;
    if (selectedChannel === 'whatsapp') multiplier = 0.8;
    else if (selectedChannel === 'slack') multiplier = 0.6;
    else if (selectedChannel === 'messenger') multiplier = 0.4;
    else if (selectedChannel === 'website') multiplier = 0.9;

    return baseData.map(item => ({
      ...item,
      queries: Math.round(item.queries * multiplier),
      conversions: Math.round(item.conversions * multiplier)
    }));
  };

  const conversationData = generateConversationData();

  return (
    <Card className="bg-transparent border-0 0 rounded-3xl shadow-none overflow-hidden h-full pl-0">
      <CardHeader className="pb-4 pl-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Conversation Statistics
          </CardTitle>
          <div className="flex items-center gap-3">
            <ModernTabNavigation 
              tabs={timeTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="text-xs"
            />
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-32 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="messenger">Messenger</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
            <ModernButton variant="outline" size="sm" icon={Download}>
              Export
            </ModernButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pl-0 pb-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={conversationData} margin={{ bottom: 20, left: 10, right: 10 }}>
              <defs>
                <linearGradient id="queriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="queries" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#queriesGradient)"
                strokeWidth={2}
                name="Total Queries"
              />
              <Area 
                type="monotone" 
                dataKey="conversions" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#conversionsGradient)"
                strokeWidth={2}
                name="Successful Conversions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceSummary;
