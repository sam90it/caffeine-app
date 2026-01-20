import { useState } from 'react';
import { useGetAllPersonProfiles, type PersonId } from '../hooks/useQueries';
import ProfileList from '../components/ProfileList';
import ProfileView from '../components/ProfileView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProfilesPageProps {
  hideSettled: boolean;
  onCreatePerson: () => void;
}

export default function ProfilesPage({ hideSettled, onCreatePerson }: ProfilesPageProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | null>(null);
  
  const { data: profiles = [], isLoading: profilesLoading } = useGetAllPersonProfiles();

  const selectedProfile = profiles.find((p) => p.id === selectedPersonId);

  // Filter profiles based on settled status
  const filteredProfiles = hideSettled 
    ? profiles.filter(p => {
        // Calculate if profile is settled (balance = 0 and all transactions approved)
        const hasBalance = p.ledgerEntries.some(e => e.status === 'approved');
        const hasPending = p.ledgerEntries.some(e => e.status === 'pending');
        return hasBalance || hasPending || !p.approvalStatus;
      })
    : profiles;

  if (selectedPersonId !== null && selectedProfile) {
    return (
      <div className="container py-6 max-w-4xl animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => setSelectedPersonId(null)}
          className="mb-4 rounded-xl hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to People
        </Button>
        <ProfileView 
          profile={{
            id: selectedProfile.id,
            name: selectedProfile.name,
            approvalStatus: selectedProfile.approvalStatus
          }} 
          onClose={() => setSelectedPersonId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">People</h1>
      </div>

      <ProfileList
        profiles={filteredProfiles}
        isLoading={profilesLoading}
        onSelectProfile={setSelectedPersonId}
      />
    </div>
  );
}
