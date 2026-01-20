import { useState, useEffect } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useMobileAuth } from '../hooks/useMobileAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CURRENCIES } from '../lib/currencies';
import { getCountryByCurrency } from './MobileLoginScreen';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [countryCode, setCountryCode] = useState('IN');
  const saveProfile = useSaveCallerUserProfile();
  const { session } = useMobileAuth();

  // Auto-detect country code based on currency selection
  useEffect(() => {
    const country = getCountryByCurrency(currency);
    if (country) {
      setCountryCode(country.code);
    }
  }, [currency]);

  // Initialize with session country code if available
  useEffect(() => {
    if (session?.countryCode) {
      setCountryCode(session.countryCode);
      // Try to match currency to country
      const country = getCountryByCurrency(currency);
      if (!country || country.code !== session.countryCode) {
        // Find currency for the session's country
        const sessionCountry = getCountryByCurrency(session.countryCode);
        if (sessionCountry?.currencyCode) {
          setCurrency(sessionCountry.currencyCode);
        }
      }
    }
  }, [session?.countryCode]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Auto-update country code based on currency
    const country = getCountryByCurrency(newCurrency);
    if (country) {
      setCountryCode(country.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(), 
        phone: session?.phoneNumber || '',
        countryCode: countryCode,
        currencyPreference: currency 
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome to Global Finance Ledger!</DialogTitle>
          <DialogDescription>Please set up your profile to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code} className="cursor-pointer min-h-[44px]">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{curr.symbol}</span>
                      <span>{curr.code} - {curr.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Country code will be auto-detected: {countryCode}
            </p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl h-11 touch-manipulation active:scale-95 transition-transform min-h-[48px]"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Creating...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
