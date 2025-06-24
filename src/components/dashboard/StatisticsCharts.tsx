
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Star, Heart, Users, TrendingUp, Bot } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from 'lucide-react';

const StatisticsCharts = () => {
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

  // Sample satisfaction trend data
  const satisfactionTrendData = [
    { name: 'Jan', satisfaction: 85, nps: 42, csat: 4.2 },
    { name: 'Feb', satisfaction: 88, nps: 48, csat: 4.4 },
    { name: 'Mar', satisfaction: 92, nps: 52, csat: 4.6 },
    { name: 'Apr', satisfaction: 89, nps: 45, csat: 4.5 },
    { name: 'May', satisfaction: 94, nps: 58, csat: 4.7 },
    { name: 'Jun', satisfaction: 91, nps: 55, csat: 4.6 },
  ];

  // Generate dynamic agent satisfaction data based on time period
  const generateAgentSatisfactionData = () => {
    const baseData = [
      { agent: 'Customer Service', satisfaction: 92, conversations: 145, avgRating: 4.6 },
      { agent: 'Sales Agent', satisfaction: 88, conversations: 98, avgRating: 4.4 },
      { agent: 'Tech Support', satisfaction: 94, conversations: 76, avgRating: 4.7 },
      { agent: 'HR Assistant', satisfaction: 85, conversations: 45, avgRating: 4.2 },
      { agent: 'Billing Bot', satisfaction: 90, conversations: 67, avgRating: 4.5 },
    ];

    // Modify data based on selected time period
    let multiplier = 1;
    if (conversationActiveTab === '1W') multiplier = 0.9;
    else if (conversationActiveTab === '1M') multiplier = 3.2;
    else if (conversationActiveTab === '1Y') multiplier = 15;

    return baseData.map(item => ({
      ...item,
      conversations: Math.round(item.conversations * multiplier),
      satisfaction: Math.max(70, Math.min(98, item.satisfaction + (Math.random() - 0.5) * 10))
    }));
  };

  const agentSatisfactionData = generateAgentSatisfactionData();

  return (
    <div className="space-y-6">
      {/* Agent Performance with Satisfaction - Moved to top */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                Agent Performance & Satisfaction
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Customer satisfaction by agent ({conversationActiveTab})
              </CardDescription>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={agentSatisfactionData} 
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="agent" 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => [
                    name === 'satisfaction' ? `${value}%` : value,
                    name === 'satisfaction' ? 'Satisfaction Rate' : 'Conversations'
                  ]}
                />
                <Bar 
                  dataKey="satisfaction" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]}
                  name="Satisfaction Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Agent Performance Summary */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Top Performer</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tech Support</div>
              <div className="text-xs text-green-600 dark:text-green-400">94% satisfaction</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Most Active</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Customer Service</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">{agentSatisfactionData[0]?.conversations} conversations</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center lg:block hidden">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Avg Rating</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">4.5 / 5.0</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Across all agents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Satisfaction - Full Width */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
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
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Overall Satisfaction */}
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Overall</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">92%</div>
              <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </div>
            </div>

            {/* CSAT Score */}
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">CSAT</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">4.7</div>
              <div className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.3
              </div>
            </div>

            {/* NPS Score */}
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">NPS</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">+68</div>
              <div className="flex items-center justify-center text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12
              </div>
            </div>
          </div>

          {/* Mini Satisfaction Trends Chart */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={satisfactionTrendData}>
                <defs>
                  <linearGradient id="satisfactionGradientFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
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
                  dataKey="satisfaction" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#satisfactionGradientFull)"
                  strokeWidth={2}
                  name="Satisfaction %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCharts;
