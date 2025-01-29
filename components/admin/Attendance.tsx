// app/admin/Attendance.tsx
'use client';

import { useEffect, useState } from 'react';

interface AttendanceRecord {
  id: number;
  childId: number;
  parentName: string;
  checkInTime: string;
}

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const response = await fetch('/api/attendance'); // Adjust the API endpoint as necessary
      const data = await response.json();
      setAttendanceRecords(data);
    };

    fetchAttendance();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border-b-2 border-gray-300 px-4 py-2">Child ID</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Parent Name</th>
            <th className="border-b-2 border-gray-300 px-4 py-2">Check-In Time</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record) => (
            <tr key={record.id} className="border-b">
              <td className="px-4 py-2">{record.childId}</td>
              <td className="px-4 py-2">{record.parentName}</td>
              <td className="px-4 py-2">{new Date(record.checkInTime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;