import { useState } from 'react';
import { useGetProfileBalance, useDeletePersonProfile, useSetApprovalStatus, type PersonId } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, User, CheckCircle2, History } from 'lucide-react';
import TransactionList from './TransactionList';
import TransactionHistory from './TransactionHistory';
import AddTransactionDialog from './AddTransactionDialog';
import EditProfileDialog from './EditProfileDialog';
import CurrencyIcon from './CurrencyIcon';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/currencies';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface ProfileViewProps {
  profile: {
    id: PersonId;
    name: string;
    approvalStatus: boolean;
  };
  onClose: () => void;
}

export default function ProfileView({ profile, onClose }: ProfileViewProps) {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: balance } = useGetProfileBalance(profile.id);
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteProfile = useDeletePersonProfile();
  const setApprovalStatus = useSetApprovalStatus();

  const currency = userProfile?.currencyPreference || 'USD';

  const handleDelete = async () => {
    try {
      await deleteProfile.mutateAsync(profile.id);
      toast.success(`${profile.name} deleted successfully`);
      onClose();
    } catch (error) {
      toast.error('Failed to delete profile');
      console.error(error);
    }
  };

  const handleApprove = async () => {
    try {
      await setApprovalStatus.mutateAsync({ personId: profile.id, approved: true });
      toast.success('Profile approved successfully');
    } catch (error: any) {
      if (error.message?.includes('balance must be zero')) {
        toast.error('Cannot approve: balance must be zero');
      } else {
        toast.error('Failed to approve profile');
      }
      console.error(error);
    }
  };

  const handleRevokeApproval = async () => {
    try {
      await setApprovalStatus.mutateAsync({ personId: profile.id, approved: false });
      toast.success('Approval revoked');
    } catch (error) {
      toast.error('Failed to revoke approval');
      console.error(error);
    }
  };

  const remainingDue = balance ? Number(balance.remainingDue) : 0;
  const isPositive = remainingDue >= 0;
  const isBalanceZero = remainingDue === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  {profile.approvalStatus && (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Settled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Person ID: {profile.id.toString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setEditProfileOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Debit</p>
              <div className="flex items-baseline gap-2">
                <CurrencyIcon currencyCode={currency} className="text-lg text-emerald-600" logoSize="sm" />
                <p className="text-xl font-bold text-emerald-600">
                  {balance ? Number(balance.totalLent).toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credit</p>
              <div className="flex items-baseline gap-2">
                <CurrencyIcon currencyCode={currency} className="text-lg text-blue-600" logoSize="sm" />
                <p className="text-xl font-bold text-blue-600">
                  {balance ? Number(balance.totalRepaid).toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">I Owe Total</p>
              <div className="flex items-baseline gap-2">
                <CurrencyIcon currencyCode={currency} className="text-lg text-red-600" logoSize="sm" />
                <p className="text-xl font-bold text-red-600">
                  {balance ? Number(balance.totalOwed).toLocaleString() : '0'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining Due</p>
              <div className="flex items-baseline gap-2">
                <CurrencyIcon 
                  currencyCode={currency} 
                  className={`text-lg ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
                  logoSize="sm"
                />
                <p className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {balance ? Number(balance.remainingDue).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>

          {isBalanceZero && !profile.approvalStatus && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">All dues cleared!</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Balance is zero. You can now mark this as settled.
                  </p>
                </div>
                <Button
                  onClick={handleApprove}
                  disabled={setApprovalStatus.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {setApprovalStatus.isPending ? 'Marking...' : 'Mark Settled'}
                </Button>
              </div>
            </div>
          )}

          {profile.approvalStatus && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">Profile Settled</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      All transactions have been settled and approved.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRevokeApproval}
                  disabled={setApprovalStatus.isPending}
                >
                  {setApprovalStatus.isPending ? 'Revoking...' : 'Revoke'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Active Entries</TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Ledger Entries</h2>
            <Button
              onClick={() => setAddTransactionOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Add Entry
            </Button>
          </div>
          <TransactionList personId={profile.id} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <p className="text-sm text-muted-foreground">All transactions including archived</p>
          </div>
          <TransactionHistory personId={profile.id} />
        </TabsContent>
      </Tabs>

      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        personId={profile.id}
        personName={profile.name}
      />

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={profile}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {profile.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this profile and all associated ledger entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deleteProfile.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
