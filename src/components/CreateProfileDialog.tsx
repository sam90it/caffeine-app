import { useState, useEffect } from 'react';
import { useCreatePersonProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProfileDialog({ open, onOpenChange }: CreateProfileDialogProps) {
  const [name, setName] = useState('');
  const createProfile = useCreatePersonProfile();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await createProfile.mutateAsync(trimmedName);
      toast.success(`${trimmedName} added successfully!`);
      setName('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to add person:', error);
      toast.error(error?.message || 'Failed to add person');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!createProfile.isPending) {
      if (!newOpen) {
        setName('');
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-lg bg-white z-[150]" 
        onPointerDownOutside={(e) => {
          if (createProfile.isPending) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (createProfile.isPending) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New Person</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Create a profile for someone you transact with
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <Card className="rounded-xl border-border/50 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-2">
                <Label htmlFor="person-name" className="text-sm font-medium">Name</Label>
                <Input
                  id="person-name"
                  placeholder="Enter person's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  disabled={createProfile.isPending}
                  className="rounded-xl border-border/50 h-11 text-base touch-manipulation"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="rounded-xl w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
              disabled={createProfile.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-primary hover:bg-primary/90 w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
              disabled={createProfile.isPending || !name.trim()}
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Person'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
