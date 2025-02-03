'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Users, CalendarCheck, LogOut, Menu } from 'lucide-react';
import SignOut from '@/components/admin/SignOut';
import Dashboard from '@/components/admin/Dashboard';
import People from '@/components/admin/People';
import Attendance from '@/components/admin/Attendance';

const AdminAccess: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const router = useRouter();

  // Use an environment variable for the admin password
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'defaultPassword';

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-center">Admin Access</h1>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button onClick={handlePasswordSubmit} className="w-full">
            Submit
          </Button>
          <Button variant="outline" onClick={() => router.push('/')} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-100 p-4 border-r">
        <nav className="space-y-2 w-full">
          <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
          <Button
            onClick={() => handlePageChange('dashboard')}
            variant="ghost"
            className={`w-full justify-start ${currentPage === 'dashboard' ? 'bg-blue-500 text-white' : ''}`}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => handlePageChange('people')}
            variant="ghost"
            className={`w-full justify-start ${currentPage === 'people' ? 'bg-blue-500 text-white' : ''}`}
          >
            <Users className="mr-2 h-4 w-4" />
            People
          </Button>
          <Button
            onClick={() => handlePageChange('attendance')}
            variant="ghost"
            className={`w-full justify-start ${currentPage === 'attendance' ? 'bg-blue-500 text-white' : ''}`}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Attendance
          </Button>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed top-4 left-4 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-gray-100 p-4">
          <nav className="space-y-2">
            <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
            <Button
              onClick={() => handlePageChange('dashboard')}
              variant="ghost"
              className={`w-full justify-start ${currentPage === 'dashboard' ? 'bg-blue-500 text-white' : ''}`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={() => handlePageChange('people')}
              variant="ghost"
              className={`w-full justify-start ${currentPage === 'people' ? 'bg-blue-500 text-white' : ''}`}
            >
              <Users className="mr-2 h-4 w-4" />
              People
            </Button>
            <Button
              onClick={() => handlePageChange('attendance')}
              variant="ghost"
              className={`w-full justify-start ${currentPage === 'attendance' ? 'bg-blue-500 text-white' : ''}`}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Attendance
            </Button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-grow p-4 overflow-y-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'people' && <People />}
        {currentPage === 'attendance' && <Attendance />}
        {currentPage === 'signOut' && <SignOut />}
      </main>
    </div>
  );
};

export default AdminAccess;
