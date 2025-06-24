
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

  // Sample satisfaction distribution data for pie chart
  const satisfactionDistribution = [
    { name: 'Excellent', value: 45, color: '#22c55e' },
    { name: 'Good', value: 30, color: '#3b82f6' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Poor', value: 7, color: '#ef4444' },
    { name: 'Very Poor', value: 3, color: '#dc2626' },
  ];

  // Sample NPS data for radial chart
  const npsData = [
    { name: 'NPS Score', value: 68, fill: '#8b5cf6' },
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

        <div className="grid grid-cols-2 gap-6 h-40">
          {/* Satisfaction Distribution Pie Chart */}
          <div className="h-full">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Satisfaction Distribution</div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {satisfactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}%`, 'Rating']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* NPS Radial Chart */}
          <div className="h-full">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Net Promoter Score</div>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={npsData}>
                <RadialBar 
                  dataKey="value" 
                  cornerRadius={10} 
                  fill="#8b5cf6"
                  background={{ fill: '#f1f5f9' }}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold text-purple-600">
                  +68
                </text>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`+${value}`, 'NPS Score']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCharts;
