import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

type ChartType = 'gradient-area' | 'color-bars' | 'smooth-line' | 'zone-area';

interface SentimentJourneyChartProps {
  chartData: Array<{
    index: number;
    score: number;
    movingAverage?: number;
  }>;
  type?: ChartType;
  width?: number;
  height?: number;
}

const SentimentJourneyChart = ({ 
  chartData, 
  type = 'gradient-area',
  width = 350,
  height = 200
}: SentimentJourneyChartProps) => {

  // Get color based on sentiment score
  const getSentimentColor = (score: number) => {
    if (score <= 3) return 'hsl(0, 70%, 50%)'; // Red - Frustrated
    if (score <= 6) return 'hsl(45, 70%, 50%)'; // Orange - Neutral
    return 'hsl(142, 70%, 45%)'; // Green - Satisfied
  };

  // Gradient Area Chart with smooth curve
  const renderGradientAreaChart = () => (
    <AreaChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.8}/>
          <stop offset="50%" stopColor="hsl(45, 70%, 50%)" stopOpacity={0.4}/>
          <stop offset="100%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.2}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
      
      {/* Background zones */}
      <ReferenceLine y={7} stroke="hsl(142, 50%, 60%)" strokeDasharray="3 3" opacity={0.3} />
      <ReferenceLine y={4} stroke="hsl(45, 50%, 60%)" strokeDasharray="3 3" opacity={0.3} />
      
      <XAxis 
        dataKey="index" 
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        label={{ value: 'Message', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
      />
      <YAxis 
        domain={[0, 10]}
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        ticks={[0, 3, 6, 10]}
        label={{ 
          value: 'Sentiment', 
          angle: -90, 
          position: 'insideLeft',
          fill: 'hsl(var(--muted-foreground))'
        }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '12px'
        }}
        labelStyle={{ color: 'hsl(var(--foreground))' }}
      />
      <Area
        type="monotone"
        dataKey="score"
        stroke="hsl(var(--primary))"
        strokeWidth={3}
        fill="url(#sentimentGradient)"
        animationDuration={1000}
      />
    </AreaChart>
  );

  // Color-coded Bar Chart
  const renderColorBarsChart = () => (
    <BarChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
      <XAxis 
        dataKey="index" 
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        label={{ value: 'Message', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
      />
      <YAxis 
        domain={[0, 10]}
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        ticks={[0, 3, 6, 10]}
        label={{ 
          value: 'Sentiment', 
          angle: -90, 
          position: 'insideLeft',
          fill: 'hsl(var(--muted-foreground))'
        }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '12px'
        }}
        labelStyle={{ color: 'hsl(var(--foreground))' }}
      />
      <Bar 
        dataKey="score" 
        radius={[8, 8, 0, 0]}
        animationDuration={1000}
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={getSentimentColor(entry.score)} />
        ))}
      </Bar>
    </BarChart>
  );

  // Smooth Line Chart with subtle styling
  const renderSmoothLineChart = () => (
    <LineChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" opacity={0.6} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
      
      {/* Sentiment zones with subtle backgrounds */}
      <ReferenceLine y={7} stroke="hsl(142, 50%, 60%)" strokeDasharray="3 3" opacity={0.3} />
      <ReferenceLine y={4} stroke="hsl(45, 50%, 60%)" strokeDasharray="3 3" opacity={0.3} />
      
      <XAxis 
        dataKey="index" 
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        label={{ value: 'Message', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
      />
      <YAxis 
        domain={[0, 10]}
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        ticks={[0, 3, 6, 10]}
        label={{ 
          value: 'Sentiment', 
          angle: -90, 
          position: 'insideLeft',
          fill: 'hsl(var(--muted-foreground))'
        }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '12px'
        }}
        labelStyle={{ color: 'hsl(var(--foreground))' }}
      />
      <Line
        type="monotone"
        dataKey="score"
        stroke="url(#lineGradient)"
        strokeWidth={3}
        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
        activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
        animationDuration={1000}
      />
    </LineChart>
  );

  // Zone-based Area Chart with distinct regions
  const renderZoneAreaChart = () => (
    <AreaChart
      width={width}
      height={height}
      data={chartData}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.6}/>
          <stop offset="100%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
      
      {/* Visual sentiment zones */}
      <ReferenceLine 
        y={7} 
        label={{ value: 'Satisfied', position: 'insideTopRight', fill: 'hsl(142, 70%, 35%)', fontSize: 10 }} 
        stroke="hsl(142, 50%, 50%)" 
        strokeDasharray="5 5"
        opacity={0.5}
      />
      <ReferenceLine 
        y={4} 
        label={{ value: 'Neutral', position: 'insideTopRight', fill: 'hsl(45, 70%, 35%)', fontSize: 10 }} 
        stroke="hsl(45, 50%, 50%)" 
        strokeDasharray="5 5"
        opacity={0.5}
      />
      
      <XAxis 
        dataKey="index" 
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        label={{ value: 'Message', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
      />
      <YAxis 
        domain={[0, 10]}
        stroke="hsl(var(--muted-foreground))"
        fontSize={12}
        ticks={[0, 3, 6, 10]}
        label={{ 
          value: 'Sentiment', 
          angle: -90, 
          position: 'insideLeft',
          fill: 'hsl(var(--muted-foreground))'
        }}
      />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '12px'
        }}
        labelStyle={{ color: 'hsl(var(--foreground))' }}
      />
      <Area
        type="monotone"
        dataKey="score"
        stroke="hsl(142, 70%, 45%)"
        strokeWidth={3}
        fill="url(#positiveGradient)"
        animationDuration={1000}
        dot={{ fill: 'hsl(142, 70%, 45%)', r: 4 }}
      />
    </AreaChart>
  );

  // Render chart based on type
  switch (type) {
    case 'gradient-area':
      return renderGradientAreaChart();
    case 'color-bars':
      return renderColorBarsChart();
    case 'smooth-line':
      return renderSmoothLineChart();
    case 'zone-area':
      return renderZoneAreaChart();
    default:
      return renderGradientAreaChart();
  }
};

export default SentimentJourneyChart;
