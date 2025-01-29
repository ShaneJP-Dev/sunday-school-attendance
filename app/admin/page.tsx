'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SignOut from '@/components/admin/SignOut';
import Dashboard from '@/components/admin/Dashboard';
import People from '@/components/admin/People';
import Attendance from '@/components/admin/Attendance';

const AdminAccess: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const router = useRouter();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // Use an environment variable for the admin password
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'defaultPassword';

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleAddParentChild = async () => {
    // Implement your add parent/child logic here
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center">Admin Access</h1>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button 
            onClick={handlePasswordSubmit} 
            className="w-full"
          >
            Submit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')} 
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`w-64 bg-gray-100 p-4 ${sidebarOpen ? 'block' : 'hidden'} md:block`}
      >
        <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
        <ul>
          <li>
            <Button
              onClick={() => handlePageChange('dashboard')}
              className={`w-full ${currentPage === 'dashboard' ? 'bg-blue-500 text-white' : ''}`}
            >
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              onClick={() => handlePageChange('people')}
              className={`w-full ${currentPage === 'people' ? 'bg-blue-500 text-white' : ''}`}
            >
              People
            </Button>
          </li>
          <li>
            <Button
              onClick={() => handlePageChange('attendance')}
              className={`w-full ${currentPage === 'attendance' ? 'bg-blue-500 text-white' : ''}`}
            >
              Attendance
            </Button>
          </li>
          <li>
            <Button
              onClick={() => handlePageChange('signOut')}
              className={`w-full ${currentPage === 'signOut' ? 'bg-blue-500 text-white' : ''}`}
            >
              Sign Out
            </Button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'people' && <People />}
        {currentPage === 'attendance' && <Attendance />}
        {currentPage === 'signOut' && <SignOut />}
      </div>

      {/* Toggle Sidebar Button */}
      <Button
        onClick={handleSidebarToggle}
        className="fixed top-4 left-4 md:hidden"
      >
        {sidebarOpen ? 'Close' : 'Open'}
      </Button>
    </div>
  );
};

export default AdminAccess;