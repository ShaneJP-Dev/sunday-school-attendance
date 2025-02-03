import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance");
        const data = await res.json();
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setSelectedDateRange({ start, end });
  };

  const graphData = useMemo(() => {
    const { start, end } = selectedDateRange;

    const filteredData = attendanceData.filter((record) => {
      const recordDate = new Date(record.checkInTime);
      return (!start || recordDate >= start) && (!end || recordDate <= end);
    });

    const serviceGroups: Record<string, Record<string, string[]>> = {};

    filteredData.forEach((record) => {
      const dateStr = record.checkInTime.split("T")[0];
      const serviceKey = record.service.toLowerCase();

      if (!serviceGroups[dateStr]) {
        serviceGroups[dateStr] = {
          "1st service": [],
          "2nd service": [],
          "evening service": [],
        };
      }

      if (!serviceGroups[dateStr][serviceKey].includes(record.childName)) {
        serviceGroups[dateStr][serviceKey].push(record.childName);
      }
    });

    return Object.entries(serviceGroups)
      .map(([date, services]) => ({
        date,
        "First Service": services["1st service"].length,
        "Second Service": services["2nd service"].length,
        "Evening Service": services["evening service"].length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [attendanceData, selectedDateRange]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <Card className="relative">
        <AttendanceChart data={graphData} />
        <CardContent className="pt-20 md:pt-16">
          <DateRangeSelector onDateRangeSelect={handleDateRangeSelect} />
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;
