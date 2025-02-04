import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { DataTableToolbar, SearchField } from "@/components/DataTableToolbar";
import { useMemo, useState } from "react";

interface AttendanceRecord {
  id: number;
  childId: number;
  childName: string;
  parentName: string;
  checkInTime: string;
  service: string;
}

const fetchAttendance = async () => {
  const response = await fetch("/api/attendance");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const AttendanceTableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
);

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const pastDate = new Date(dateString);
  const diffInMs = now.getTime() - pastDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const timeUnits: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of timeUnits) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value !== 0) return rtf.format(-value, unit);
  }

  return "Just now";
};

const getServiceBadgeColor = (service: string) => {
  const services: Record<string, string> = {
    "1st Service": "bg-blue-100 text-blue-800",
    "2nd Service": "bg-purple-100 text-purple-800",
    "Evening Service": "bg-green-100 text-green-800",
  };
  return services[service] || "bg-gray-100 text-gray-800";
};

const Attendance = () => {
  const [searchValues, setSearchValues] = useState<Record<keyof AttendanceRecord, string>>({
    id: "",
    childId: "",
    childName: "",
    parentName: "",
    checkInTime: "",
    service: "",
  });
  const [sortBy, setSortBy] = useState<keyof AttendanceRecord>("checkInTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeFilters, setActiveFilters] = useState<
    { field: keyof AttendanceRecord; value: string }[]
  >([]);

  const {
    data: attendanceRecords,
    isLoading,
    error,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
    refetchInterval: 30000,
  });

  const searchFields: SearchField<AttendanceRecord>[] = [
    {
      key: "id",
      label: "Record ID",
      placeholder: "Search by record ID...",
      type: "number",
    },
    {
      key: "childId",
      label: "Child ID",
      placeholder: "Search by child ID...",
      type: "number",
    },
    {
      key: "childName",
      label: "Child Name",
      placeholder: "Search by child name...",
    },
    {
      key: "parentName",
      label: "Parent Name",
      placeholder: "Search by parent name...",
    },
  ];

  const sortOptions = [
    { label: "Check-in Time", value: "checkInTime" as keyof AttendanceRecord },
    { label: "Child Name", value: "childName" as keyof AttendanceRecord },
    { label: "Parent Name", value: "parentName" as keyof AttendanceRecord },
  ];

  const filterOptions = [
    {
      label: "1st Service",
      value: "1st Service",
      field: "service" as keyof AttendanceRecord,
    },
    {
      label: "2nd Service",
      value: "2nd Service",
      field: "service" as keyof AttendanceRecord,
    },
    {
      label: "Evening Service",
      value: "Evening Service",
      field: "service" as keyof AttendanceRecord,
    },
  ];

  const filteredAndSortedRecords = useMemo(() => {
    if (!attendanceRecords) return [];

    let result = [...attendanceRecords];

    // Apply searches
    if (searchValues.id) {
      result = result.filter((record) =>
        record.id.toString().includes(searchValues.id)
      );
    }
    if (searchValues.childId) {
      result = result.filter((record) =>
        record.childId.toString().includes(searchValues.childId)
      );
    }
    if (searchValues.childName) {
      result = result.filter((record) =>
        record.childName
          .toLowerCase()
          .includes(searchValues.childName.toLowerCase())
      );
    }
    if (searchValues.parentName) {
      result = result.filter((record) =>
        record.parentName
          .toLowerCase()
          .includes(searchValues.parentName.toLowerCase())
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((record) =>
        activeFilters.every((filter) => record[filter.field] === filter.value)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "checkInTime") {
        compareValue =
          new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
      } else {
        compareValue = String(a[sortBy]).localeCompare(String(b[sortBy]));
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [attendanceRecords, searchValues, activeFilters, sortBy, sortOrder]);

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-red-500">Error loading attendance records</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Live Attendance Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTableToolbar
          searchFields={searchFields}
          searchValues={searchValues}
          onSearchChange={(field, value) =>
            setSearchValues((prev) => ({ ...prev, [field]: value }))
          }
          sortOptions={sortOptions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Child Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Check-In Time</TableHead>
                <TableHead>Last Check-In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <AttendanceTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No check-ins yet
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium w-20">
                      {record.id}
                    </TableCell>
                    <TableCell>{record.childName}</TableCell>
                    <TableCell>{record.parentName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getServiceBadgeColor(record.service)}
                      >
                        {record.service}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(record.checkInTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {formatRelativeTime(record.checkInTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Attendance;
