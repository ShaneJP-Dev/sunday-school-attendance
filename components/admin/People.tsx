'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import CreateChildModal from '@/components/admin/CreateChildModal';
import EditChildModal from '@/components/admin/EditChildModal';

interface Child {
  id: number;
  name: string;
  age: number;
  grade: string;
  parent: { name: string };
}

const People: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      const response = await fetch('/api/people');
      const data = await response.json();
      setChildren(data);
    };

    fetchChildren();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this child?')) return;
    
    await fetch(`/api/people`, { method: 'DELETE' });
    
    setChildren((prev) => prev.filter((child) => child.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">People</h2>
        <Button onClick={() => setIsCreateOpen(true)}>Create New</Button>
      </div>

      <table className="w-full bg-white rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-4 py-2">ID</th>
            <th className="text-left px-4 py-2">Name</th>
            <th className="text-left px-4 py-2">Age</th>
            <th className="text-left px-4 py-2">Grade</th>
            <th className="text-left px-4 py-2">Parent</th>
            <th className="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id} className="border-b last:border-b-0">
              <td className="px-4 py-2">{child.id}</td>
              <td className="px-4 py-2">{child.name}</td>
              <td className="px-4 py-2">{child.age}</td>
              <td className="px-4 py-2">{child.grade}</td>
              <td className="px-4 py-2">{child.parent?.name || 'N/A'}</td>
              <td className="px-4 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSelectedChild(child); setIsEditOpen(true); }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(child.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create and Edit Modals */}
      <CreateChildModal open={isCreateOpen} setOpen={setIsCreateOpen} />
      {selectedChild && <EditChildModal open={isEditOpen} setOpen={setIsEditOpen} child={selectedChild} />}
    </div>
  );
};

export default People;
