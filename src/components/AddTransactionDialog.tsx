import { useState, useEffect } from 'react';
import { useAddLedgerEntry, useGetCallerUserProfile, type UITransactionType, type PersonId } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CURRENCIES } from '../lib/currencies';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: PersonId;
  personName: string;
}

export default function AddTransactionDialog({ open, onOpenChange, personId, personName }: AddTransactionDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const defaultCurrency = userProfile?.currencyPreference || 'USD';
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<UITransactionType>('lent');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [counterpartyPrincipal, setCounterpartyPrincipal] = useState('');

  const addLedgerEntry = useAddLedgerEntry();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount('');
      setType('lent');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCurrency(defaultCurrency);
      setCounterpartyPrincipal('');
    }
  }, [open, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const dateObj = new Date(date);
      const timestamp = BigInt(dateObj.getTime() * 1_000_000);
      
      // Parse counterparty principal or use anonymous principal for self-recorded transactions
      let counterparty: Principal;
      const trimmedCounterparty = counterpartyPrincipal.trim();
      
      if (trimmedCounterparty === '') {
        // Use anonymous principal for self-recorded transactions
        counterparty = Principal.fromText('2vxsx-fae');
      } else {
        try {
          counterparty = Principal.fromText(trimmedCounterparty);
        } catch (error) {
          toast.error('Invalid counterparty principal ID format');
          return;
        }
      }

      await addLedgerEntry.mutateAsync({
        personId,
        amount: BigInt(Math.round(amountNum)),
        uiTransactionType: type,
        description: description.trim(),
        date: timestamp,
        currency,
        counterparty,
      });

      if (trimmedCounterparty === '') {
        toast.success('Personal note created successfully!');
      } else {
        toast.success('Ledger entry created successfully! (Pending approval)');
      }
      
      setAmount('');
      setType('lent');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setCurrency(defaultCurrency);
      setCounterpartyPrincipal('');
      onOpenChange(false);
    } catch (error: any) {
      if (error.message?.includes('not a registered user')) {
        toast.error('Counterparty is not a registered user');
      } else if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid counterparty principal ID');
      } else {
        toast.error('Failed to create ledger entry');
      }
      console.error(error);
    }
  };

  const transactionTypes: Array<{ value: UITransactionType; label: string }> = [
    { value: 'lent', label: 'I lent' },
    { value: 'repaid', label: 'Repaid' },
    { value: 'owed', label: 'I owe' },
    { value: 'adjusted', label: 'Adjust' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold">Add Transaction</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Record a transaction with {personName}. Leave counterparty empty for personal notes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Amount and Currency Row */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 text-base rounded-xl border-border bg-white focus:ring-2 focus:ring-primary/20 touch-manipulation"
                autoFocus
                disabled={addLedgerEntry.isPending}
              />
            </div>
            <div className="space-y-2 w-28">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency} disabled={addLedgerEntry.isPending}>
                <SelectTrigger 
                  id="currency" 
                  className="h-11 rounded-xl border-border bg-white focus:ring-2 focus:ring-primary/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white rounded-xl shadow-lg border-border max-h-[280px]"
                  position="popper"
                  sideOffset={4}
                >
                  {CURRENCIES.map((curr) => (
                    <SelectItem 
                      key={curr.code} 
                      value={curr.code}
                      className="h-11 cursor-pointer hover:bg-accent/50 focus:bg-accent/50 rounded-lg my-0.5"
                    >
                      <span className="text-base">{curr.symbol} {curr.code}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transaction Type Selector - Button Group Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-xl">
              {transactionTypes.map((txType) => (
                <button
                  key={txType.value}
                  type="button"
                  onClick={() => setType(txType.value)}
                  disabled={addLedgerEntry.isPending}
                  className={cn(
                    "h-11 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-white/80 active:scale-[0.98] touch-manipulation",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    type === txType.value
                      ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {txType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Counterparty Principal - Now Optional */}
          <div className="space-y-2">
            <Label htmlFor="counterparty" className="text-sm font-medium">
              Counterparty Principal ID <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="counterparty"
              type="text"
              placeholder="Leave empty for personal notes"
              value={counterpartyPrincipal}
              onChange={(e) => setCounterpartyPrincipal(e.target.value)}
              className="h-11 rounded-xl border-border bg-white focus:ring-2 focus:ring-primary/20 touch-manipulation font-mono text-sm"
              disabled={addLedgerEntry.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter a principal ID for collaborative transactions, or leave empty for personal notes that are automatically approved
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 text-base rounded-xl border-border bg-white focus:ring-2 focus:ring-primary/20 touch-manipulation"
              disabled={addLedgerEntry.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note about this transaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-base rounded-xl border-border bg-white resize-none focus:ring-2 focus:ring-primary/20 touch-manipulation"
              disabled={addLedgerEntry.isPending}
            />
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl border-border hover:bg-muted/50 w-full sm:w-auto touch-manipulation active:scale-95 transition-transform"
              disabled={addLedgerEntry.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLedgerEntry.isPending || !amount || parseFloat(amount) <= 0}
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm w-full sm:w-auto sm:min-w-[140px] touch-manipulation active:scale-95 transition-transform"
            >
              {addLedgerEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Entry'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
