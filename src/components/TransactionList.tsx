import { useGetAllLedgerEntries, useApproveLedgerEntry, useRejectLedgerEntry, useMarkTransactionAsRepaid, useGetCallerUserProfile, type PersonId } from '../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, ArrowDownCircle } from 'lucide-react';
import CurrencyIcon from './CurrencyIcon';
import type { TransactionType } from '../backend';

interface TransactionListProps {
  personId: PersonId;
}

function getLedgerEntryIcon(type: TransactionType) {
  switch (type) {
    case 'debit':
      return <TrendingUp className="h-5 w-5 text-success" />;
    case 'credit':
      return <TrendingDown className="h-5 w-5 text-info" />;
  }
}

function getLedgerEntryLabel(type: TransactionType) {
  switch (type) {
    case 'debit':
      return 'Lent (Debit)';
    case 'credit':
      return 'Repaid (Credit)';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-warning text-warning-foreground rounded-lg">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="default" className="bg-success hover:bg-success text-success-foreground rounded-lg">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="rounded-lg">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
  }
}

export default function TransactionList({ personId }: TransactionListProps) {
  const { data: ledgerEntries = [], isLoading } = useGetAllLedgerEntries(personId);
  const { data: userProfile } = useGetCallerUserProfile();
  const approveLedgerEntry = useApproveLedgerEntry();
  const rejectLedgerEntry = useRejectLedgerEntry();
  const markAsRepaid = useMarkTransactionAsRepaid();

  const currency = userProfile?.currencyPreference || 'USD';

  const handleApprove = async (transactionId: bigint) => {
    try {
      await approveLedgerEntry.mutateAsync({ personId, transactionId });
    } catch (error) {
      console.error('Failed to approve ledger entry:', error);
    }
  };

  const handleReject = async (transactionId: bigint) => {
    try {
      await rejectLedgerEntry.mutateAsync({ personId, transactionId });
    } catch (error) {
      console.error('Failed to reject ledger entry:', error);
    }
  };

  const handleMarkAsRepaid = async (transactionId: bigint) => {
    try {
      await markAsRepaid.mutateAsync({ personId, transactionId });
    } catch (error) {
      console.error('Failed to mark transaction as repaid:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (ledgerEntries.length === 0) {
    return (
      <Card className="p-16 text-center rounded-2xl shadow-card">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-muted/50">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No active transactions</p>
          <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
        </div>
      </Card>
    );
  }

  // Sort ledger entries by date (newest first)
  const sortedEntries = [...ledgerEntries].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => {
        const isPendingCredit = entry.status === 'pending' && entry.transactionType === 'credit';
        const isApprovedDebit = entry.status === 'approved' && entry.transactionType === 'debit';
        const showMarkAsRepaid = isApprovedDebit;
        
        return (
          <Card key={entry.id.toString()} className="p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2.5 rounded-xl bg-accent/50 mt-1">
                  {getLedgerEntryIcon(entry.transactionType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className="font-semibold text-foreground">{getLedgerEntryLabel(entry.transactionType)}</p>
                    {getStatusBadge(entry.status)}
                    {isPendingCredit && (
                      <Badge variant="outline" className="border-warning bg-warning/10 text-warning-foreground rounded-lg">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <CurrencyIcon currencyCode={currency} className="text-2xl font-bold text-foreground" logoSize="md" />
                    <p className="text-2xl font-bold text-foreground">
                      {Number(entry.amount).toLocaleString()}
                    </p>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(entry.date) / 1_000_000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {entry.status === 'pending' && (
                    <p className="text-xs text-warning mt-1 font-medium">
                      ⚠️ Not included in balance calculations until approved
                    </p>
                  )}
                  {entry.counterpartId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Linked to counterparty entry #{entry.counterpartId.toString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {entry.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(entry.id)}
                      disabled={approveLedgerEntry.isPending}
                      className="text-success border-success hover:bg-success/10 rounded-lg"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(entry.id)}
                      disabled={rejectLedgerEntry.isPending}
                      className="text-destructive border-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {showMarkAsRepaid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRepaid(entry.id)}
                    disabled={markAsRepaid.isPending}
                    className="text-info border-info hover:bg-info/10 rounded-lg whitespace-nowrap"
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-1" />
                    Mark as Repaid
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
