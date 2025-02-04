import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  parseISO, 
  isWithinInterval, 
  eachDayOfInterval, 
  format, 
  startOfDay,
  endOfDay,
  getHours
} from "date-fns";
import AttendanceChart from "./AttendanceChart";
import DateRangeSelector from "./DateRangeSelector";

type AttendanceRecord = {
  id: number;
  childName: string;
  parentName: string;
  checkedInBy: string;
  checkInTime: string;
  service: string;
  relationship: string;
};

type HourlyAttendanceRecord = {
  hour: string;
  service: string;
  count: number;
};

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [hourlyAttendance, setHourlyAttendance] = useState<HourlyAttendanceRecord[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
    type: string;
  }>({
    start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: new Date(),
    type: 'last30Days'
  });
  const [isLast30Days, setIsLast30Days] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        setAttendanceData(data);
        console.log("Fetched attendance data:", data); // Add this line to debug
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const handleDateRangeSelect = (
    start: Date, 
    end: Date, 
    type: string, 
    hourlyData?: HourlyAttendanceRecord[]
  ) => {
    setSelectedDateRange({ start, end, type });
    setIsLast30Days(type === 'last30Days');
    
    if (hourlyData && (type === 'today' || type === 'yesterday')) {
      setHourlyAttendance(hourlyData);
    } else {
      setHourlyAttendance([]);
    }
  };

  const graphData = useMemo(() => {
    const { start, end } = selectedDateRange;
  
    // Filter records within the selected date range
    const filteredData = attendanceData.filter((record) => {
      const recordDate = parseISO(record.checkInTime);
      return isWithinInterval(recordDate, { start, end });
    });
  
    // Normalize service names to handle case variations
    const normalizeService = (service: string) => {
      const lowerService = service.toLowerCase();
      if (lowerService.includes('1st') || lowerService.includes('first')) return 'First Service';
      if (lowerService.includes('2nd') || lowerService.includes('second')) return 'Second Service';
      if (lowerService.includes('evening')) return 'Evening Service';
      return 'Other Service';
    };
  
    // Create a map to track unique children per date and service
    const serviceGroups: Record<string, Record<string, Set<string>>> = {};
  
    filteredData.forEach((record) => {
      const dateStr = record.checkInTime.split('T')[0];
      const normalizedService = normalizeService(record.service);
  
      if (!serviceGroups[dateStr]) {
        serviceGroups[dateStr] = {
          'First Service': new Set(),
          'Second Service': new Set(),
          'Evening Service': new Set(),
        };
      }
      
      serviceGroups[dateStr][normalizedService].add(record.childName);
    });
  
    // Generate data for all dates in the range
    const allDates = eachDayOfInterval({ start, end }).map((date) => format(date, 'yyyy-MM-dd'));
  
    const graphData = allDates.map((date) => ({
      date,
      'First Service': serviceGroups[date]?.['First Service']?.size || 0,
      'Second Service': serviceGroups[date]?.['Second Service']?.size || 0,
      'Evening Service': serviceGroups[date]?.['Evening Service']?.size || 0,
    }));
  
    console.log("Graph data:", graphData); // Debug statement
  
    return graphData;
  }, [attendanceData, selectedDateRange]);
  
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <Card className="relative">
        <AttendanceChart 
          data={graphData} 
          isHourlyView={selectedDateRange.type === 'today' || selectedDateRange.type === 'yesterday'}
          hourlyData={hourlyAttendance}
          isTodayOrYesterday={selectedDateRange.type === 'today' || selectedDateRange.type === 'yesterday'}
          isLast30Days={isLast30Days} 
        />
        <CardContent className="pt-20 md:pt-16">
          <DateRangeSelector 
            onDateRangeSelect={handleDateRangeSelect} 
            onHourlyAttendance={(hourlyData) => {
              if (selectedDateRange.type === 'today' || selectedDateRange.type === 'yesterday') {
                setHourlyAttendance(hourlyData);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
