// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface SatisfactionBreakdownCardProps {
  positive?: number;
  neutral?: number;
  negative?: number;
}

const SatisfactionBreakdownCard: React.FC<SatisfactionBreakdownCardProps> = ({
  positive = 85,
  neutral = 12,
  negative = 3
}) => {
  return (
    <Card className="bg-card dark:bg-card border-border dark:border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          Customer satisfaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">All over satisfaction</p>
        
        <div className="flex justify-around items-center">
          {/* Positive */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Positive</div>
              <div className="text-lg font-semibold text-foreground">{positive}%</div>
            </div>
          </div>

          {/* Neutral */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <span className="text-2xl">😐</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Neutral</div>
              <div className="text-lg font-semibold text-foreground">{neutral}%</div>
            </div>
          </div>

          {/* Negative */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-2xl">☹️</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Negative</div>
              <div className="text-lg font-semibold text-foreground">{negative}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionBreakdownCard;