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

const trendData = [
  { name: 'Mon', value: 45, previous: 35 },
  { name: 'Tue', value: 52, previous: 42 },
  { name: 'Wed', value: 49, previous: 40 },
  { name: 'Thu', value: 60, previous: 45 },
  { name: 'Fri', value: 55, previous: 48 },
  { name: 'Sat', value: 38, previous: 30 },
  { name: 'Sun', value: 30, previous: 25 },
];

interface AgentPerformanceChartProps {
  type?: 'agent' | 'satisfaction' | 'channel' | 'trend';
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

  if (type === 'trend') {
    return (
      <div className={`w-full h-full ${className || ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                border: 'none',
                padding: '10px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="previous" 
              stroke="#9ca3af" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorPrevious)" 
              activeDot={{ stroke: '#fff', strokeWidth: 2, r: 6 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#0ea5e9" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorCurrent)" 
              activeDot={{ stroke: '#fff', strokeWidth: 2, r: 6 }}
            />
          </AreaChart>
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
        <PieChart>
          <Pie
            activeIndex={0}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
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
