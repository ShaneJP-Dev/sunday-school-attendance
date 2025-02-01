'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from 'lucide-react'; // Import the Settings icon
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChildCheckInModal } from "@/components/admin/ChildCheckInModal";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

interface Child {
  id: number;
  name: string;
  age: number;
  grade: string;
}

export default function Home() {
  const [phone, setPhone] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [parentName, setParentName] = useState('');
  const [parentRole, setParentRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/findParent?phone=${phone}`);
      const data = await response.json();

      if (data.success) {
        setChildren(data.children);
        setParentName(data.name);
        setParentRole(data.role);
        setModalOpen(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error fetching parent or guardian:', error);
      alert('An error occurred while searching for the parent or guardian.');
    }
  };

  const handleSignOut = () => {
    // Implement sign-out logic here
    console.log("Signing out...");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center w-full max-w-md mx-auto mb-4">
        <h1 className="text-2xl font-bold">Check In Children</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        <Input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
        />
        <Button 
          onClick={handleSearch} 
          className="w-full"
          disabled={phone.length < 10}
        >
          Search
        </Button>
      </div>

      <ChildCheckInModal
        children={children}
        parentName={parentName}
        parentRole={parentRole}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}