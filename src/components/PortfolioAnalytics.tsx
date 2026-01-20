import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from 'lucide-react';
import { useGetCallerUserProfile, type ProfileWithLedger, getPersonName } from '../hooks/useQueries';
import CurrencyIcon from './CurrencyIcon';
import type { Amount } from '../backend';

interface PortfolioAnalyticsProps {
  profiles: ProfileWithLedger[];
  summary?: {
    totalLent: Amount;
    totalRepaid: Amount;
    totalOwed: Amount;
    remainingDue: Amount;
  } | null;
}

export default function PortfolioAnalytics({ profiles, summary }: PortfolioAnalyticsProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const currency = userProfile?.currencyPreference || 'USD';

  // Enrich profiles with names
  const enrichedProfiles = profiles.map(profile => ({
    ...profile,
    name: getPersonName(profile.id),
  }));

  // Calculate analytics metrics
  const calculateMetrics = () => {
    if (!summary) {
      return {
        totalExposure: 0,
        realizedReturns: 0,
        unrealizedGains: 0,
        riskAdjustedReturn: 0,
        activeProfiles: 0,
        settledProfiles: 0,
        recoveryRate: 0,
        portfolioGrowth: 0,
      };
    }

    const totalLent = Number(summary.totalLent);
    const totalRepaid = Number(summary.totalRepaid);
    const remainingDue = Number(summary.remainingDue);

    // Total exposure (weighted sum of all approved debits)
    const totalExposure = totalLent;

    // Realized returns (completed transaction cycles)
    const realizedReturns = totalRepaid;

    // Unrealized gains (outstanding balances - Remaining Due)
    const unrealizedGains = remainingDue;

    // Risk-adjusted return (recovery rate as percentage)
    const recoveryRate = totalLent > 0 ? (totalRepaid / totalLent) * 100 : 0;

    // Active profiles (with non-zero balance)
    const activeProfiles = enrichedProfiles.filter(p => {
      const balance = calculateProfileBalance(p);
      return balance !== 0n;
    }).length;

    // Settled profiles (zero balance and all approved)
    const settledProfiles = enrichedProfiles.filter(p => {
      const balance = calculateProfileBalance(p);
      const hasPending = p.ledgerEntries.some(e => e.status === 'pending');
      return balance === 0n && !hasPending && p.approvalStatus;
    }).length;

    // Portfolio growth (ratio of outstanding to total lent)
    const portfolioGrowth = totalLent > 0 ? (remainingDue / totalLent) * 100 : 0;

    // Risk-adjusted return metric
    const riskAdjustedReturn = totalLent > 0 ? ((totalRepaid - totalLent * 0.05) / totalLent) * 100 : 0;

    return {
      totalExposure,
      realizedReturns,
      unrealizedGains,
      riskAdjustedReturn,
      activeProfiles,
      settledProfiles,
      recoveryRate,
      portfolioGrowth,
    };
  };

  const calculateProfileBalance = (profile: ProfileWithLedger): bigint => {
    let totalLent = 0n;
    let totalRepaid = 0n;

    for (const entry of profile.ledgerEntries) {
      if (entry.status === 'approved') {
        switch (entry.transactionType) {
          case 'debit':
            totalLent += entry.amount;
            break;
          case 'credit':
            totalRepaid += entry.amount;
            break;
        }
      }
    }

    return totalLent - totalRepaid;
  };

  const metrics = calculateMetrics();

  if (enrichedProfiles.length === 0) {
    return (
      <Card className="rounded-2xl shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-2xl bg-muted/50 mb-4">
            <Activity className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center font-medium">
            No analytics data available
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Add people and transactions to see portfolio analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <CurrencyIcon currencyCode={currency} className="text-2xl font-bold text-foreground" logoSize="md" />
              <div className="text-2xl font-bold text-foreground">
                {metrics.totalExposure.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted sum of approved debits
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Realized Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <CurrencyIcon currencyCode={currency} className="text-2xl font-bold text-success" logoSize="md" />
              <div className="text-2xl font-bold text-success">
                {metrics.realizedReturns.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed transaction cycles
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Due</CardTitle>
            {metrics.unrealizedGains >= 0 ? (
              <TrendingUp className="h-4 w-4 text-info" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <CurrencyIcon 
                currencyCode={currency} 
                className={`text-2xl font-bold ${metrics.unrealizedGains >= 0 ? 'text-info' : 'text-destructive'}`}
                logoSize="md"
              />
              <div className={`text-2xl font-bold ${metrics.unrealizedGains >= 0 ? 'text-info' : 'text-destructive'}`}>
                {metrics.unrealizedGains.toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding balances (approved only)
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Profiles</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.activeProfiles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.settledProfiles} settled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk-Adjusted Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recovery Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Repayment Progress</span>
                <span className="font-semibold text-foreground">{metrics.recoveryRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(metrics.recoveryRate, 100)} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of lent amount that has been repaid
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-info" />
              Portfolio Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Outstanding Ratio</span>
                <span className={`font-semibold ${metrics.portfolioGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {metrics.portfolioGrowth.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(Math.abs(metrics.portfolioGrowth), 100)} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ratio of remaining due to total lent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk-Adjusted Return */}
      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Risk-Adjusted Return
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">
                {metrics.riskAdjustedReturn.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Adjusted for 5% risk premium
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Lent</p>
              <div className="flex items-baseline gap-2">
                <CurrencyIcon currencyCode={currency} className="text-lg font-semibold text-foreground" logoSize="sm" />
                <p className="text-lg font-semibold text-foreground">
                  {metrics.totalExposure.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Realized</p>
                <div className="flex items-baseline gap-2">
                  <CurrencyIcon currencyCode={currency} className="font-semibold text-success" logoSize="sm" />
                  <p className="font-semibold text-success">
                    {metrics.realizedReturns.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining Due</p>
                <div className="flex items-baseline gap-2">
                  <CurrencyIcon 
                    currencyCode={currency} 
                    className={`font-semibold ${metrics.unrealizedGains >= 0 ? 'text-info' : 'text-destructive'}`}
                    logoSize="sm"
                  />
                  <p className={`font-semibold ${metrics.unrealizedGains >= 0 ? 'text-info' : 'text-destructive'}`}>
                    {metrics.unrealizedGains.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Distribution */}
      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrichedProfiles.slice(0, 5).map((profile) => {
              const balance = Number(calculateProfileBalance(profile));
              const percentage = metrics.totalExposure > 0 
                ? (Math.abs(balance) / metrics.totalExposure) * 100 
                : 0;

              return (
                <div key={profile.id.toString()} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{profile.name}</span>
                    <div className="flex items-baseline gap-2">
                      <CurrencyIcon 
                        currencyCode={currency} 
                        className={`font-semibold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}
                        logoSize="sm"
                      />
                      <span className={`font-semibold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total exposure
                  </p>
                </div>
              );
            })}
            {enrichedProfiles.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing top 5 of {enrichedProfiles.length} profiles
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
