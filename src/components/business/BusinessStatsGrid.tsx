
import React from 'react';
import DashboardStatsGrid, { StatCardProps } from '@/components/layout/DashboardStatsGrid';
import { Building, TrendingUp, Users, Bot, CreditCard } from 'lucide-react';

export const useBusinessStats = () => {
  // This could later be connected to actual data fetching
  const businessStats: StatCardProps[] = [
    {
      icon: <Building className="h-4 w-4 text-primary mr-1" />,
      title: "Total Businesses",
      value: 156,
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+12%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <Users className="h-4 w-4 text-primary mr-1" />,
      title: "Business Users",
      value: 1843,
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+8.5%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <Bot className="h-4 w-4 text-primary mr-1" />,
      title: "Active Agents",
      value: 487,
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+15.7%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    },
    {
      icon: <CreditCard className="h-4 w-4 text-primary mr-1" />,
      title: "Revenue",
      value: "$98,450",
      change: <div className="flex items-center mt-1 text-xs">
        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-green-600 font-medium">+6.2%</span>
        <span className="text-muted-foreground ml-1">vs last period</span>
      </div>
    }
  ];

  return businessStats;
};

const BusinessStatsGrid = () => {
  const businessStats = useBusinessStats();
  
  return <DashboardStatsGrid stats={businessStats} />;
};

export default BusinessStatsGrid;
