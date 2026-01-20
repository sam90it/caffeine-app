import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateGroupMember, type GroupId, type MemberId } from '../hooks/useQueries';
import { ExternalBlob, GroupMember } from '../backend';
import { toast } from 'sonner';
import { Camera, Upload } from 'lucide-react';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: GroupId;
  member: GroupMember;
}

export default function EditMemberDialog({ open, onOpenChange, groupId, member }: EditMemberDialogProps) {
  const [name, setName] = useState(member.name);
  const [contact, setContact] = useState(member.contact);
  const [profilePhoto, setProfilePhoto] = useState<ExternalBlob | null>(member.profilePhoto || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMember = useUpdateGroupMember();

  useEffect(() => {
    setName(member.name);
    setContact(member.contact);
    setProfilePhoto(member.profilePhoto || null);
    
    // Load existing photo preview
    if (member.profilePhoto) {
      const url = member.profilePhoto.getDirectURL();
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }, [member]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

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
      await updateMember.mutateAsync({ 
        groupId, 
        memberId: member.id,
        name: name.trim(), 
        contact: contact.trim(),
        profilePhoto 
      });
      toast.success('Member updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update member details and profile photo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24 border-2 border-border">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt={name} />
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
              <Label htmlFor="edit-member-name">Name *</Label>
              <Input
                id="edit-member-name"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-contact">Contact (optional)</Label>
              <Input
                id="edit-member-contact"
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
              disabled={updateMember.isPending || !name.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90"
            >
              {updateMember.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
