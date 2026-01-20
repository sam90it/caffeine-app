import { useState } from 'react';
import { TravelGroup, type MemberId, type ExpenseId } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, DollarSign, Calculator, Plus, Trash2, Pencil } from 'lucide-react';
import AddMemberDialog from './AddMemberDialog';
import EditMemberDialog from './EditMemberDialog';
import AddExpenseDialog from './AddExpenseDialog';
import EditExpenseDialog from './EditExpenseDialog';
import CurrencyIcon from './CurrencyIcon';
import { useCalculateGroupBalance, useDeleteTravelGroup, useGetCallerUserProfile, useRemoveGroupMember } from '../hooks/useQueries';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GroupDetailViewProps {
  group: TravelGroup;
  onClose: () => void;
}

export default function GroupDetailView({ group, onClose }: GroupDetailViewProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof group.members[0] | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<typeof group.expenses[0] | null>(null);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberId | null>(null);
  
  const calculateBalance = useCalculateGroupBalance();
  const deleteGroup = useDeleteTravelGroup();
  const removeMember = useRemoveGroupMember();
  const { data: userProfile } = useGetCallerUserProfile();

  const currency = userProfile?.currencyPreference || 'USD';

  const handleCalculateBalance = async () => {
    try {
      await calculateBalance.mutateAsync(group.id);
      toast.success('Balance calculated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate balance');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup.mutateAsync(group.id);
      toast.success('Travel group deleted');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const handleEditMember = (member: typeof group.members[0]) => {
    setSelectedMember(member);
    setEditMemberOpen(true);
  };

  const handleEditExpense = (expense: typeof group.expenses[0]) => {
    setSelectedExpense(expense);
    setEditExpenseOpen(true);
  };

  const handleDeleteMemberClick = (memberId: MemberId) => {
    setMemberToDelete(memberId);
    setDeleteMemberDialogOpen(true);
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      await removeMember.mutateAsync({ groupId: group.id, memberId: memberToDelete });
      toast.success('Member removed successfully');
      setDeleteMemberDialogOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const totalExpenses = group.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const equalShare = group.members.length > 0 ? totalExpenses / group.members.length : 0;

  const getMemberName = (memberId: MemberId) => {
    const member = group.members.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  const getMemberAvatar = (memberId: MemberId) => {
    const member = group.members.find(m => m.id === memberId);
    return member;
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{group.name}</CardTitle>
              <CardDescription>
                Created on {new Date(Number(group.createdAt) / 1000000).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold">{group.members.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-1">
                <CurrencyIcon currencyCode={currency} className="h-8 w-8 text-success" logoSize="md" showLogo={true} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{(totalExpenses / 100).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <Calculator className="h-8 w-8 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Per Person</p>
                <p className="text-2xl font-bold">{(equalShare / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Group Members</h3>
            <Button
              onClick={() => setAddMemberOpen(true)}
              size="sm"
              className="rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
          {group.members.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No members yet. Add members to start tracking expenses.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {group.members.map((member) => (
                <Card key={member.id.toString()} className="rounded-xl hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-border">
                        {member.profilePhoto ? (
                          <AvatarImage 
                            src={member.profilePhoto.getDirectURL()} 
                            alt={member.name} 
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.contact && (
                          <p className="text-sm text-muted-foreground">{member.contact}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditMember(member)}
                        className="rounded-xl"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemberClick(member.id)}
                        className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <Button
              onClick={() => setAddExpenseOpen(true)}
              size="sm"
              className="rounded-xl"
              disabled={group.members.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
          {group.expenses.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No expenses recorded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {group.expenses.map((expense) => {
                const member = getMemberAvatar(expense.memberId);
                return (
                  <Card key={expense.id.toString()} className="rounded-xl">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="w-10 h-10 border border-border">
                          {member?.profilePhoto ? (
                            <AvatarImage 
                              src={member.profilePhoto.getDirectURL()} 
                              alt={member.name} 
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-info text-white text-sm">
                              {getMemberName(expense.memberId).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Paid by {getMemberName(expense.memberId)} • {new Date(Number(expense.date) / 1000000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold">{(Number(expense.amount) / 100).toFixed(2)}</p>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <CurrencyIcon currencyCode={expense.currency} className="text-xs" logoSize="sm" />
                            <span>{expense.currency}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditExpense(expense)}
                          className="rounded-xl"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settlement" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Settlement Summary</h3>
            <Button
              onClick={handleCalculateBalance}
              disabled={calculateBalance.isPending || group.members.length === 0 || group.expenses.length === 0}
              className="rounded-xl"
            >
              <Calculator className="mr-2 h-4 w-4" />
              {calculateBalance.isPending ? 'Calculating...' : 'Calculate Balance'}
            </Button>
          </div>
          {!group.isCalculated ? (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">
                  Click "Calculate Balance" to see who owes whom
                </p>
              </CardContent>
            </Card>
          ) : group.settlements.length === 0 ? (
            <Card className="rounded-2xl bg-success/5 border-success/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-success font-medium">All settled up!</p>
                <p className="text-muted-foreground text-sm">Everyone has paid their fair share</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {group.settlements.map((settlement, index) => {
                const fromMember = getMemberAvatar(settlement.fromMemberId);
                const toMember = getMemberAvatar(settlement.toMemberId);
                return (
                  <Card key={index} className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-destructive/20">
                            {fromMember?.profilePhoto ? (
                              <AvatarImage 
                                src={fromMember.profilePhoto.getDirectURL()} 
                                alt={fromMember.name} 
                              />
                            ) : (
                              <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-medium">
                                {getMemberName(settlement.fromMemberId).charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{getMemberName(settlement.fromMemberId)}</p>
                            <p className="text-sm text-muted-foreground">owes</p>
                          </div>
                        </div>
                        <div className="text-center px-4 flex items-center gap-2">
                          <CurrencyIcon currencyCode={currency} className="text-2xl text-destructive" logoSize="md" />
                          <p className="text-2xl font-bold text-destructive">
                            {(Number(settlement.amount) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-right">{getMemberName(settlement.toMemberId)}</p>
                            <p className="text-sm text-muted-foreground text-right">receives</p>
                          </div>
                          <Avatar className="w-10 h-10 border-2 border-success/20">
                            {toMember?.profilePhoto ? (
                              <AvatarImage 
                                src={toMember.profilePhoto.getDirectURL()} 
                                alt={toMember.name} 
                              />
                            ) : (
                              <AvatarFallback className="bg-success/10 text-success text-sm font-medium">
                                {getMemberName(settlement.toMemberId).charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        groupId={group.id}
      />
      {selectedMember && (
        <EditMemberDialog
          open={editMemberOpen}
          onOpenChange={setEditMemberOpen}
          groupId={group.id}
          member={selectedMember}
        />
      )}
      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        groupId={group.id}
        members={group.members}
      />
      {selectedExpense && (
        <EditExpenseDialog
          open={editExpenseOpen}
          onOpenChange={setEditExpenseOpen}
          groupId={group.id}
          expense={selectedExpense}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{group.name}" and all its members, expenses, and settlements. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMemberDialogOpen} onOpenChange={setDeleteMemberDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the member from this travel group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteMember}
              disabled={removeMember.isPending}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {removeMember.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
