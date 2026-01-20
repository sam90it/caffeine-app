import { useState } from 'react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useResetDashboard } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ResetDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetDashboardDialog({ open, onOpenChange }: ResetDashboardDialogProps) {
  const resetDashboard = useResetDashboard();

  const handleReset = async () => {
    try {
      await resetDashboard.mutateAsync();
      toast.success('Dashboard reset successfully! All data cleared.');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to reset dashboard');
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg w-[95vw] bg-white rounded-2xl">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-foreground">
              Reset Dashboard
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground space-y-3">
            <p>
              This will permanently delete all of your:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Person profiles and contacts</li>
              <li>Ledger entries and transactions</li>
              <li>Balance calculations and analytics</li>
            </ul>
            <p className="font-medium text-foreground pt-2">
              Your authentication and settings (phone number, currency preference) will be preserved.
            </p>
            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            className="h-11 rounded-xl border-border hover:bg-muted/50 w-full sm:w-auto touch-manipulation"
            disabled={resetDashboard.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={resetDashboard.isPending}
            className="h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto sm:min-w-[140px] touch-manipulation"
          >
            {resetDashboard.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Dashboard'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
