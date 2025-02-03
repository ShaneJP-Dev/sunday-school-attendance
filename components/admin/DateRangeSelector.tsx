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
  onDateRangeSelect: (start: Date, end: Date) => void;
}

const DateRangeSelector: React.FC<DateRangeProps> = ({ onDateRangeSelect }) => {
  const [selectedRange, setSelectedRange] = useState<string>("last7Days");

  const dateRanges = [
    { 
      value: "today", 
      label: "Today", 
      range: () => {
        const now = new Date();
        return { 
          start: startOfDay(now), 
          end: endOfDay(now) 
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
          end: endOfDay(yesterday) 
        };
      }
    },
    { 
      value: "last7Days", 
      label: "Last 7 Days", 
      range: () => {
        const end = new Date();
        const start = subDays(end, 7);
        return { start, end };
      }
    },
    { 
      value: "last30Days", 
      label: "Last 30 Days", 
      range: () => {
        const end = new Date();
        const start = subDays(end, 30);
        return { start, end };
      }
    },
    { 
      value: "lastMonth", 
      label: "Last Month", 
      range: () => {
        const now = new Date();
        const start = startOfMonth(subMonths(now, 1));
        const end = endOfMonth(subMonths(now, 1));
        return { start, end };
      }
    },
    { 
      value: "lastYear", 
      label: "Last Year", 
      range: () => {
        const end = new Date();
        const start = subYears(end, 1);
        return { start, end };
      }
    }
  ];

  const handleRangeSelect = (value: string) => {
    const selectedRangeOption = dateRanges.find(range => range.value === value);
    if (selectedRangeOption) {
      const { start, end } = selectedRangeOption.range();
      setSelectedRange(value);
      onDateRangeSelect(start, end);
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