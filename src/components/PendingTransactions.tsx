import { useGetPendingLedgerEntries, useApproveLedgerEntry, useRejectLedgerEntry, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import CurrencyIcon from './CurrencyIcon';

export default function PendingTransactions() {
  const { data: pendingEntries = [], isLoading } = useGetPendingLedgerEntries();
  const { data: userProfile } = useGetCallerUserProfile();
  const approveLedgerEntry = useApproveLedgerEntry();
  const rejectLedgerEntry = useRejectLedgerEntry();

  const currency = userProfile?.currencyPreference || 'USD';

  const handleApprove = async (personId: bigint, transactionId: bigint) => {
    try {
      await approveLedgerEntry.mutateAsync({ personId, transactionId });
    } catch (error) {
      console.error('Failed to approve ledger entry:', error);
    }
  };

  const handleReject = async (personId: bigint, transactionId: bigint) => {
    try {
      await rejectLedgerEntry.mutateAsync({ personId, transactionId });
    } catch (error) {
      console.error('Failed to reject ledger entry:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingEntries.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl shadow-card border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Action Required
          <Badge variant="outline" className="ml-auto border-warning text-warning-foreground">
            {pendingEntries.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingEntries.map(({ personId, entry, personName }) => (
          <Card key={`${personId}-${entry.id}`} className="p-4 rounded-xl bg-warning/5 border-warning/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-foreground">{personName}</p>
                  <Badge variant="outline" className="border-warning text-warning-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <CurrencyIcon currencyCode={currency} className="text-xl font-bold text-foreground" logoSize="md" />
                  <p className="text-xl font-bold text-foreground">
                    {Number(entry.amount).toLocaleString()}
                  </p>
                </div>
                {entry.description && (
                  <p className="text-sm text-muted-foreground mb-1">{entry.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(Number(entry.date) / 1_000_000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(personId, entry.id)}
                  disabled={approveLedgerEntry.isPending}
                  className="text-success border-success hover:bg-success/10 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(personId, entry.id)}
                  disabled={rejectLedgerEntry.isPending}
                  className="text-destructive border-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
