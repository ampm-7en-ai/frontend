
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function PlatformInsightsCard() {
  const insights = [
    {
      title: "Security Status",
      status: "Good",
      statusType: "success",
      icon: Shield,
      details: "All security checks passed",
      actionText: "Review Security",
      actionLink: "/settings/platform/security"
    },
    {
      title: "API Performance",
      status: "Normal",
      statusType: "success",
      icon: Zap,
      details: "Response time: 124ms (avg)",
      actionText: "View System Health",
      actionLink: "/system-health"
    },
    {
      title: "LLM Services",
      status: "Degraded",
      statusType: "warning",
      icon: AlertTriangle,
      details: "High memory usage detected",
      actionText: "Check LLM Settings",
      actionLink: "/settings/platform/llm-providers"
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          Platform Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <insight.icon className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{insight.title}</span>
                  <Badge variant="outline" className={
                    insight.statusType === 'success' ? 'bg-green-100 text-green-800' : 
                    insight.statusType === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }>
                    {insight.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.details}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={insight.actionLink}>{insight.actionText}</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
