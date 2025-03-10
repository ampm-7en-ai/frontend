
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export function StatCard({ title, value, icon, change, className }: StatCardProps) {
  return (
    <div className={cn(
      "card flex flex-col h-full",
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-dark-gray font-medium text-sm">{title}</h3>
        <div className="p-2 rounded-md bg-light-gray text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-heading-2 font-semibold">{value}</span>
        {change && (
          <div className={cn(
            "flex items-center text-sm",
            change.isPositive ? "text-success" : "text-destructive"
          )}>
            {change.isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
