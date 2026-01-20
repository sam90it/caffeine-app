import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAddGroupMember, type GroupId } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Camera, Upload } from 'lucide-react';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: GroupId;
}

export default function AddMemberDialog({ open, onOpenChange, groupId }: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<ExternalBlob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMember = useAddGroupMember();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to bytes for backend
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      setProfilePhoto(blob);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a member name');
      return;
    }

    try {
      await addMember.mutateAsync({ 
        groupId, 
        name: name.trim(), 
        contact: contact.trim(),
        profilePhoto 
      });
      toast.success('Member added successfully');
      setName('');
      setContact('');
      setProfilePhoto(null);
      setPhotoPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleReset = () => {
    setName('');
    setContact('');
    setProfilePhoto(null);
    setPhotoPreview(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add a new member to this travel group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24 border-2 border-border">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt={name || 'Member'} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white text-2xl">
                    {name ? name.charAt(0).toUpperCase() : <Camera className="h-8 w-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl"
              >
                <Upload className="mr-2 h-4 w-4" />
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-name">Name *</Label>
              <Input
                id="member-name"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-contact">Contact (optional)</Label>
              <Input
                id="member-contact"
                placeholder="e.g., +1234567890"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMember.isPending || !name.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90"
            >
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
