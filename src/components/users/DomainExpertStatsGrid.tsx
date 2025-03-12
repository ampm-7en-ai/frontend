
import React from 'react';
import DashboardStatsGrid, { StatCardProps } from '@/components/layout/DashboardStatsGrid';
import { Users, TrendingUp, CheckCircle, Clock, Briefcase } from 'lucide-react';

export const useDomainExpertStats = () => {
  // This could later be connected to actual data fetching
  const expertStats: StatCardProps[] = [
    {
      icon: <Users className="h-4 w-4 text-primary mr-1" />,
      title: "Total Experts",
      value: 287,
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+5.8%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <CheckCircle className="h-4 w-4 text-primary mr-1" />,
      title: "Active Experts",
      value: 243,
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+4.2%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <Clock className="h-4 w-4 text-primary mr-1" />,
      title: "Avg. Response Time",
      value: "2.8h",
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">-12.5%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <Briefcase className="h-4 w-4 text-primary mr-1" />,
      title: "Business Coverage",
      value: "94%",
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+2.1%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    }
  ];

  return expertStats;
};

const DomainExpertStatsGrid = () => {
  const expertStats = useDomainExpertStats();
  
  return <DashboardStatsGrid stats={expertStats} />;
};

export default DomainExpertStatsGrid;
