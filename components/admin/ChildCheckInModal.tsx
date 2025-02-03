'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  birthday: string;
  grade: string;
}

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

interface SliderProps {
  onChecked: () => void;
  isChecked: boolean;
  disabled: boolean;
}

const CheckInButton: React.FC<SliderProps> = ({ onChecked, isChecked, disabled }) => {
  return (
    <button
      onClick={() => !disabled && onChecked()}
      disabled={disabled}
      className={`w-32 h-12 flex items-center justify-center rounded-lg text-white font-medium transition-all duration-300
        ${isChecked ? 'bg-green-500' : 'bg-red-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isChecked ? 'Checked In' : 'Not Checked In'}
    </button>
  );
};



export const ChildCheckInModal: React.FC<ChildCheckInModalProps> = ({
  children,
  parentName,
  parentRole,
  isOpen,
  onClose,
}) => {
  const [checkedInChildren, setCheckedInChildren] = useState<number[]>([]);
  const [processing, setProcessing] = useState<number[]>([]);

  const handleCheckIn = async (childId: number) => {
    if (checkedInChildren.includes(childId) || processing.includes(childId)) return;

    try {
      setProcessing(prev => [...prev, childId]);
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
        relationship: parentRole,
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

      setCheckedInChildren(prev => [...prev, childId]);
    } catch (error) {
      console.error('Check-in error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during check-in');
    } finally {
      setProcessing(prev => prev.filter(id => id !== childId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Check In Children</DialogTitle>
          <p className="text-sm text-gray-600">
            Checking in by {parentName} ({parentRole})
          </p>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {children.map((child) => (
            <div 
              key={child.id} 
              className="flex flex-col sm:flex-row justify-between items-center p-4 border rounded-lg bg-gray-50 space-y-3 sm:space-y-0"
            >
              <div className="text-center sm:text-left">
                <p className="font-medium text-lg">{child.name}</p>
                <p className="text-sm text-gray-500">
                  Age: {calculateAge(child.birthday)}, Grade: {child.grade}
                </p>
              </div>
              <CheckInButton
                onChecked={() => handleCheckIn(child.id)}
                isChecked={checkedInChildren.includes(child.id)}
                disabled={processing.includes(child.id)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};