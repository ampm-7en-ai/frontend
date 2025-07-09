
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import CSATvsNPSChart from './charts/CSATvsNPSChart';

interface StatisticsChartsProps {
  satisfactionTrends?: Array<{ name: string; satisfaction: number; csat?: number; nps?: number; }>;
  satisfactionBreakdown?: Array<{ name: string; value: number; color: string; }>;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  satisfactionTrends = [],
  satisfactionBreakdown = []
}) => {
  // Use real satisfaction trend data from API with updated CSAT values (0-100 scale)
  const satisfactionTrendData = satisfactionTrends.length > 0 ? satisfactionTrends.map(item => ({
    name: item.name,
    satisfaction: item.satisfaction || null,
    csat: item.csat || null,
    nps: item.nps || null
  })) : [
    { name: 'Week 1', satisfaction: 8.8, csat: 84, nps: 55 },
    { name: 'Week 2', satisfaction: 9.1, csat: 88, nps: 62 },
    { name: 'Week 3', satisfaction: 8.7, csat: 82, nps: 48 },
    { name: 'Week 4', satisfaction: 9.3, csat: 92, nps: 71 },
    { name: 'Week 5', satisfaction: 9.5, csat: 96, nps: 78 },
    { name: 'Week 6', satisfaction: 9.2, csat: 94, nps: 68 },
    { name: 'Week 7', satisfaction: 9.6, csat: 98, nps: 82 },
  ];

  // Process data for CSAT and NPS metrics
  const processMetricData = (dataKey: 'csat' | 'nps') => {
    const validData = satisfactionTrendData.filter(item => item[dataKey] !== null && item[dataKey] !== 0);
    const hasData = validData.length > 0;
    
    if (!hasData) {
      return {
        currentValue: 0,
        trend: 'neutral' as const,
        trendValue: 0,
        hasData: false
      };
    }

    const currentValue = validData[validData.length - 1][dataKey];
    const previousValue = validData.length > 1 ? validData[validData.length - 2][dataKey] : currentValue;
    
    const trendValue = previousValue !== 0 ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 : 0;
    const trend: 'up' | 'down' | 'neutral' = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';

    return {
      currentValue,
      trend,
      trendValue: Math.abs(trendValue),
      hasData: true
    };
  };

  const csatData = processMetricData('csat');
  const npsData = processMetricData('nps');

  // Calculate overall data quality
  const totalWeeks = satisfactionTrendData.length;
  const weeksWithData = satisfactionTrendData.filter(item => 
    (item.csat && item.csat > 0) || (item.nps !== null && item.nps !== 0)
  ).length;

  // Prepare chart data
  const chartData = satisfactionTrendData.map(item => ({
    name: item.name,
    csat: item.csat || null,
    nps: item.nps || null
  }));

  const hasData = csatData.hasData || npsData.hasData;

  return (
    <Card className="bg-white dark:bg-slate-900 border-0 rounded-3xl overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <div className="mt-2">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            CSAT vs NPS Comparison
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {weeksWithData} of {totalWeeks} weeks have satisfaction data
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="min-h-[400px]">
          <CSATvsNPSChart
            data={chartData}
            currentCSAT={csatData.currentValue}
            currentNPS={npsData.currentValue}
            csatTrend={csatData.trend}
            npsTrend={npsData.trend}
            csatTrendValue={csatData.trendValue}
            npsTrendValue={npsData.trendValue}
            hasData={hasData}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCharts;
