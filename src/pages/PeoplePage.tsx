import { useState } from 'react';
import { useGetAllPersonProfiles, type PersonId } from '../hooks/useQueries';
import ProfileList from '../components/ProfileList';
import ProfileView from '../components/ProfileView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PeoplePage() {
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | null>(null);
  
  const { data: profiles = [], isLoading: profilesLoading } = useGetAllPersonProfiles();

  const selectedProfile = profiles.find((p) => p.id === selectedPersonId);

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
        <p className="text-muted-foreground mt-1">Manage all your contacts and their transactions</p>
      </div>

      <ProfileList
        profiles={profiles}
        isLoading={profilesLoading}
        onSelectProfile={setSelectedPersonId}
      />
    </div>
  );
}
