import { useGetTransactionHistory, useGetCallerUserProfile, type PersonId } from '../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, XCircle, Archive } from 'lucide-react';
import CurrencyIcon from './CurrencyIcon';
import type { TransactionType, LedgerStatus } from '../backend';

interface TransactionHistoryProps {
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

function getStatusBadge(status: LedgerStatus) {
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
    case 'archived':
      return (
        <Badge variant="outline" className="border-muted-foreground text-muted-foreground rounded-lg">
          <Archive className="h-3 w-3 mr-1" />
          Archived
        </Badge>
      );
  }
}

export default function TransactionHistory({ personId }: TransactionHistoryProps) {
  const { data: allTransactions = [], isLoading } = useGetTransactionHistory(personId);
  const { data: userProfile } = useGetCallerUserProfile();

  const currency = userProfile?.currencyPreference || 'USD';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (allTransactions.length === 0) {
    return (
      <Card className="p-16 text-center rounded-2xl shadow-card">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-muted/50">
            <Archive className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No transaction history</p>
          <p className="text-sm text-muted-foreground">All transactions will appear here</p>
        </div>
      </Card>
    );
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = [...allTransactions].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="space-y-3">
      <div className="p-4 bg-muted/30 rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Archived transactions are excluded from active balance calculations. 
          Only approved and active entries affect your current balance.
        </p>
      </div>
      
      {sortedTransactions.map((entry) => {
        const isArchived = entry.status === 'archived';
        
        return (
          <Card 
            key={entry.id.toString()} 
            className={`p-5 rounded-2xl shadow-card transition-all ${
              isArchived ? 'opacity-60 bg-muted/20' : 'hover:shadow-card-hover'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent/50 mt-1">
                {getLedgerEntryIcon(entry.transactionType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <p className="font-semibold text-foreground">{getLedgerEntryLabel(entry.transactionType)}</p>
                  {getStatusBadge(entry.status)}
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
                {isArchived && (
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    📦 Archived - Not included in balance calculations
                  </p>
                )}
                {entry.counterpartId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Linked to counterparty entry #{entry.counterpartId.toString()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
