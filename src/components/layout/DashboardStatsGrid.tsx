
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  route?: string;
  linkText?: string;
};

const DashboardStatsGrid = ({ stats }: { stats: StatCardProps[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              {stat.icon}
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">{stat.change}</p>
              {stat.route && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                  <Link to={stat.route} className="flex items-center">
                    {stat.linkText || "View all"} <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStatsGrid;
