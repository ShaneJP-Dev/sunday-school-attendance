import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  format, 
  subDays, 
  subMonths, 
  subYears, 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth 
} from 'date-fns';

interface DateRangeProps {
  onDateRangeSelect: (start: Date, end: Date, type: string, hourlyData?: any[]) => void;
  onHourlyAttendance?: (attendance: { hour: string; service: string; count: number }[]) => void;
}

const DateRangeSelector: React.FC<DateRangeProps> = ({ 
  onDateRangeSelect, 
  onHourlyAttendance 
}) => {
  const [selectedRange, setSelectedRange] = useState<string>("last30Days");

  const dateRanges = [
    { 
      value: "today", 
      label: "Today", 
      range: () => {
        const now = new Date();
        return { 
          start: startOfDay(now), 
          end: endOfDay(now),
          type: 'today'
        };
      }
    },
    { 
      value: "yesterday", 
      label: "Yesterday", 
      range: () => {
        const today = new Date();
        const yesterday = subDays(today, 1);
        return { 
          start: startOfDay(yesterday), 
          end: endOfDay(yesterday),
          type: 'yesterday'
        };
      }
    },
    { 
      value: "last7Days", 
      label: "Last 7 Days", 
      range: () => {
        const end = new Date();
        const start = subDays(end, 6);
        return { 
          start, 
          end,
          type: 'last7Days'
        };
      }
    },
    { 
      value: "last30Days", 
      label: "Last 30 Days", 
      range: () => {
        const end = new Date();
        const start = subDays(end, 29);
        return { 
          start, 
          end,
          type: 'last30Days'
        };
      }
    },
    { 
      value: "lastYear", 
      label: "Last Year", 
      range: () => {
        const end = new Date();
        const start = subYears(end, 1);
        return { 
          start, 
          end,
          type: 'lastYear'
        };
      }
    }
  ];

  const calculateHourlyAttendance = (start: Date, end: Date) => {
    // This would ideally come from your actual API data
    const services = ['First Service', 'Second Service', 'Evening Service'];
    const hourlyAttendance: { hour: string; service: string; count: number }[] = [];

    services.forEach(service => {
      for (let hour = 0; hour < 24; hour++) {
        hourlyAttendance.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          service,
          count: Math.floor(Math.random() * 50) // Simulated data
        });
      }
    });

    return hourlyAttendance;
  };
  
  const handleRangeSelect = (value: string) => {
    const selectedRangeOption = dateRanges.find(range => range.value === value);
    if (selectedRangeOption) {
      const { start, end, type } = selectedRangeOption.range();
      setSelectedRange(value);
  
      const hourlyData = (type === 'today' || type === 'yesterday') 
        ? calculateHourlyAttendance(start, end) 
        : undefined;
  
      console.log("Selected Range:", start, end); // Debugging the selected range
      console.log("Hourly Data:", hourlyData); // Debugging hourly data
  
      onDateRangeSelect(start, end, type, hourlyData);
  
      if (onHourlyAttendance && hourlyData) {
        onHourlyAttendance(hourlyData);
      }
    }
  };
  
  return (
    <Select 
      value={selectedRange} 
      onValueChange={handleRangeSelect}
    >
      <SelectTrigger className="w-[180px] absolute top-4 right-4 z-10">
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent>
        {dateRanges.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DateRangeSelector;