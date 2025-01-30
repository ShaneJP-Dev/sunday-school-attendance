// attendance.tsx
'use client';

import { useEffect, useState } from 'react';

interface AttendanceRecord {
  id: number;
  childId: number;
  childName: string;
  parentName: string;
  checkInTime: string;
  service: string; // Add service field
}

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

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

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Live Attendance Records</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border-b-2 border-gray-300 px-4 py-2">ID</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Child Name</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Parent Name</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Check-In Time</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Service</th> {/* New Service column */}
            <th className="border-b-2 border-gray-300 px-4 py-2">Last Check-In Time</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">No check-ins yet</td>
            </tr>
          ) : (
            attendanceRecords.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="px-4 py-2">{record.id}</td>
                <td className="px-4 py-2">{record.childName}</td>
                <td className="px-4 py-2">{record.parentName}</td>
                <td className="px-4 py-2">{new Date(record.checkInTime).toLocaleString()}</td>
                <td className="px-4 py-2">{record.service}</td> {/* Display Service */}
                <td className="px-4 py-2">{formatRelativeTime(record.checkInTime)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
