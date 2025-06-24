
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Cpu, Star, Heart, Users } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';
import ModernTabNavigation from './ModernTabNavigation';
import ModernButton from './ModernButton';

const StatisticsCharts = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'satisfaction', label: 'Satisfaction' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <ModernTabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex gap-2">
          <ModernButton variant="outline" size="sm">
            Export
          </ModernButton>
          <ModernButton variant="primary" size="sm">
            Refresh
          </ModernButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Conversion Statistics */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Conversion Statistics
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Customer engagement and conversion metrics
                </CardDescription>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AgentPerformanceChart type="conversion" />
          </CardContent>
        </Card>
        
        {/* Customer Satisfaction */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  Customer Satisfaction
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Feedback and satisfaction levels
                </CardDescription>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">CSAT Score</div>
                  <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">4.7/5</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">NPS</div>
                  <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">+68</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Satisfied</div>
                  <div className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">92%</div>
                </CardContent>
              </Card>
            </div>
            <div className="h-[200px]">
              <AgentPerformanceChart type="satisfaction" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsCharts;
