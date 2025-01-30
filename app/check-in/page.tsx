'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Child {
  id: number;
  name: string;
  age: number;
  grade: string;
}

const CheckIn: React.FC = () => {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const childrenData = query.get('children');

    if (childrenData) {
      try {
        setChildren(JSON.parse(decodeURIComponent(childrenData)));
      } catch (e) {
        setError('Invalid children data provided');
      }
    }
  }, []);

  const handleChildSelection = (childId: number) => {
    setSelectedChildren((prev) => ({
      ...prev,
      [childId]: !prev[childId],
    }));
    setError(null);
  };

  const handleCompleteCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
  
      const selectedIds = Object.entries(selectedChildren)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => Number(id));
  
      if (selectedIds.length === 0) {
        setError('Please select at least one child to check in');
        return;
      }
  
      // Get the phone from URL params
      const phone = new URLSearchParams(window.location.search).get('phone');
      if (!phone) {
        setError('Phone number is missing');
        return;
      }
  
      // Fetch the parent's role using the phone number
      const parentResponse = await fetch(`/api/findParent?phone=${phone}`);
      
      if (!parentResponse.ok) {
        const errorText = await parentResponse.text();
        throw new Error(`Failed to fetch parent info: ${errorText}`);
      }
  
      const parentData = await parentResponse.json();
  
      // Validate if parent data exists
      if (!parentData || !parentData.name || !parentData.role) {
        setError('Parent information not found');
        return;
      }
  
      const relationship = parentData.role; // 'mother', 'father', or 'guardian'
  
      const currentTime = new Date();
      const hour = currentTime.getHours();
  
      let service = '1st service';
      if (hour >= 12 && hour < 16) {
        service = '2nd service';
      } else if (hour >= 16) {
        service = 'Evening service';
      }
  
      // Prepare check-in data
      const checkInData = selectedIds.map((childId) => ({
        childId,
        checkInTime: currentTime.toISOString(),
        service,
        checkedInBy: parentData.name, // Use the parent's name
        relationship, // Store the parent's role (mother, father, guardian)
      }));
  
      // Send check-in request
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkInData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Failed to check in');
      }
  
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl flex justify-start mb-4">
        <Button onClick={() => router.push('/')} variant="outline">
          ← Back
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">Check In</h1>

      {error && (
        <Alert variant="destructive" className="mb-6 w-full max-w-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Grade</th>
              <th>Check In</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id}>
                <td>{child.id}</td>
                <td>{child.name}</td>
                <td>{child.age}</td>
                <td>{child.grade}</td>
                <td>
                  <div className="flex space-x-2 justify-center">
                    <label className="flex items-center cursor-pointer">
                      <div
                        className={`relative inline-block w-12 h-6 transition-colors duration-300 rounded-full ${
                          selectedChildren[child.id] ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        onClick={() => handleChildSelection(child.id)}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                            selectedChildren[child.id] ? 'transform translate-x-6' : ''
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Button
          variant="default"
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleCompleteCheckIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Checking in...' : 'Complete'}
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;