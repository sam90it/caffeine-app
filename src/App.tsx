import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useMobileAuth } from './hooks/useMobileAuth';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header'; // Ensure this handles 'ledger' | 'assets' | 'audit'
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import LedgerPage from './pages/LedgerPage'; // Renamed from ProfilesPage
import AssetsPage from './pages/AssetsPage';  // Renamed from PeoplePage
import AuditLogPage from './pages/AuditLogPage'; // Renamed from GroupTravelPage
import MobileLoginScreen from './components/MobileLoginScreen';
import CreateEntryDialog from './components/CreateEntryDialog'; // Renamed for Ledger context
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ViewType updated for Global Finance Ledger
type ViewType = 'ledger' | 'assets' | 'audit';

function AppContent() {
  const { isAuthenticated, isInitializing } = useMobileAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [hideSettled, setHideSettled] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('ledger');

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium tracking-tight">Authenticating with Ledger...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <MobileLoginScreen />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header 
        hideSettled={hideSettled}
        onHideSettledChange={setHideSettled}
        onCreateEntry={() => setCreateDialogOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Ledger logic replaces profiles */}
        {currentView === 'ledger' && (
          <LedgerPage 
            hideSettled={hideSettled}
            onCreateEntry={() => setCreateDialogOpen(true)}
          />
        )}
        
        {/* Asset management replaces people */}
        {currentView === 'assets' && <AssetsPage />}
        
        {/* Audit logging replaces group travel */}
        {currentView === 'audit' && <AuditLogPage />}
      </main>

      <Footer />
      
      {showProfileSetup && <ProfileSetupModal />}
      
      <CreateEntryDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}