import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";

// Create a context so the whole app can access the identity
const IdentityContext = createContext<{
  identity: Identity | null;
  login: () => void;
  logout: () => void;
} | null>(null);

export const InternetIdentityProvider = ({ children }: { children: React.ReactNode }) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [client, setClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    AuthClient.create().then((c) => {
      setClient(c);
      if (c.isAuthenticated()) {
        setIdentity(c.getIdentity());
      }
    });
  }, []);

  const login = async () => {
    if (client) {
      await client.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => setIdentity(client.getIdentity()),
      });
    }
  };

  const logout = async () => {
    if (client) {
      await client.logout();
      setIdentity(null);
    }
  };

  return (
    <IdentityContext.Provider value={{ identity, login, logout }}>
      {children}
    </IdentityContext.Provider>
  );
};

// This is the hook your components will use
export const useInternetIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) throw new Error("useInternetIdentity must be used within an InternetIdentityProvider");
  return context;
};