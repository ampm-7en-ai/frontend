
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient
}) => {
  return (
    <Card className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-transparent rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 relative pb-2">
        {/* Icon positioned at top right */}
        <div className={`absolute top-4 right-4 p-2 rounded-xl ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        
        <div className="pr-12">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
