
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import ModernTabNavigation from './ModernTabNavigation';
import CSATChart from './charts/CSATChart';
import SatisfactionChart from './charts/SatisfactionChart';
import NPSChart from './charts/NPSChart';

interface StatisticsChartsProps {
  satisfactionTrends?: Array<{ name: string; satisfaction: number; csat?: number; nps?: number; }>;
  satisfactionBreakdown?: Array<{ name: string; value: number; color: string; }>;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  satisfactionTrends = [],
  satisfactionBreakdown = []
}) => {
  const [activeTab, setActiveTab] = useState('csat');

  const tabs = [
    { id: 'csat', label: 'CSAT' },
    { id: 'satisfaction', label: 'Satisfaction' },
    { id: 'nps', label: 'NPS' }
  ];

  // Use real satisfaction trend data from API
  const satisfactionTrendData = satisfactionTrends.length > 0 ? satisfactionTrends.map(item => ({
    name: item.name,
    satisfaction: item.satisfaction || null,
    csat: item.csat || null,
    nps: item.nps || null
  })) : [
    { name: 'Week 1', satisfaction: 8.8, csat: 4.2, nps: 55 },
    { name: 'Week 2', satisfaction: 9.1, csat: 4.4, nps: 62 },
    { name: 'Week 3', satisfaction: 8.7, csat: 4.1, nps: 48 },
    { name: 'Week 4', satisfaction: 9.3, csat: 4.6, nps: 71 },
    { name: 'Week 5', satisfaction: 9.5, csat: 4.8, nps: 78 },
    { name: 'Week 6', satisfaction: 9.2, csat: 4.7, nps: 68 },
    { name: 'Week 7', satisfaction: 9.6, csat: 4.9, nps: 82 },
  ];

  // Process data for each metric
  const processMetricData = (dataKey: 'satisfaction' | 'csat' | 'nps') => {
    const validData = satisfactionTrendData.filter(item => item[dataKey] !== null && item[dataKey] !== 0);
    const hasData = validData.length > 0;
    
    if (!hasData) {
      return {
        currentValue: 0,
        trend: 'neutral' as const,
        trendValue: 0,
        sparklineData: [],
        hasData: false
      };
    }

    // Create sparkline data with the correct property name for each metric
    const sparklineData = satisfactionTrendData.map(item => {
      if (dataKey === 'csat') {
        return { name: item.name, csat: item.csat };
      } else if (dataKey === 'satisfaction') {
        return { name: item.name, satisfaction: item.satisfaction };
      } else {
        return { name: item.name, nps: item.nps };
      }
    });

    const currentValue = validData[validData.length - 1][dataKey];
    const previousValue = validData.length > 1 ? validData[validData.length - 2][dataKey] : currentValue;
    
    const trendValue = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    const trend: 'up' | 'down' | 'neutral' = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';

    return {
      currentValue,
      trend,
      trendValue: Math.abs(trendValue),
      sparklineData,
      hasData: true
    };
  };

  const satisfactionData = processMetricData('satisfaction');
  const csatData = processMetricData('csat');
  const npsData = processMetricData('nps');

  // Calculate overall data quality
  const totalWeeks = satisfactionTrendData.length;
  const weeksWithData = satisfactionTrendData.filter(item => 
    item.satisfaction > 0 || item.csat > 0 || item.nps !== 0
  ).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'csat':
        return (
          <CSATChart
            data={csatData.sparklineData}
            currentValue={csatData.currentValue}
            trend={csatData.trend}
            trendValue={csatData.trendValue}
            hasData={csatData.hasData}
          />
        );
      case 'satisfaction':
        return (
          <SatisfactionChart
            data={satisfactionData.sparklineData}
            currentValue={satisfactionData.currentValue}
            trend={satisfactionData.trend}
            trendValue={satisfactionData.trendValue}
            hasData={satisfactionData.hasData}
          />
        );
      case 'nps':
        return (
          <NPSChart
            data={npsData.sparklineData}
            currentValue={npsData.currentValue}
            trend={npsData.trend}
            trendValue={npsData.trendValue}
            hasData={npsData.hasData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-3xl overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              Customer Satisfaction Metrics
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {weeksWithData} of {totalWeeks} weeks have satisfaction data
            </CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <ModernTabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCharts;
