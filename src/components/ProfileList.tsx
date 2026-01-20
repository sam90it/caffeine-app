import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { useGetCallerUserProfile, type ProfileWithLedger, getPersonName, type PersonId } from '../hooks/useQueries';
import { formatCurrency } from '../lib/currencies';

interface ProfileListProps {
  profiles: ProfileWithLedger[];
  isLoading: boolean;
  onSelectProfile: (id: PersonId) => void;
}

function calculateNetBalance(profile: ProfileWithLedger): bigint {
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
}

export default function ProfileList({ profiles, isLoading, onSelectProfile }: ProfileListProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const currency = userProfile?.currencyPreference || 'USD';

  // Enrich profiles with names from local storage
  const enrichedProfiles = profiles.map(profile => ({
    ...profile,
    name: getPersonName(profile.id),
  }));

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (enrichedProfiles.length === 0) {
    return (
      <Card className="rounded-2xl shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-2xl bg-muted/50 mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-center font-medium">
            No people added yet
          </p>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Click "Add Person" to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {enrichedProfiles.map((profile) => {
        const netBalance = calculateNetBalance(profile);
        const isPositive = netBalance >= 0n;
        const pendingCount = profile.ledgerEntries.filter(e => e.status === 'pending').length;

        return (
          <Card
            key={profile.id.toString()}
            className="cursor-pointer rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02]"
            onClick={() => onSelectProfile(profile.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info shadow-sm">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{profile.name}</h3>
                      <div className="flex gap-1.5 mt-1.5">
                        {profile.approvalStatus && (
                          <Badge variant="default" className="bg-success hover:bg-success text-success-foreground text-xs rounded-lg">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Settled
                          </Badge>
                        )}
                        {pendingCount > 0 && (
                          <Badge variant="outline" className="border-warning text-warning-foreground text-xs rounded-lg">
                            <Clock className="h-3 w-3 mr-1" />
                            {pendingCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground font-medium">Balance:</span>
                    <span className={`font-bold text-lg ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(Number(netBalance), currency)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {profile.ledgerEntries.length} entr{profile.ledgerEntries.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
