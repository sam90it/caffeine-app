import { getCurrency } from '../lib/currencies';

interface CurrencyIconProps {
  currencyCode: string;
  className?: string;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg';
}

export default function CurrencyIcon({ 
  currencyCode, 
  className = '', 
  showLogo = false, // Changed default to false since we're removing logos
  logoSize = 'md' 
}: CurrencyIconProps) {
  const currency = getCurrency(currencyCode);
  
  // Always display only the currency symbol without flag/logo
  return (
    <span 
      className={`inline-flex items-center justify-center font-semibold ${className}`}
      title={`${currency.name} (${currency.code})`}
    >
      {currency.symbol}
    </span>
  );
}
