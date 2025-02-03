import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';

interface AttendanceRecord {
  id: number;
  childId: number;
  childName: string;
  parentName: string;
  checkInTime: string;
  service: string;
}

const fetchAttendance = async () => {
  const response = await fetch('/api/attendance');
  if (!response.ok) {
    throw new Error('Network response was not ok');
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

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const timeUnits: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of timeUnits) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value !== 0) return rtf.format(-value, unit);
  }

  return 'Just now';
};

const getServiceBadgeColor = (service: string) => {
  const services: Record<string, string> = {
    'Sunday School': 'bg-blue-100 text-blue-800',
    'Youth Service': 'bg-purple-100 text-purple-800',
    'Main Service': 'bg-green-100 text-green-800',
    'Special Event': 'bg-yellow-100 text-yellow-800',
  };
  return services[service] || 'bg-gray-100 text-gray-800';
};

const Attendance = () => {
  const { data: attendanceRecords, isLoading, error } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
        <CardTitle className="text-xl font-bold">Live Attendance Records</CardTitle>
      </CardHeader>
      <CardContent>
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
              ) : attendanceRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No check-ins yet
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium w-20">{record.id}</TableCell>
                    <TableCell>{record.childName}</TableCell>
                    <TableCell>{record.parentName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getServiceBadgeColor(record.service)}>
                        {record.service}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(record.checkInTime).toLocaleString()}</TableCell>
                    <TableCell>{formatRelativeTime(record.checkInTime)}</TableCell>
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