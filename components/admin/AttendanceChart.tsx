import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface AttendanceChartProps {
  data: Array<{
    date: string;
    "First Service": number;
    "Second Service": number;
    "Evening Service": number;
  }>;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] md:h-[500px] lg:h-[600px] relative top-0 md:top-0 lg:top-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 20 
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200" 
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            className="text-xs md:text-sm"
          />
          <YAxis 
            label={{ 
              value: 'Attendance', 
              angle: -90, 
              position: 'insideLeft',
              className: 'text-xs md:text-sm'
            }} 
            className="text-xs md:text-sm"
          />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px', 
              fontSize: '0.75rem' 
            }}
          />
          <Line 
            type="monotone"
            dataKey="First Service" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone"
            dataKey="Second Service" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone"
            dataKey="Evening Service" 
            stroke="#f43f5e" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;