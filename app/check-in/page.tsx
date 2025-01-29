'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Child {
  id: number;
  name: string;
  age: number;
  grade: string;
}

const CheckIn: React.FC = () => {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [parentName, setParentName] = useState<string>('');
  const [selectedParents, setSelectedParents] = useState<Record<number, string | null>>({});

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const childrenData = query.get('children');
    const name = query.get('parentName');

    if (childrenData) {
      setChildren(JSON.parse(decodeURIComponent(childrenData)));
    }
    if (name) {
      setParentName(name);
    }
  }, []);

  const handleParentSelection = (childId: number, parent: string) => {
    // Update the selected parent for the child in local state
    setSelectedParents((prev) => ({
      ...prev,
      [childId]: parent,
    }));
  };

  const handleCompleteCheckIn = async () => {
    const selectedChildren = children.filter((child) => selectedParents[child.id]);
  
    if (selectedChildren.length === 0) {
      alert('Please select a parent for at least one child.');
      return;
    }
  
    const requestBody = selectedChildren.map((child) => ({
      childId: child.id,
      parentName: selectedParents[child.id] || 'Unknown',
      checkInTime: new Date().toISOString(),
    }));
  
    console.log('🔹 Sending request to /api/attendance:', requestBody);
  
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = 'Failed to check in';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.success) {
        alert(data.message || 'Check-in successful!');
        router.push('/');
      } else {
        throw new Error(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('❌ Error during check-in:', error);
      alert(`Check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
  
  

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
      {/* Back button at the top left */}
      <div className="w-full max-w-2xl flex justify-start mb-4">
        <Button onClick={() => router.push('/')} variant="outline">
          ← Back
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-center">Check In for {parentName}</h1>

      {/* Table Container */}
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
                    <Button
                      onClick={() => handleParentSelection(child.id, 'Mother')}
                      variant={selectedParents[child.id] === 'Mother' ? 'default' : 'outline'}
                    >
                      Mother
                    </Button>
                    <Button
                      onClick={() => handleParentSelection(child.id, 'Father')}
                      variant={selectedParents[child.id] === 'Father' ? 'default' : 'outline'}
                    >
                      Father
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Continue Button */}
        <Button
          variant="default"
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleCompleteCheckIn}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;