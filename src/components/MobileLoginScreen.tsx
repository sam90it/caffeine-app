import { useState, useEffect } from 'react';
import { useMobileAuth } from '../hooks/useMobileAuth';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, ChevronDown, Loader2, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Country {
  name: string;
  code: string;
  dialCode: string;
  currencyCode?: string;
}

// Comprehensive list of countries with E.164 format support and currency mapping
const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US', dialCode: '+1', currencyCode: 'USD' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', currencyCode: 'GBP' },
  { name: 'India', code: 'IN', dialCode: '+91', currencyCode: 'INR' },
  { name: 'Canada', code: 'CA', dialCode: '+1', currencyCode: 'CAD' },
  { name: 'Australia', code: 'AU', dialCode: '+61', currencyCode: 'AUD' },
  { name: 'Germany', code: 'DE', dialCode: '+49', currencyCode: 'EUR' },
  { name: 'France', code: 'FR', dialCode: '+33', currencyCode: 'EUR' },
  { name: 'Japan', code: 'JP', dialCode: '+81', currencyCode: 'JPY' },
  { name: 'China', code: 'CN', dialCode: '+86', currencyCode: 'CNY' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', currencyCode: 'BRL' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', currencyCode: 'MXN' },
  { name: 'Spain', code: 'ES', dialCode: '+34', currencyCode: 'EUR' },
  { name: 'Italy', code: 'IT', dialCode: '+39', currencyCode: 'EUR' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', currencyCode: 'KRW' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', currencyCode: 'EUR' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', currencyCode: 'CHF' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', currencyCode: 'SEK' },
  { name: 'Norway', code: 'NO', dialCode: '+47', currencyCode: 'NOK' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', currencyCode: 'DKK' },
  { name: 'Finland', code: 'FI', dialCode: '+358', currencyCode: 'EUR' },
  { name: 'Poland', code: 'PL', dialCode: '+48', currencyCode: 'PLN' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', currencyCode: 'EUR' },
  { name: 'Austria', code: 'AT', dialCode: '+43', currencyCode: 'EUR' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', currencyCode: 'SGD' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', currencyCode: 'NZD' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', currencyCode: 'ZAR' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', currencyCode: 'AED' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', currencyCode: 'SAR' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', currencyCode: 'TRY' },
  { name: 'Russia', code: 'RU', dialCode: '+7', currencyCode: 'RUB' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', currencyCode: 'IDR' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', currencyCode: 'MYR' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', currencyCode: 'THB' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', currencyCode: 'PHP' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', currencyCode: 'VND' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', currencyCode: 'ARS' },
  { name: 'Chile', code: 'CL', dialCode: '+56', currencyCode: 'CLP' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', currencyCode: 'COP' },
  { name: 'Peru', code: 'PE', dialCode: '+51', currencyCode: 'PEN' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', currencyCode: 'EGP' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', currencyCode: 'NGN' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', currencyCode: 'KES' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', currencyCode: 'PKR' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', currencyCode: 'BDT' },
  { name: 'Israel', code: 'IL', dialCode: '+972', currencyCode: 'ILS' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', currencyCode: 'EUR' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', currencyCode: 'EUR' },
  { name: 'Greece', code: 'GR', dialCode: '+30', currencyCode: 'EUR' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', currencyCode: 'CZK' },
  { name: 'Romania', code: 'RO', dialCode: '+40', currencyCode: 'RON' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', currencyCode: 'HUF' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', currencyCode: 'HKD' },
];

// Helper function to get country by currency code
export function getCountryByCurrency(currencyCode: string): Country | undefined {
  return COUNTRIES.find(country => country.currencyCode === currencyCode);
}

export default function MobileLoginScreen() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[2]); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { login } = useMobileAuth();

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // E.164 validation: phone number should be 6-15 digits
  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 6 && cleaned.length <= 15;
  };

  const isValidInput = selectedCountry && phoneNumber && validatePhoneNumber(phoneNumber);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setPopoverOpen(false);
  };

  const handleLogin = async () => {
    if (!isValidInput) {
      toast.error('Please enter a valid phone number (6-15 digits)');
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      
      // Call login which saves to localStorage and updates state
      login(fullPhoneNumber, selectedCountry.code);
      
      toast.success('Login successful!');
      
      // The useMobileAuth hook will trigger re-render with isAuthenticated = true
      // No need to manually navigate - App.tsx will handle the routing
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-center">
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info shadow-lg mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Enter your mobile number to continue
            </p>
          </div>

          <div className="bg-card border rounded-2xl shadow-card p-6 animate-slide-up">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Mobile Number</Label>
                <div className="flex gap-2">
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        aria-label="Select country code"
                        className="w-32 justify-between rounded-xl h-12 touch-manipulation active:scale-95 transition-transform min-h-[48px]"
                        disabled={isLoading}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-0 rounded-xl bg-white border shadow-lg z-[200]" 
                      align="start"
                      sideOffset={4}
                    >
                      <div className="p-3 border-b bg-white sticky top-0 z-10">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                          <Input
                            placeholder="Search countries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-lg bg-white border-border"
                            autoComplete="off"
                            aria-label="Search countries"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-72 bg-white">
                        <div className="p-2" role="listbox" aria-label="Country list">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                role="option"
                                aria-selected={selectedCountry.code === country.code}
                                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-accent transition-colors cursor-pointer touch-manipulation active:bg-accent/80 min-h-[56px]"
                              >
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="font-medium text-sm text-foreground truncate">
                                    {country.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {country.dialCode}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                              No countries found
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 rounded-xl h-12"
                    disabled={isLoading}
                    aria-label="Phone number"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isValidInput && !isLoading) {
                        handleLogin();
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter 6-15 digits in E.164 format
                </p>
              </div>

              <Button
                type="button"
                onClick={handleLogin}
                disabled={!isValidInput || isLoading}
                className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-info hover:opacity-90 transition-opacity touch-manipulation active:scale-95 min-h-[48px]"
                aria-label="Continue with login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Logging in...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
