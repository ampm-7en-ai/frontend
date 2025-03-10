
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Bot } from 'lucide-react';

const dummyData = [
  { name: 'Active', value: 12, color: '#10B981' },
  { name: 'Paused', value: 3, color: '#F59E0B' },
  { name: 'Offline', value: 2, color: '#9CA3AF' },
];

type AgentStatusCardProps = {
  className?: string;
  data?: typeof dummyData;
};

export function AgentStatusCard({ className, data = dummyData }: AgentStatusCardProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Agent Status</h3>
        <div className="flex items-center text-sm text-dark-gray">
          <Bot size={16} className="mr-1" />
          <span>{data.reduce((acc, item) => acc + item.value, 0)} Total</span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              }}
              formatter={(value) => [`${value} agents`, '']}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value, entry, index) => (
                <span className="text-sm">{value} ({data[index].value})</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
