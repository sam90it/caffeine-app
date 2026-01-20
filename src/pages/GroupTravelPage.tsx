import { useState } from 'react';
import { useGetAllTravelGroups, type GroupId } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Users, DollarSign } from 'lucide-react';
import CreateGroupDialog from '../components/CreateGroupDialog';
import GroupDetailView from '../components/GroupDetailView';

export default function GroupTravelPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<GroupId | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: groups = [], isLoading } = useGetAllTravelGroups();

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (selectedGroupId !== null && selectedGroup) {
    return (
      <div className="container py-6 max-w-5xl animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => setSelectedGroupId(null)}
          className="mb-4 rounded-xl hover:bg-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
        <GroupDetailView group={selectedGroup} onClose={() => setSelectedGroupId(null)} />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Group Travel</h1>
          <p className="text-muted-foreground mt-1">Manage trip expenses and split costs equally</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No travel groups yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first travel group to start tracking expenses and splitting costs with friends
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card
              key={group.id.toString()}
              className="rounded-2xl hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => setSelectedGroupId(group.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {group.name}
                </CardTitle>
                <CardDescription>
                  {new Date(Number(group.createdAt) / 1000000).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">{group.members.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expenses:</span>
                    <span className="font-medium">{group.expenses.length}</span>
                  </div>
                  {group.isCalculated && (
                    <div className="flex items-center gap-1 text-success mt-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-medium">Balance Calculated</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateGroupDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
