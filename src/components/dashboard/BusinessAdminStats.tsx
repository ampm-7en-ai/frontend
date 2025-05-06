
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { Activity, Users, BriefcaseBusiness, TrendingUp } from 'lucide-react';

const mockBusinessData = [
  { name: 'Mon', admins: 12 },
  { name: 'Tue', admins: 15 },
  { name: 'Wed', admins: 18 },
  { name: 'Thu', admins: 14 },
  { name: 'Fri', admins: 22 },
  { name: 'Sat', admins: 10 },
  { name: 'Sun', admins: 8 },
];

export function BusinessAdminStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Admin Statistics</CardTitle>
        <CardDescription>Key metrics about business administrators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin Activity Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Active Admins" 
            value="87%" 
            icon={<Users className="h-4 w-4" />} 
            change={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Admin Logins Today" 
            value="38" 
            icon={<Activity className="h-4 w-4" />} 
            change={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Admin Distribution */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Admin User Distribution</h4>
            <Badge variant="outline">Last 7 days</Badge>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={mockBusinessData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(value) => [`${value} admins`, 'Active']}
                contentStyle={{ 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="admins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
                
        {/* Business Admin Performance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Top Performing Business</h4>
            <span className="text-xs text-muted-foreground">Acme Corp</span>
          </div>
          <Progress value={85} className="h-2" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Task completion rate</span>
            <span className="text-xs font-medium">85%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Admin Response Time</h4>
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
          <Progress value={68} className="h-2" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Under 5 minutes</span>
            <span className="text-xs font-medium">68%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
