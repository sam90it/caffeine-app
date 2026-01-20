import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useGetSummaryDashboard, useGetPendingLedgerEntries, useGetAllPersonProfiles, type PersonId } from '../hooks/useQueries';
import SummaryCards from './SummaryCards';
import PendingTransactions from './PendingTransactions';
import ProfileList from './ProfileList';
import PortfolioAnalytics from './PortfolioAnalytics';
import ResetDashboardDialog from './ResetDashboardDialog';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface DashboardDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DashboardDrawer({ open, onOpenChange }: DashboardDrawerProps) {
  const { data: summary, isLoading: summaryLoading } = useGetSummaryDashboard();
  const { data: pendingEntries = [] } = useGetPendingLedgerEntries();
  const { data: profiles = [], isLoading: profilesLoading } = useGetAllPersonProfiles();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Default summary object to prevent .toString() crashes
  const safeSummary = summary || { totalLent: 0, totalRepaid: 0, totalOwed: 0, remainingDue: 0 };

  const handleSelectProfile = (personId: PersonId) => {
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
          <div className="p-6 pb-8">
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">Dashboard</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    View your financial summary, people, and analytics
                  </SheetDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setResetDialogOpen(true)}
                  className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                  title="Reset Dashboard"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="animate-fade-in">
                  <h3 className="text-base font-semibold mb-4 text-foreground">Summary</h3>
                  <SummaryCards summary={safeSummary} isLoading={summaryLoading} />
                </div>

                {pendingEntries && pendingEntries.length > 0 ? (
                  <div className="animate-slide-up">
                    <h3 className="text-base font-semibold mb-4 text-foreground">Action Required</h3>
                    <PendingTransactions />
                  </div>
                ) : (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm">No pending actions</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="people" className="space-y-6">
                <div className="animate-fade-in">
                  <h3 className="text-base font-semibold mb-4 text-foreground">Your People</h3>
                  <ProfileList
                    profiles={profiles}
                    isLoading={profilesLoading}
                    onSelectProfile={handleSelectProfile}
                  />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="animate-fade-in">
                  <h3 className="text-base font-semibold mb-4 text-foreground">Portfolio Analytics</h3>
                  <PortfolioAnalytics profiles={profiles} summary={safeSummary} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ResetDashboardDialog 
        open={resetDialogOpen} 
        onOpenChange={setResetDialogOpen}
      />
    </>
  );
}
