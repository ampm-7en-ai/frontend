
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernStatCardProps {
  title: string;
  value: number;
  icon: any;
  gradient: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient
}) => {
  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg transition-all duration-300">
      <CardContent className="p-6 relative pb-2">
        {/* Icon positioned at top right */}
        <div className={`absolute top-4 right-4 p-0 z-10`}>
          {/* <span className="absolute top-1 right-1 p-3 bg-[#f06425] -z-10 blur-md opacity-50 hidden dark:block"></span> */}
          {Icon && <Icon className="h-5 w-5 text-white" type='plain' color="hsl(var(--foreground))" />}
        </div>
        
        <div className="pr-12">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <p className="text-3xl font-normal text-foreground mb-3">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
