
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, Zap, TrendingUp } from 'lucide-react';
import { UsageHistoryItem } from '@/hooks/useAdminDashboard';

interface UsageStatsCardProps {
  agentUse: {
    credits_used: number;
    credits_total: number;
    agents_used: number;
  };
  usageHistory: UsageHistoryItem[];
}

const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ agentUse, usageHistory }) => {
  const usagePercentage = Math.round((agentUse.credits_used / agentUse.credits_total) * 100);

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Credits Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Credits Used</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {agentUse.credits_used.toLocaleString()} / {agentUse.credits_total.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {usagePercentage}% utilized
              </span>
            </div>
          </div>

          {/* Active Agents */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <Zap className="h-6 w-6 mr-3" />
              <div>
                <p className="text-sm opacity-90">Active Agents</p>
                <p className="text-2xl font-bold">{agentUse.agents_used}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History Chart */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-slate-600 dark:text-slate-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  className="dark:bg-slate-800"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="url(#gradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1d4ed8' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageStatsCard;
