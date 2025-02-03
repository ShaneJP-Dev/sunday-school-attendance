'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Parent {
  name: string;
  role: 'Mother' | 'Father' | 'Guardian';
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

interface EditChildModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  child: Child;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  birthday: string;
  grade: string;
  parents: Parent[];
}

const ROLE_OPTIONS = ['Mother', 'Father', 'Guardian'];

const EditChildModal: React.FC<EditChildModalProps> = ({ 
  open, 
  setOpen, 
  child,
  onSuccess 
}) => {
  const [form, setForm] = useState<FormState>({
    name: '',
    birthday: '',
    grade: '',
    parents: []
  });

  useEffect(() => {
    if (child) {
      setForm({
        name: child.name,
        birthday: child.birthday ? new Date(child.birthday).toISOString() : '',
        grade: child.grade,
        parents: child.parents.map(parent => ({
          name: parent.name,
          role: parent.role as 'Mother' | 'Father' | 'Guardian',
          phone: parent.phone,
          relationship: parent.relationship
        }))
      });
    }
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/children/${child.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          birthday: form.birthday,
          grade: form.grade,
          parents: form.parents.map(parent => ({
            name: parent.name,
            role: parent.role,
            phone: parent.phone,
            relationship: parent.role === 'Guardian' ? parent.relationship : undefined
          }))
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update child');
      }
  
      const data = await response.json();
      if (data.success) {
        onSuccess?.();
      } else {
        throw new Error(data.error || 'Failed to update child');
      }
    } catch (error) {
      console.error('Error updating child:', error);
      // Optional: Add error toast notification here
    }
  };
  

  const addParent = () => {
    setForm(prev => ({
      ...prev,
      parents: [...prev.parents, { name: '', role: 'Guardian', phone: '', relationship: '' }]
    }));
  };

  const removeParent = (index: number) => {
    setForm(prev => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index)
    }));
  };

  const updateParent = (index: number, field: keyof Parent, value: string) => {
    setForm(prev => ({
      ...prev,
      parents: prev.parents.map((parent, i) => 
        i === index ? { ...parent, [field]: value as any } : parent
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Child Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Child Details</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday ? format(new Date(form.birthday), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Parents/Guardians Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Parents/Guardians</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParent}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Parent/Guardian
              </Button>
            </div>

            <div className="space-y-4">
              {form.parents.map((parent, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Parent/Guardian {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParent(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Name</Label>
                          <Input
                            value={parent.name}
                            onChange={(e) => updateParent(index, 'name', e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Role</Label>
                          <Select
                            value={parent.role}
                            onValueChange={(value) => updateParent(index, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label>Phone</Label>
                          <Input
                            type="tel"
                            value={parent.phone}
                            onChange={(e) => updateParent(index, 'phone', e.target.value)}
                            required
                          />
                        </div>

                        {parent.role === 'Guardian' && (
                          <div className="grid gap-2">
                            <Label>Relationship</Label>
                            <Input
                              value={parent.relationship || ''}
                              onChange={(e) => updateParent(index, 'relationship', e.target.value)}
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChildModal;