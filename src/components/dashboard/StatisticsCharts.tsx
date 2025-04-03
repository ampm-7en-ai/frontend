
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CheckCircle, Cpu } from 'lucide-react';
import { AgentPerformanceChart } from './AgentPerformanceChart';

const StatisticsCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Conversion Statistics
          </CardTitle>
          <CardDescription>Customer engagement and conversion metrics</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <AgentPerformanceChart type="conversion" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cpu className="mr-2 h-5 w-5" />
            Customer Satisfaction
          </CardTitle>
          <CardDescription>Feedback and satisfaction levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="shadow-none border">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">CSAT Score</div>
                <div className="text-2xl font-bold mt-1 text-green-600">4.7/5</div>
              </CardContent>
            </Card>
            <Card className="shadow-none border">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">NPS</div>
                <div className="text-2xl font-bold mt-1">+68</div>
              </CardContent>
            </Card>
            <Card className="shadow-none border">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Satisfied</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">92%</div>
              </CardContent>
            </Card>
          </div>
          <div className="h-[200px]">
            <AgentPerformanceChart type="satisfaction" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCharts;
