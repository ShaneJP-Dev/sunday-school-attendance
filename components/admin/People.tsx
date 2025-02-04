// app/people/page.tsx
"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreVertical, Plus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateChildModal from "@/components/admin/CreateChildModal";
import EditChildModal from "@/components/admin/EditChildModal";
import { DataTableToolbar, SearchField } from "@/components/DataTableToolbar";
import { useMemo, useState } from "react";

interface Parent {
  name: string;
  role: string;
  phone: string;
  relationship?: string;
}

interface Child {
  id: number;
  name: string;
  birthday: string;
  grade: string;
  parents: Parent[];
}

interface ChildTableProps {
  children: Child[];
  onEdit: (child: Child) => void;
}

interface ChildCardProps {
  child: Child;
  onEdit: (child: Child) => void;
}

const calculateAge = (birthday: string) => {
  const birthDate = new Date(birthday);
  const today = new Date();
  return (
    today.getFullYear() -
    birthDate.getFullYear() -
    (today <
    new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      ? 1
      : 0)
  );
};

const MobileChildCard: React.FC<ChildCardProps> = ({ child, onEdit }) => (
  <Card className="mb-4">
    <CardContent className="pt-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{child.name}</h3>
          <p className="text-sm text-gray-500">ID: {child.id}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(child)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-sm">Age: {calculateAge(child.birthday)} years</p>
        <p className="text-sm">Grade: {child.grade}</p>
        <div className="mt-2">
          <p className="text-sm font-medium">Parents/Guardians:</p>
          {child.parents.map((parent, idx) => (
            <p key={idx} className="text-sm text-gray-600">
              {parent.name} ({parent.role})
            </p>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const DesktopTable: React.FC<ChildTableProps> = ({ children, onEdit }) => (
  <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Parents/Guardians</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children.map((child) => (
          <TableRow key={child.id}>
            <TableCell>{child.id}</TableCell>
            <TableCell className="font-medium">{child.name}</TableCell>
            <TableCell>{calculateAge(child.birthday)} years</TableCell>
            <TableCell>{child.grade}</TableCell>
            <TableCell>
              {child.parents.map((parent, idx) => (
                <div key={idx} className="text-sm">
                  {parent.name} ({parent.role})
                </div>
              ))}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(child)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </ScrollArea>
);

const fetchChildren = async (): Promise<Child[]> => {
  const response = await fetch("/api/people");
  if (!response.ok) throw new Error("Failed to fetch children");
  return response.json();
};

export default function PeoplePage() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchValues, setSearchValues] = useState<Record<keyof Child, string>>({
    id: "",
    name: "",
    birthday: "",
    grade: "",
    parents: "", // Even though we won't search by this, TypeScript needs all properties
  });
  const [sortBy, setSortBy] = useState<keyof Child>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<
    { field: keyof Child; value: string }[]
  >([]);

  const queryClient = useQueryClient();

  const searchFields: SearchField<Child>[] = [
    { key: "id", label: "ID", placeholder: "Search by ID...", type: "number" },
    { key: "name", label: "Name", placeholder: "Search by name..." },
  ];

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ["children"],
    queryFn: fetchChildren,
    gcTime: 1000 * 60 * 30, // 30 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const sortOptions = [
    { label: "Name", value: "name" as keyof Child },
    { label: "Grade", value: "grade" as keyof Child },
    { label: "Age", value: "birthday" as keyof Child },
  ];

  const filterOptions = [
    { label: "Elementary School (RRR-R)", value: "elementary", field: "grade" as keyof Child },
    { label: "Foundation Phase (Grade 1-3)", value: "foundation", field: "grade" as keyof Child },
    { label: "Primary School (Grade 4-7)", value: "primary", field: "grade" as keyof Child },
  ];

  const getGradeLevel = (grade: string): number => {
    // Convert grade to uppercase for consistent comparison
    const upperGrade = grade.toUpperCase().trim();
    
    // Handle special cases
    if (upperGrade === 'RRR') return -2;
    if (upperGrade === 'RR') return -1;
    if (upperGrade === 'R') return 0;
    
    // Handle numeric grades
    const numericGrade = parseInt(upperGrade.replace(/[^0-9]/g, ''));
    return isNaN(numericGrade) ? -999 : numericGrade; // Return invalid number if parse fails
  };

  const isGradeInRange = (grade: string, range: string): boolean => {
    const gradeLevel = getGradeLevel(grade);
    
    switch (range) {
      case 'elementary':
        return gradeLevel >= -2 && gradeLevel <= 0; // RRR to R
      case 'foundation':
        return gradeLevel >= 1 && gradeLevel <= 3; // Grade 1-3
      case 'primary':
        return gradeLevel >= 4 && gradeLevel <= 7; // Grade 4-7
      default:
        return false;
    }
  };

  const filteredAndSortedChildren = useMemo(() => {
    let result = [...children];

    // Apply searches
    if (searchValues.id) {
      result = result.filter((child) =>
        child.id.toString().includes(searchValues.id)
      );
    }
    if (searchValues.name) {
      result = result.filter((child) =>
        child.name.toLowerCase().includes(searchValues.name.toLowerCase())
      );
    }
    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((child) =>
        activeFilters.every((filter) => {
          if (filter.field === "grade") {
            return isGradeInRange(child.grade, filter.value);
          }
          return true;
        })
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "grade") {
        // Custom sort for grades
        compareValue = getGradeLevel(a.grade) - getGradeLevel(b.grade);
      } else if (sortBy === "birthday") {
        compareValue = new Date(b.birthday).getTime() - new Date(a.birthday).getTime();
      } else {
        compareValue = String(a[sortBy]).localeCompare(String(b[sortBy]));
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [children, searchValues, activeFilters, sortBy, sortOrder]);

  const handleEdit = (child: Child) => {
    setSelectedChild(child);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["children"] });
    setIsEditOpen(false);
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["children"] });
    setIsCreateOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            People
          </CardTitle>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          <DataTableToolbar
            searchFields={searchFields}
            searchValues={searchValues}
            onSearchChange={(field, value) =>
              setSearchValues((prev) => ({ ...prev, [field]: value }))
            }
            sortOptions={sortOptions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
            }}
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />

          {filteredAndSortedChildren.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No children found.{" "}
              {children.length > 0
                ? "Try adjusting your filters."
                : "Add some to get started."}
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-4">
                {filteredAndSortedChildren.map((child) => (
                  <MobileChildCard
                    key={child.id}
                    child={child}
                    onEdit={handleEdit}
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <DesktopTable
                  children={filteredAndSortedChildren}
                  onEdit={handleEdit}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateChildModal
        open={isCreateOpen}
        setOpen={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />

      {selectedChild && (
        <EditChildModal
          open={isEditOpen}
          setOpen={setIsEditOpen}
          child={selectedChild}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
