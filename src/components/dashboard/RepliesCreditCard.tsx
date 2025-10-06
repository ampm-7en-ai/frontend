// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import ModernButton from './ModernButton';
import { Icon } from '../icons';

interface RepliesCreditCardProps {
  used: number;
  total: number;
}

const RepliesCreditCard: React.FC<RepliesCreditCardProps> = ({ used, total }) => {
  // 'used' prop is actually remaining credits
  const remaining = used;
  const excess = Math.max(0, remaining - total);
  const hasExcess = excess > 0;
  
  // Base circle: show actual remaining up to total capacity
  const baseRemaining = Math.min(remaining, total);
  const basePercentage = (baseRemaining / total) * 100;
  
  // Excess circle: show extra credits beyond total
  const excessPercentage = hasExcess ? (excess / total) * 100 : 0;
  
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const baseStrokeDashoffset = circumference - (basePercentage / 100) * circumference;
  const excessStrokeDashoffset = circumference - (excessPercentage / 100) * circumference;

  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
          <Icon type='plain' name='Cart' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
          Replies credit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Remaining: <span className="text-[#F06425] font-semibold">{remaining}</span>/{total}
            {hasExcess && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                (+{excess} bonus)
              </span>
            )}
          </p>
          
          <div className="flex justify-center mb-6 mt-10">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={`circular-bar`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F06425" stopOpacity="0.9"/>
                    <stop offset="50%" stopColor="#F06425" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#F06425" stopOpacity="1"/>
                  </linearGradient>
                  <linearGradient id={`circular-bar-excess`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
                    <stop offset="50%" stopColor="#059669" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="1"/>
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
                {/* Base progress circle (remaining up to total) */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={`url(#circular-bar)`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={baseStrokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
                {/* Excess progress circle (bonus credits) */}
                {hasExcess && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={`url(#circular-bar-excess)`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={excessStrokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{100-basePercentage.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">used</div>
                  {hasExcess && (
                    <div className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">
                      +{excess} extra
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className='text-center'>
          <Button variant='link' size='sm' className='text-foreground'>
          Upgrade plan
        </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepliesCreditCard;