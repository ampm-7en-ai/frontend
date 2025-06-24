
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

  // Sample satisfaction trend data for line chart
  const satisfactionTrendData = [
    { name: 'Week 1', satisfaction: 88, csat: 4.2, nps: 55 },
    { name: 'Week 2', satisfaction: 91, csat: 4.4, nps: 62 },
    { name: 'Week 3', satisfaction: 87, csat: 4.1, nps: 48 },
    { name: 'Week 4', satisfaction: 93, csat: 4.6, nps: 71 },
    { name: 'Week 5', satisfaction: 95, csat: 4.8, nps: 78 },
    { name: 'Week 6', satisfaction: 92, csat: 4.7, nps: 68 },
    { name: 'Week 7', satisfaction: 96, csat: 4.9, nps: 82 },
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

        <div className="h-52">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Satisfaction Trends</div>
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                name="Overall Satisfaction %"
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
