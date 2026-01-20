import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { formatCurrency } from '../lib/currencies';
import CurrencyIcon from './CurrencyIcon';

interface SummaryCardsProps {
  summary?: {
    totalLent: bigint;
    totalRepaid: bigint;
    totalOwed: bigint;
    remainingDue: bigint;
  };
  isLoading: boolean;
}

export default function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const currency = userProfile?.currencyPreference || 'USD';

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-xl border-border/50 bg-white">
            <CardContent className="p-4">
              <div className="h-3 w-20 bg-muted animate-pulse rounded mb-2" />
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const remainingDue = Number(summary.remainingDue);
  const isPositive = remainingDue >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-xl border-border/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">Total Debit</p>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CurrencyIcon currencyCode={currency} className="text-xl text-success" showLogo={false} />
            <p className="text-2xl font-bold text-success tracking-tight">
              {Number(summary.totalLent).toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Approved debit entries only
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">Total Credit</p>
            <div className="p-2 rounded-lg bg-info/10">
              <TrendingDown className="h-4 w-4 text-info" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CurrencyIcon currencyCode={currency} className="text-xl text-info" showLogo={false} />
            <p className="text-2xl font-bold text-info tracking-tight">
              {Number(summary.totalRepaid).toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Approved credit entries only
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">I Owe Total</p>
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CurrencyIcon currencyCode={currency} className="text-xl text-destructive" showLogo={false} />
            <p className="text-2xl font-bold text-destructive tracking-tight">
              {Number(summary.totalOwed).toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Approved credits from my perspective
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">Remaining Due</p>
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <DollarSign className={`h-4 w-4 ${isPositive ? 'text-success' : 'text-destructive'}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <CurrencyIcon 
              currencyCode={currency} 
              className={`text-xl ${isPositive ? 'text-success' : 'text-destructive'}`}
              showLogo={false}
            />
            <p className={`text-2xl font-bold tracking-tight ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {remainingDue.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total Debit - Total Credit (approved only)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
