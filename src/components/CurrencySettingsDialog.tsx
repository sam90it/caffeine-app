import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CURRENCIES } from '../lib/currencies';
import { getCountryByCurrency } from './MobileLoginScreen';

interface CurrencySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CurrencySettingsDialog({ open, onOpenChange }: CurrencySettingsDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setPhone(userProfile.phone);
      setCountryCode(userProfile.countryCode);
      setCurrency(userProfile.currencyPreference);
    }
  }, [userProfile]);

  // Auto-detect country code based on currency selection
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

    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        countryCode: countryCode,
        currencyPreference: currency,
      });
      toast.success('Settings saved successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Update your profile and preferences</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input
              id="settings-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-phone">Phone Number</Label>
            <Input
              id="settings-phone"
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-currency">Preferred Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="settings-currency" className="rounded-xl h-11 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl max-h-72">
                {CURRENCIES.map((curr) => (
                  <SelectItem 
                    key={curr.code} 
                    value={curr.code}
                    className="cursor-pointer hover:bg-accent min-h-[44px] touch-manipulation"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{curr.symbol}</span>
                      <span>{curr.code} - {curr.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Country code: {countryCode}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl h-11 touch-manipulation active:scale-95 transition-transform min-h-[48px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl h-11 touch-manipulation active:scale-95 transition-transform min-h-[48px]"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
