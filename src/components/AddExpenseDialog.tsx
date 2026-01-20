import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddExpense, type GroupId, type MemberId } from '../hooks/useQueries';
import { GroupMember } from '../backend';
import { toast } from 'sonner';
import { CURRENCIES } from '../lib/currencies';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: GroupId;
  members: GroupMember[];
}

export default function AddExpenseDialog({ open, onOpenChange, groupId, members }: AddExpenseDialogProps) {
  const [memberId, setMemberId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const addExpense = useAddExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberId) {
      toast.error('Please select a member');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      await addExpense.mutateAsync({
        groupId,
        memberId: BigInt(memberId),
        amount: BigInt(amountInCents),
        description: description.trim(),
        currency,
      });
      toast.success('Expense added successfully');
      setMemberId('');
      setAmount('');
      setDescription('');
      setCurrency('USD');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record an expense paid by a group member
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member">Paid By *</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {members.map((member) => (
                    <SelectItem key={member.id.toString()} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl flex-1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="rounded-xl w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Hotel booking"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              disabled={addExpense.isPending || !memberId || !amount || !description.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90"
            >
              {addExpense.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
