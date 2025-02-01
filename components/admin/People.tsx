"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import CreateChildModal from "@/components/admin/CreateChildModal";
import EditChildModal from "@/components/admin/EditChildModal";

interface Parent {
  name: string;
  role: string;
}

interface Child {
  id: number;
  name: string;
  birthDate: string; // Added birthDate field
  grade: string;
  parents: Parent[];
}
const calculateAge = (birthday: string) => {
  const birthDate = new Date(birthday);
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear() - 
         (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
};


const People: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/people');
        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }
        const data = await response.json();
  
        console.log("Fetched children data:", data); // Log the data
  
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
  
        setChildren(data);
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    };
  
    fetchChildren();
  }, []);
  
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this child?")) return;

    try {
      const response = await fetch("/api/people", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete child");
      }

      setChildren((prev) => prev.filter((child) => child.id !== id));
    } catch (error) {
      console.error("Error deleting child:", error);
    }
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
            <th className="text-left px-4 py-2">Parents/Guardians</th>
            <th className="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id} className="border-b last:border-b-0">
              <td className="px-4 py-2">{child.id}</td>
              <td className="px-4 py-2">{child.name}</td>
              <td>{child.birthday ? calculateAge(child.birthday) + ' years' : 'N/A'}</td>
              <td className="px-4 py-2">{child.grade}</td>
              <td className="px-4 py-2">
                {child.parents.length > 0
                  ? child.parents.map((parent) => (
                      <div key={parent.name}>
                        {parent.name} ({parent.role})
                      </div>
                    ))
                  : "N/A"}
              </td>
              <td className="px-4 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedChild(child);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDelete(child.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      <CreateChildModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {selectedChild && (
        <EditChildModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          child={selectedChild}
        />
      )}
    </div>
  );
};

export default People;
