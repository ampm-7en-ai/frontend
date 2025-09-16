
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, Legend } from 'recharts';
import { Clock, MessageCircle, Star, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AgentPerformanceSummary as PerformanceSummaryType, AgentPerformanceComparison, PerformanceDataItem } from '@/hooks/useAdminDashboard';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

interface AgentPerformanceSummaryProps {
  agentPerformanceSummary: PerformanceSummaryType;
  agentPerformanceComparison: AgentPerformanceComparison[];
  conversationChannel: Record<string, number>;
  chartData?: {
    daily_performance: PerformanceDataItem[];
    weekly_performance: PerformanceDataItem[];
    monthly_performance: PerformanceDataItem[];
    yearly_performance: PerformanceDataItem[];
  };
}

const CHANNEL_COLORS = {
  website: '#3b82f6',
  facebook: '#1877f2',
  whatsapp: '#25d366',
  instagram: '#e4405f',
  playground: '#8b5cf6',
  ticketing: '#f59e0b'
};

const AgentPerformanceSummary: React.FC<AgentPerformanceSummaryProps> = ({
  agentPerformanceSummary,
  agentPerformanceComparison,
  conversationChannel,
  chartData,
}) => {
  const [activeTab, setActiveTab] = useState('Today');
  const [selectedChannel, setSelectedChannel] = useState('all');

  const timeTabs = [
    { id: 'Today', label: 'Today' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '1Y', label: '1Y' }
  ];

  // Generate channel options from actual conversation_channels data
  const channelOptions = [
    { value: 'all', label: 'All Channels' },
    ...Object.keys(conversationChannel).map(channel => ({
      value: channel,
      label: channel.charAt(0).toUpperCase() + channel.slice(1)
    }))
  ];

  // Get chart data based on activeTab
  const getChartData = () => {
    let baseData: PerformanceDataItem[] = [];
    
    if (chartData) {
      switch (activeTab) {
        case 'Today':
          baseData = chartData.daily_performance || [];
          break;
        case '1W':
          baseData = chartData.weekly_performance || [];
          break;
        case '1M':
          baseData = chartData.monthly_performance || [];
          break;
        case '1Y':
          baseData = chartData.yearly_performance || [];
          break;
        default:
          baseData = chartData.daily_performance || [];
      }
    }

    return baseData;
  };

  const chartDisplayData = getChartData();

  // Get available channels from the data
  const getAvailableChannels = () => {
    if (!chartDisplayData.length) return [];
    
    const firstDataPoint = chartDisplayData[0];
    const channelKeys = Object.keys(firstDataPoint).filter(key => 
      key.endsWith('_queries') && key !== 'queries'
    );
    
    return channelKeys.map(key => key.replace('_queries', ''));
  };

  const availableChannels = getAvailableChannels();

  // Render the chart based on selected channel
  const renderChart = () => {
    if (selectedChannel === 'all') {
      // Show all channels as area chart with gradients
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartDisplayData} margin={{ bottom: 40, left: 10, right: 10, top: 10 }}>
            <defs>
              {/* Create gradients for each channel */}
              {availableChannels.map(channel => (
                <linearGradient 
                  key={`${channel}Gradient`}
                  id={`${channel}Gradient`} 
                  x1="0" 
                  y1="0" 
                  x2="0" 
                  y2="1"
                >
                  <stop 
                    offset="5%" 
                    stopColor={CHANNEL_COLORS[channel as keyof typeof CHANNEL_COLORS] || '#6b7280'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={CHANNEL_COLORS[channel as keyof typeof CHANNEL_COLORS] || '#6b7280'} 
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={activeTab === '1M' ? -45 : 0}
              textAnchor={activeTab === '1M' ? 'end' : 'middle'}
              height={activeTab === '1M' ? 80 : 60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))'
              }}
            />
            {/* <Legend 
              wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }}
              iconType="rect"
            /> */}
            {/* Individual channel areas */}
            {availableChannels.map(channel => (
              <Area
                key={channel}
                type="monotone"
                dataKey={`${channel}_queries`}
                stroke={CHANNEL_COLORS[channel as keyof typeof CHANNEL_COLORS] || '#6b7280'}
                //fill={`url(#${channel}Gradient)`}
                fill='none'
                strokeWidth={2}
                fillOpacity={1}
                name={channel.charAt(0).toUpperCase() + channel.slice(1)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      // Show single channel as area chart
      const channelDataKey = `${selectedChannel}_queries`;
      const channelColor = CHANNEL_COLORS[selectedChannel as keyof typeof CHANNEL_COLORS] || '#3b82f6';
      
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartDisplayData} margin={{ bottom: 40, left: 10, right: 10, top: 10 }}>
            <defs>
              <linearGradient id="channelGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={channelColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={channelColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={activeTab === '1M' ? -45 : 0}
              textAnchor={activeTab === '1M' ? 'end' : 'middle'}
              height={activeTab === '1M' ? 80 : 60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))'
              }}
            />
            {/* <Legend 
              wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }}
              iconType="rect"
            /> */}
            <Area 
              type="monotone" 
              dataKey={channelDataKey}
              stroke={channelColor}
              fillOpacity={1} 
              fill="url(#channelGradient)"
              strokeWidth={2}
              name={`${selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)} Conversations`}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className="bg-white shadow-none dark:bg-neutral-800/60 border-0 rounded-lg h-full pl-0">
      <CardHeader className="pb-4 pl-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground pl-5">
            Conversation Statistics
          </CardTitle>
          <div className="flex items-center gap-3">
            <ModernTabNavigation 
              tabs={timeTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="text-xs"
            />
            <ModernDropdown
              value={selectedChannel}
              onValueChange={setSelectedChannel}
              options={channelOptions}
              placeholder="Select Channel"
              className="w-32 h-8 text-xs border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pl-0 pb-0">
        <div className="h-80">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceSummary;
