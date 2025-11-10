import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

interface SentimentJourneyChartProps {
  chartData: Array<{
    index: number;
    score: number;
    movingAverage?: number;
  }>;
  height?: number;
}

const SentimentJourneyChart = ({ 
  chartData, 
  height = 220
}: SentimentJourneyChartProps) => {

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const score = payload[0]?.value;
    const movingAvg = payload[0]?.payload?.movingAverage;
    const getSentimentLabel = (s: number) => {
      if (s <= 3) return { label: 'Frustrated', color: 'hsl(0, 70%, 50%)' };
      if (s <= 6) return { label: 'Neutral', color: 'hsl(45, 70%, 50%)' };
      return { label: 'Satisfied', color: 'hsl(142, 70%, 45%)' };
    };
    
    const sentiment = getSentimentLabel(score);
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-foreground mb-1">
          Message {payload[0]?.payload?.index}
        </p>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: sentiment.color }}
          />
          <p className="text-sm font-semibold" style={{ color: sentiment.color }}>
            {sentiment.label}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Score: {score?.toFixed(1)}
        </p>
        {movingAvg !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            3-msg avg: {movingAvg.toFixed(1)}
          </p>
        )}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3}
          vertical={false}
        />
        
        {/* Sentiment zone indicators */}
        <ReferenceLine 
          y={7} 
          stroke="hsl(142, 50%, 60%)" 
          strokeDasharray="5 5"
          opacity={0.2}
        />
        <ReferenceLine 
          y={3.5} 
          stroke="hsl(0, 50%, 60%)" 
          strokeDasharray="5 5"
          opacity={0.2}
        />
        
        <XAxis 
          dataKey="index" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          label={{ 
            value: 'Messages', 
            position: 'insideBottom', 
            offset: -5,
            style: { 
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11
            }
          }}
        />
        <YAxis 
          domain={[0, 10]}
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          ticks={[0, 3.5, 7, 10]}
          tickFormatter={(value) => {
            if (value === 3.5) return '';
            if (value === 7) return '';
            return value;
          }}
          label={{ 
            value: 'Score', 
            angle: -90, 
            position: 'insideLeft',
            style: { 
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11
            }
          }}
        />
        
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
        
        <Line
          type="monotone"
          dataKey="score"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={{ 
            fill: 'hsl(var(--background))', 
            stroke: 'hsl(var(--primary))',
            strokeWidth: 2,
            r: 4
          }}
          activeDot={{ 
            r: 6, 
            fill: 'hsl(var(--primary))',
            stroke: 'hsl(var(--background))',
            strokeWidth: 2
          }}
          animationDuration={800}
          animationEasing="ease-in-out"
        />
        
        {/* 3-message moving average */}
        <Line
          type="monotone"
          dataKey="movingAverage"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ 
            r: 5, 
            fill: 'hsl(var(--muted-foreground))',
            stroke: 'hsl(var(--background))',
            strokeWidth: 2
          }}
          animationDuration={800}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SentimentJourneyChart;
