import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  BarChart,
  Bar,
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
  isHourlyView?: boolean;
  hourlyData?: Array<{
    hour: string;
    service: string;
    count: number;
  }>;
  isTodayOrYesterday?: boolean;
  isLast30Days?: boolean;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ 
  data, 
  isHourlyView = false, 
  hourlyData = [],
  isTodayOrYesterday = false,
  isLast30Days = false 
}) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Handle Today and Yesterday by aggregating service totals
  const aggregatedData = isTodayOrYesterday
    ? [
        {
          date: isTodayOrYesterday ? 'Today' : 'Yesterday', // Label for Today/Yesterday
          'First Service': data.reduce((acc, curr) => acc + curr['First Service'], 0),
          'Second Service': data.reduce((acc, curr) => acc + curr['Second Service'], 0),
          'Evening Service': data.reduce((acc, curr) => acc + curr['Evening Service'], 0)
        }
      ]
    : data;

  // Handle Last 30 Days view
  const last30DaysData = isLast30Days
    ? data.filter(item => {
        const itemDate = new Date(item.date);
        const today = new Date();
        const diffTime = today.getTime() - itemDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24); // Difference in days
        return diffDays <= 30; // Filter data for the last 30 days
      })
    : data;

  // Transform hourly data for bar chart
  const transformedHourlyData = isHourlyView 
    ? Object.values(
        hourlyData.reduce((acc, item) => {
          if (!acc[item.hour]) {
            acc[item.hour] = { 
              hour: item.hour, 
              'First Service': 0, 
              'Second Service': 0, 
              'Evening Service': 0 
            };
          }
          acc[item.hour][item.service] = item.count;
          return acc;
        }, {})
      ).sort((a, b) => a.hour.localeCompare(b.hour))
    : [];

  // Choose chart based on view type
  const chartProps = isHourlyView || isTodayOrYesterday || isLast30Days
    ? {
        component: BarChart,
        dataKey: isLast30Days ? "date" : "hour",
        chartData: isTodayOrYesterday ? aggregatedData : isLast30Days ? last30DaysData : transformedHourlyData
      }
    : {
        component: LineChart,
        dataKey: "date",
        chartData: data
      };

  const ChartComponent = chartProps.component;

  return (
    <div className="w-full h-[300px] md:h-[500px] lg:h-[600px] relative top-0 md:top-0 lg:top-0">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartProps.chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey={chartProps.dataKey}
            tickFormatter={(tick) => 
              isHourlyView || isTodayOrYesterday
                ? tick 
                : isLast30Days
                ? new Date(tick).toLocaleString('default', { month: 'short', day: 'numeric' })
                : new Date(tick).toLocaleDateString()
            }
            className="text-xs md:text-sm"
          />
          <YAxis
            label={{
              value: isHourlyView || isTodayOrYesterday ? 'Total Attendance' : 'Attendance',
              angle: -90,
              position: 'insideLeft',
              className: 'text-xs md:text-sm'
            }}
            className="text-xs md:text-sm"
          />
          <Tooltip
            labelFormatter={(label) => 
              isHourlyView || isTodayOrYesterday
                ? `Hour: ${label}` 
                : isLast30Days
                ? new Date(label).toLocaleString('default', { month: 'short', day: 'numeric' })
                : new Date(label).toLocaleDateString()
            }
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
          {isHourlyView || isTodayOrYesterday ? (
            <>
              <Bar dataKey="First Service" fill="#3b82f6" />
              <Bar dataKey="Second Service" fill="#10b981" />
              <Bar dataKey="Evening Service" fill="#f43f5e" />
            </>
          ) : (
            <>
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
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
