
import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
      "card rounded-xl hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-medium-gray font-medium text-sm">{title}</h3>
        <div className="p-2 rounded-full bg-accent text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-heading-2 font-semibold">{value}</span>
        {change && (
          <div className={cn(
            "flex items-center text-xs",
            change.isPositive ? "text-success" : "text-destructive"
          )}>
            {change.isPositive ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
