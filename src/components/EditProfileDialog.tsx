import { useState, useEffect } from 'react';
import { useEditPersonProfile, type PersonId } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: PersonId;
    name: string;
  };
}

export default function EditProfileDialog({ open, onOpenChange, profile }: EditProfileDialogProps) {
  const [name, setName] = useState('');
  const editProfile = useEditPersonProfile();

  useEffect(() => {
    if (profile && open) {
      setName(profile.name);
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a name');
      return;
    }

    if (trimmedName === profile.name) {
      toast.info('No changes made');
      onOpenChange(false);
      return;
    }

    try {
      await editProfile.mutateAsync({ id: profile.id, newName: trimmedName });
      toast.success('Profile updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Edit profile error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Profile</DialogTitle>
          <DialogDescription>Update the person's name</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Enter person's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="rounded-xl"
                disabled={editProfile.isPending}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
              disabled={editProfile.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
              disabled={editProfile.isPending}
            >
              {editProfile.isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
