import { useMobileAuth } from '../hooks/useMobileAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Plus, Plane, Users } from 'lucide-react';
import { useState } from 'react';
import CurrencySettingsDialog from './CurrencySettingsDialog';
import DashboardDrawer from './DashboardDrawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  hideSettled: boolean;
  onHideSettledChange: (value: boolean) => void;
  onCreatePerson: () => void;
  currentView: 'profiles' | 'people' | 'groupTravel';
  onViewChange: (view: 'profiles' | 'people' | 'groupTravel') => void;
}

export default function Header({ hideSettled, onHideSettledChange, onCreatePerson, currentView, onViewChange }: HeaderProps) {
  const { logout, isAuthenticated } = useMobileAuth();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    queryClient.clear();
  };

  const handleCreatePerson = () => {
    onCreatePerson();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Global Finance Ledger
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Collaborative peer-to-peer finance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-xl hover:bg-accent"
                  title="Currency Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="rounded-xl"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="border-t bg-white/95">
            <div className="container flex h-14 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="hide-settled"
                  checked={hideSettled}
                  onCheckedChange={onHideSettledChange}
                  className="data-[state=checked]:bg-primary"
                />
                <Label 
                  htmlFor="hide-settled" 
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Hide settled
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setDashboardOpen(true)}
                  className="rounded-xl hover:bg-accent transition-all hover:scale-105 font-medium text-sm"
                  title="Open Dashboard"
                >
                  Dashboard
                </Button>

                <Button
                  variant={currentView === 'people' ? 'default' : 'ghost'}
                  onClick={() => onViewChange('people')}
                  size="sm"
                  className="rounded-xl transition-all hover:scale-105"
                  title="People"
                >
                  <Users className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">People</span>
                </Button>

                <Button
                  variant={currentView === 'groupTravel' ? 'default' : 'ghost'}
                  onClick={() => onViewChange('groupTravel')}
                  size="sm"
                  className="rounded-xl transition-all hover:scale-105"
                  title="Group Travel"
                >
                  <Plane className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Travel</span>
                </Button>
              </div>

              <Button 
                onClick={handleCreatePerson}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleCreatePerson();
                }}
                size="sm"
                className="rounded-xl bg-gradient-to-r from-primary to-info hover:opacity-90 transition-opacity touch-manipulation active:scale-95 min-h-[40px]"
              >
                <Plus className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Add Person</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        )}
      </header>
      {isAuthenticated && (
        <>
          <CurrencySettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
          <DashboardDrawer open={dashboardOpen} onOpenChange={setDashboardOpen} />
        </>
      )}
    </>
  );
}
