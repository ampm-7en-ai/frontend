
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell, 
  LineChart, Line, Sector, AreaChart, Area 
} from 'recharts';

// Sample data for the chart
const agentData = [
  { name: 'Customer Service', value: 35, color: '#0ea5e9' },
  { name: 'Sales Agent', value: 25, color: '#4ade80' },
  { name: 'Technical Support', value: 20, color: '#fb923c' },
  { name: 'Finance Bot', value: 15, color: '#9333ea' },
  { name: 'HR Assistant', value: 5, color: '#ec4899' },
];

const satisfactionData = [
  { name: 'Very Satisfied', value: 42, color: '#4ade80' },
  { name: 'Satisfied', value: 28, color: '#22c55e' },
  { name: 'Neutral', value: 15, color: '#f59e0b' },
  { name: 'Dissatisfied', value: 10, color: '#f97316' },
  { name: 'Very Dissatisfied', value: 5, color: '#ef4444' },
];

const channelData = [
  { name: 'WhatsApp', value: 40, color: '#25D366' },
  { name: 'Website', value: 25, color: '#4f46e5' },
  { name: 'Mobile App', value: 20, color: '#0ea5e9' },
  { name: 'Instagram', value: 10, color: '#e11d48' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const conversionData = [
  { name: 'Mon', queries: 65, conversions: 32 },
  { name: 'Tue', queries: 78, conversions: 45 },
  { name: 'Wed', queries: 82, conversions: 53 },
  { name: 'Thu', queries: 70, conversions: 40 },
  { name: 'Fri', queries: 90, conversions: 58 },
  { name: 'Sat', queries: 50, conversions: 28 },
  { name: 'Sun', queries: 40, conversions: 22 },
];

const trendData = [
  { name: 'Mar 1', value: 0, previous: 0 },
  { name: 'Mar 3', value: 0, previous: 0 },
  { name: 'Mar 5', value: 0, previous: 0 },
  { name: 'Mar 7', value: 0, previous: 0 },
  { name: 'Mar 9', value: 0, previous: 0 },
  { name: 'Mar 11', value: 0, previous: 0 },
  { name: 'Mar 13', value: 0, previous: 0 },
  { name: 'Mar 15', value: 0, previous: 0 },
  { name: 'Mar 17', value: 0, previous: 0 },
  { name: 'Mar 19', value: 0, previous: 0 },
  { name: 'Mar 21', value: 12, previous: 0 },
  { name: 'Mar 23', value: 0, previous: 0 },
  { name: 'Mar 25', value: 0, previous: 0 },
];

interface AgentPerformanceChartProps {
  type?: 'agent' | 'satisfaction' | 'channel' | 'trend' | 'conversion';
  className?: string;
}

export const AgentPerformanceChart = ({ 
  type = 'agent',
  className
}: AgentPerformanceChartProps) => {
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#333" style={{ fontSize: 14, fontWeight: 'bold' }}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#333" style={{ fontSize: 12 }}>
          {value}
        </text>
        <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#999" style={{ fontSize: 12 }}>
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  if (type === 'conversion') {
    return (
      <div className={`w-full h-full ${className || ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={conversionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                border: 'none',
                padding: '10px'
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '10px'
              }}
            />
            <Bar dataKey="queries" name="Total Queries" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversions" name="Successful Conversions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'trend') {
    return (
      <div className={`w-full h-full ${className || ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                border: 'none',
                padding: '10px'
              }} 
              formatter={(value) => [`${value} credits`]}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              name="Credits Used" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const chartData = 
    type === 'agent' ? agentData : 
    type === 'satisfaction' ? satisfactionData : 
    channelData;

  return (
    <div className={`w-full h-full ${className || ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            activeIndex={0}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
              border: 'none',
              padding: '8px'
            }} 
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{
              fontSize: '12px',
              paddingLeft: '10px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
