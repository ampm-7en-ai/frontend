
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Users, ChartBar, UserPlus, UserX } from 'lucide-react';

// Mock data for admin activity metrics
const mockActivityData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 14 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 18 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 5 },
];

// Mock data for team members
const mockTeamData = [
  { name: 'Active', value: 28, status: 'active' },
  { name: 'Inactive', value: 5, status: 'inactive' },
  { name: 'New this month', value: 3, status: 'new' },
];

export function BusinessAdminStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Admin Activity</CardTitle>
        <CardDescription>Weekly activity and team metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin Activity */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ChartBar className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Admin Activity (Last 7 Days)</h4>
            </div>
            <Badge variant="outline" className="font-normal">Total: 98 actions</Badge>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockActivityData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip 
                  formatter={(value) => [`${value} actions`, 'Count']}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {mockActivityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 18 ? '#8B5CF6' : '#D6BCFA'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Team Member Status */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Team Member Status</h4>
            </div>
            <span className="text-xs text-muted-foreground">36 total admins</span>
          </div>
          <div className="space-y-3">
            {mockTeamData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.status === 'active' ? (
                      <Users className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                    ) : item.status === 'inactive' ? (
                      <UserX className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
                    )}
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs">{item.value} admins</span>
                </div>
                <Progress 
                  value={item.value / mockTeamData.reduce((acc, i) => acc + i.value, 0) * 100} 
                  className="h-1.5" 
                  style={{ 
                    '--progress-background': item.status === 'active' ? '#10b981' : 
                      item.status === 'inactive' ? '#9ca3af' : 
                      '#3b82f6' 
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
