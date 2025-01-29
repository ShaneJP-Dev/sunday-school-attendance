// app/admin/People.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';


interface Child {
  id: number;
  name: string;
  age: number;
  grade: string;
}

const People: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    const fetchChildren = async () => {
      const response = await fetch('/api/getChildren');
      const data = await response.json();
      setChildren(data);
    };

    fetchChildren();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">People</h2>
      <Button className="mb-4">Add New Child</Button>
      <table className="w-full bg-white rounded-lg shadow-lg">
        <thead>
          <tr>
            <th className="text-left">ID</th>
            <th className="text-left">Name</th>
            <th className="text-left">Age</th>
            <th className="text-left">Grade</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id} className="border-b last:border-b-0">
              <td>{child.id}</td>
              <td>{child.name}</td>
              <td>{child.age}</td>
              <td>{child.grade}</td>
              <td>
                <Button>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default People;