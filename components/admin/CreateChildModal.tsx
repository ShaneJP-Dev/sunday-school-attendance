'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParentInfo {
  type: 'mother' | 'father' | 'guardian';
  name: string;
  phone: string;
}

interface ChildInfo {
  name: string;
  birthday: string;
  grade: string;
}

interface CreateChildModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CreateChildModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateChildModal = ({ open, onClose, onSuccess }: CreateChildModalProps) => {
  const [step, setStep] = useState<'parents' | 'children'>('parents');
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [currentParent, setCurrentParent] = useState<Omit<ParentInfo, 'type'>>({ name: '', phone: '' });
  const [currentChild, setCurrentChild] = useState<ChildInfo>({ name: '', birthday: '', grade: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStep('parents');
    setParents([]);
    setChildren([]);
    setCurrentParent({ name: '', phone: '' });
    setCurrentChild({ name: '', birthday: '', grade: '' });
    setError(null);
    setIsSubmitting(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const getAvailableParentTypes = () => {
    const hasMother = parents.some(p => p.type === 'mother');
    const hasFather = parents.some(p => p.type === 'father');
    const guardianCount = parents.filter(p => p.type === 'guardian').length;

    return {
      mother: !hasMother,
      father: !hasFather,
      guardian: guardianCount < 2
    };
  };

  const canContinueToChildren = () => {
    return parents.length >= 1;
  };

  const handleAddParent = (type: ParentInfo['type']) => {
    if (!currentParent.name || !currentParent.phone) {
      setError('Please fill in all parent information');
      return;
    }

    const newParent: ParentInfo = {
      ...currentParent,
      type
    };

    setParents([...parents, newParent]);
    setCurrentParent({ name: '', phone: '' });
    setError(null);
  };

  const handleAddChild = () => {
    if (!currentChild.name || !currentChild.birthday || !currentChild.grade) {
      setError('Please fill in all child information');
      return;
    }

    setChildren([...children, currentChild]);
    setCurrentChild({ name: '', birthday: '', grade: '' });
    setError(null);
  };

  const handleSubmit = async () => {
    if (children.length === 0) {
      setError('Please add at least one child');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parents, children }),
      });

      const data = await response.json();

      if (response.ok) {
        handleModalClose();
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError(data.error || 'Failed to submit data');
      }
    } catch (error) {
      setError('An error occurred while submitting data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParentsStep = () => (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        <Input
          placeholder="Parent Name"
          value={currentParent.name}
          onChange={(e) => setCurrentParent(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Phone Number"
          value={currentParent.phone}
          onChange={(e) => setCurrentParent(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(getAvailableParentTypes()).map(([type, available]) => (
          available && (
            <Button
              key={type}
              variant="outline"
              onClick={() => handleAddParent(type as ParentInfo['type'])}
              disabled={!currentParent.name || !currentParent.phone || isSubmitting}
            >
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          )
        ))}
      </div>

      {parents.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Added Parents/Guardians:</h4>
          {parents.map((parent, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span>{parent.name} ({parent.type})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParents(parents.filter((_, i) => i !== index))}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button
          onClick={() => setStep('children')}
          disabled={!canContinueToChildren() || isSubmitting}
        >
          Continue to Children
        </Button>
      </div>
    </div>
  );

  const renderChildrenStep = () => (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        <Input
          placeholder="Child Name"
          value={currentChild.name}
          onChange={(e) => setCurrentChild(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          type="date"
          placeholder="Birthday"
          value={currentChild.birthday}
          onChange={(e) => setCurrentChild(prev => ({ ...prev, birthday: e.target.value }))}
        />
        <Input
          placeholder="Grade"
          value={currentChild.grade}
          onChange={(e) => setCurrentChild(prev => ({ ...prev, grade: e.target.value }))}
        />
        <Button
          onClick={handleAddChild}
          disabled={!currentChild.name || !currentChild.birthday || !currentChild.grade || isSubmitting}
        >
          Add Child
        </Button>
      </div>

      {children.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Added Children:</h4>
          {children.map((child, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span>{child.name} (Grade: {child.grade})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChildren(children.filter((_, i) => i !== index))}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => setStep('parents')}
          disabled={isSubmitting}
        >
          Back to Parents
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={children.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Entry'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleModalClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'parents' ? 'Add Parents/Guardians' : 'Add Children'}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'parents' ? renderParentsStep() : renderChildrenStep()}
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildModal;