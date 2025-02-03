'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from 'lucide-react';
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
  birthday: Date;
  grade: string;
}

export default function Home() {
  const [phone, setPhone] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [parentName, setParentName] = useState('');
  const [parentRole, setParentRole] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Add phone number formatting
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 4) return phoneNumber;
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleSearch = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const formattedPhone = phone.replace(/\D/g, '');
      
      // Add AbortController for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`/api/findParent?phone=${formattedPhone}`, {
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setChildren(data.children);
        setParentName(data.name);
        setParentRole(data.role);
        setModalOpen(true);
      } else {
        alert(data.error);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('Search took too long. Please try again.');
        } else {
          console.error('Error fetching parent or guardian:', error.message);
          alert('An error occurred while searching for the parent or guardian.');
        }
      } else {
        console.error('Unknown error occurred:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && phone.replace(/\D/g, '').length === 10) {
      handleSearch();
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/worship_bg.jpg')" // Replace with your actual background image
      }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Settings button */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
            >
              <Settings className="h-5 w-5 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-40 bg-white/90 backdrop-blur-md" 
            align="end"
          >
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-black/10"
              onClick={() => router.push('/admin')}
            >
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-black/10 text-red-500"
              onClick={() => router.push('/sign-out')}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto backdrop-blur-md bg-white/20 p-8 rounded-xl shadow-lg border border-white/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-md">
              Welcome
            </h1>
            <p className="text-lg text-white font-medium drop-shadow-md">
              Please input your phone number
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-white/20 border-white/30 text-white font-medium placeholder:text-white/70 focus:border-white/50"
              maxLength={14}
              aria-label="Phone number input"
            />
            <Button 
              onClick={handleSearch} 
              className="w-full bg-black/50 hover:bg-black/70 text-white font-medium shadow-md transition-all"
              disabled={phone.replace(/\D/g, '').length !== 10 || loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      <ChildCheckInModal
        children={children}
        parentName={parentName}
        parentRole={parentRole}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPhone('');
          setChildren([]);
          setParentName('');
          setParentRole('');
        }}
      />
    </div>
  );
}