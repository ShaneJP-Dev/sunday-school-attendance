import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  type ChartProps = {
    data: any[];
  };
  
  const AttendanceChart = ({ data }: ChartProps) => {
    return (
      <div className="h-[400px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="First Service" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="Second Service" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="Evening Service" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            No data available for the selected date range
          </div>
        )}
      </div>
    );
  };
  
  export default AttendanceChart;
  