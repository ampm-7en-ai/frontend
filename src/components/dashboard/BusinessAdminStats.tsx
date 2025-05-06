
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Clock, Award, Zap, AlertTriangle } from 'lucide-react';

const mockUserData = [
  { name: 'Super Admins', value: 5, color: '#3b82f6' },
  { name: 'Business Admins', value: 24, color: '#10b981' },
  { name: 'Content Managers', value: 38, color: '#6366f1' },
  { name: 'Agents', value: 18, color: '#f59e0b' },
];

const mockPriorityData = [
  { name: 'Critical', value: 3, status: 'critical' },
  { name: 'High', value: 7, status: 'high' },
  { name: 'Medium', value: 12, status: 'medium' },
  { name: 'Low', value: 18, status: 'low' },
];

export function BusinessAdminStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform User Distribution</CardTitle>
        <CardDescription>User roles and system priorities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Role Distribution */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-sm">User Role Distribution</h4>
            <Badge variant="outline">Total: {mockUserData.reduce((acc, item) => acc + item.value, 0)}</Badge>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockUserData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockUserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} users`, 'Count']}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend align="center" verticalAlign="bottom" layout="horizontal" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* System Priorities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-sm">System Priorities</h4>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="space-y-3">
            {mockPriorityData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.status === 'critical' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive mr-1.5" />
                    ) : item.status === 'high' ? (
                      <Zap className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                    ) : item.status === 'medium' ? (
                      <Clock className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                    ) : (
                      <Award className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    )}
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs">{item.value} tasks</span>
                </div>
                <Progress 
                  value={item.value / mockPriorityData.reduce((acc, i) => acc + i.value, 0) * 100} 
                  className="h-1.5" 
                  style={{ 
                    '--progress-background': item.status === 'critical' ? '#ef4444' : 
                      item.status === 'high' ? '#f59e0b' : 
                      item.status === 'medium' ? '#3b82f6' : 
                      '#10b981' 
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
