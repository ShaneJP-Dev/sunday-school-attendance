import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceChart from "./AttendanceChart";

type AttendanceRecord = {
  id: number;
  childName: string;
  parentName: string;
  checkedInBy: string;
  checkInTime: string;  // Changed from 'date'
  service: string;
  relationship: string;
};

// Ensure correct type for the date state
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        console.log("Fetched attendance data:", data);
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const graphData = useMemo(() => {
    console.log('Raw Attendance Data:', attendanceData);
  
    if (!attendanceData || attendanceData.length === 0) {
      return [];
    }
  
    const { from, to } = dateRange;
  
    // If no date range selected, return all data
    if (!from || !to) {
      return attendanceData.map(record => ({
        date: record.checkInTime.split('T')[0],
        "First Service": record.service === '1st service' ? 1 : 0,
        "Second Service": record.service === '2nd service' ? 1 : 0,
        "Evening Service": record.service === 'evening service' ? 1 : 0
      }));
    }
  
    const filteredData = attendanceData.filter((record) => {
      const recordDate = new Date(record.checkInTime);
      return recordDate >= from && recordDate <= to;
    });
  
    const groupedData: Record<string, any> = {};
  
    filteredData.forEach((record) => {
      const dateStr = record.checkInTime.split('T')[0];
  
      if (!groupedData[dateStr]) {
        groupedData[dateStr] = {
          date: dateStr,
          "First Service": 0,
          "Second Service": 0,
          "Evening Service": 0
        };
      }
  
      switch(record.service.toLowerCase()) {
        case '1st service':
          groupedData[dateStr]["First Service"]++;
          break;
        case '2nd service':
          groupedData[dateStr]["Second Service"]++;
          break;
        case 'evening service':
          groupedData[dateStr]["Evening Service"]++;
          break;
      }
    });
  
    return Object.values(groupedData);
  }, [attendanceData, dateRange]);
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  if (range.from && range.to) {
                    setDateRange({ from: range.from, to: range.to });
                  } else if (range.from) {
                    setDateRange({ from: range.from, to: undefined });
                  } else {
                    setDateRange({ from: undefined, to: undefined });
                  }
                }
              }}
              className="rounded-md border"
            />
          </div>
          <AttendanceChart data={graphData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;