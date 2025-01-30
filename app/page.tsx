'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChildCheckInModal } from "@/components/admin/ChildCheckInModal";

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

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Check In Children</h1>
      <Input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mt-4"
      />
      <Button onClick={handleSearch} className="mt-2">Search</Button>
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