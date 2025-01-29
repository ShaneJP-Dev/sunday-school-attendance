// app/admin/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';


const Dashboard: React.FC = () => {
  const [graphs, setGraphs] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [liveView, setLiveView] = useState([]);

  useEffect(() => {
    // Fetch data for graphs, calendar, and live view
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
      <div className="flex flex-wrap justify-center">
        {/* Graphs */}
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
          <h3 className="text-md font-semibold mb-2">Graphs</h3>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {/* Graphs content */}
          </div>
        </div>

        {/* Calendar */}
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
          <h3 className="text-md font-semibold mb-2">Calendar</h3>
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {/* Calendar content */}
          </div>
        </div>

        {/* Live View */}
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
          <h3 className="text-md font-semibold mb-2">Live View</h3>
          <div className="bg-white p-4 rounded-lg shadow-lg">
 {/* Live view content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;