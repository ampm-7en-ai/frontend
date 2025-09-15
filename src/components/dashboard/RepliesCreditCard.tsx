// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import ModernButton from './ModernButton';

interface RepliesCreditCardProps {
  used: number;
  total: number;
}

const RepliesCreditCard: React.FC<RepliesCreditCardProps> = ({ used, total }) => {
  const percentage = (used / total) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          Replies credit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Replies used: <span className="text-[#F06425] font-semibold">{used}</span> on {total}
          </p>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={`circular-bar`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F06425" stopOpacity="0.9"/>
                    <stop offset="50%" stopColor="#F06425" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#F06425" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={`url(#circular-bar)`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F06425]">{Math.round(percentage)}%</div>
                  <div className="text-xs text-muted-foreground">used</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className='text-center'>
          <ModernButton variant='gradient' size='sm'>
          Upgrade plan
        </ModernButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepliesCreditCard;