import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateAttendance, setDateAttendance] = useState([]);
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    fetchAttendanceStats(selectedFilter);
    // Initial live attendance fetch
    fetchLiveAttendance();

    // Set up polling with a longer interval
    const interval = setInterval(fetchLiveAttendance, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [selectedFilter]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceByDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchAttendanceStats = async (filter) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/attendanceStats?filter=${filter}`);
      const data = await response.json();
      
      // Transform data if needed
      const formattedData = data.map(item => ({
        service: item.service,
        count: item.count // Make sure this matches your API response
      }));
      
      setAttendanceData(formattedData);
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceByDate = async (date) => {
    try {
      const response = await fetch(`/api/attendanceByDate?date=${date.toISOString().split('T')[0]}`);
      const data = await response.json();
      setDateAttendance(data);
    } catch (error) {
      console.error('Failed to fetch date attendance:', error);
    }
  };

  const fetchLiveAttendance = async () => {
    try {
      const response = await fetch('/api/liveAttendance');
      const data = await response.json();
      setLiveAttendance(data);
    } catch (error) {
      console.error('Failed to fetch live attendance:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Overview</CardTitle>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="service" 
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Check-ins"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Calendar and Live Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 max-h-48 overflow-y-auto">
                <h3 className="font-semibold mb-2">Attendance for {selectedDate.toLocaleDateString()}</h3>
                {dateAttendance.length > 0 ? (
                  <ul className="space-y-2">
                    {dateAttendance.map((record) => (
                      <li key={record.id} className="flex justify-between items-center text-sm">
                        <span>{record.child.name}</span>
                        <span className="text-gray-500">
                          {new Date(record.date).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No attendance records for this date</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Attendance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Live Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto">
              {liveAttendance.length > 0 ? (
                <ul className="space-y-3">
                  {liveAttendance.map((record) => (
                    <li 
                      key={record.id} 
                      className="flex justify-between items-center p-2 bg-blue-50 rounded-lg"
                    >
                      <span className="font-medium">{record.child.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active check-ins</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;