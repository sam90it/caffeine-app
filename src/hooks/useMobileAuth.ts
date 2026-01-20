import { useState, useEffect } from 'react';

interface AuthSession {
  phoneNumber: string;
  countryCode: string;
  timestamp: number;
}

const SESSION_KEY = 'mobile_auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useMobileAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const parsed: AuthSession = JSON.parse(storedSession);
        const isExpired = Date.now() - parsed.timestamp > SESSION_DURATION;
        
        if (!isExpired) {
          setSession(parsed);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (error) {
        console.error('Failed to parse session:', error);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsInitializing(false);
  }, []);

  const login = (phoneNumber: string, countryCode: string) => {
    const newSession: AuthSession = {
      phoneNumber,
      countryCode,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isInitializing,
    session,
    login,
    logout,
  };
}
