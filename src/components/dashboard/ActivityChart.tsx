
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const dummyData = [
  { date: 'Jan', conversations: 400, resolutions: 240 },
  { date: 'Feb', conversations: 300, resolutions: 200 },
  { date: 'Mar', conversations: 200, resolutions: 180 },
  { date: 'Apr', conversations: 280, resolutions: 250 },
  { date: 'May', conversations: 500, resolutions: 400 },
  { date: 'Jun', conversations: 550, resolutions: 480 },
  { date: 'Jul', conversations: 400, resolutions: 380 },
];

type ActivityChartProps = {
  className?: string;
  data?: typeof dummyData;
  title?: string;
};

export function ActivityChart({ className, data = dummyData, title = "Agent Activity" }: ActivityChartProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2">
          <select className="text-sm border border-medium-gray/30 rounded-md p-1">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversations"
              stroke="#2563EB"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="resolutions" 
              stroke="#10B981" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
