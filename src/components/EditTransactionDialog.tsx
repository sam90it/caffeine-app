import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTransactionDialog({ open, onOpenChange }: EditTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] bg-white rounded-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Edit Transaction
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ledger entries are immutable and cannot be edited
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <Alert className="border-warning bg-warning/10 rounded-xl">
            <AlertCircle className="h-5 w-5 text-warning" />
            <AlertDescription className="text-sm text-foreground ml-2">
              <p className="font-medium mb-2">Immutable Ledger System</p>
              <p className="text-muted-foreground">
                This application uses a double-entry immutable ledger system. Once created, 
                ledger entries cannot be modified to maintain audit integrity. If you need to 
                correct an entry, please create a new adjustment transaction.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl bg-primary hover:bg-primary/90 w-full sm:w-auto touch-manipulation"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
