'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Updated Child interface to include birthday
interface Child {
  id: number;
  name: string;
  birthday: string; // Store birthday as a string (ISO format)
  grade: string;
}

// Function to calculate age from birthday
const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

interface ChildCheckInModalProps {
  children: Child[];
  parentName: string;
  parentRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChildCheckInModal: React.FC<ChildCheckInModalProps> = ({
  children,
  parentName,
  parentRole,
  isOpen,
  onClose,
}) => {
  const [checkedInChildren, setCheckedInChildren] = useState<number[]>([]);

  const handleCheckIn = async (childId: number) => {
    try {
      const currentTime = new Date();
      const hour = currentTime.getHours();

      let service = '1st service';
      if (hour >= 12 && hour < 16) {
        service = '2nd service';
      } else if (hour >= 16) {
        service = 'Evening service';
      }

      const checkInData = [{
        childId,
        checkInTime: currentTime.toISOString(),
        service,
        checkedInBy: parentName,
        relationship: parentRole, // Use the parent's role/relationship
      }];

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkInData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }

      // Mark child as checked in
      setCheckedInChildren([...checkedInChildren, childId]);
    } catch (error) {
      console.error('Check-in error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during check-in');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check In Children</DialogTitle>
          <p className="text-sm text-gray-600">
            Checking in by {parentName} ({parentRole})
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {children.map((child) => (
            <div 
              key={child.id} 
              className="flex justify-between items-center p-2 border rounded"
            >
              <div>
                <p>{child.name}</p>
                <p className="text-sm text-gray-500">
                  Age: {calculateAge(child.birthday)}, Grade: {child.grade}
                </p>
              </div>
              <Button
                onClick={() => handleCheckIn(child.id)}
                disabled={checkedInChildren.includes(child.id)}
                variant={checkedInChildren.includes(child.id) ? 'outline' : 'default'}
              >
                {checkedInChildren.includes(child.id) ? 'Checked In' : 'Check In'}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};