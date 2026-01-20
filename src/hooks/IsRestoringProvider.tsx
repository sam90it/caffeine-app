import * as React from 'react';

export const IsRestoringContext = React.createContext<boolean>(false);

export const IsRestoringProvider = ({ children, value }: { children: React.ReactNode; value: boolean }) => {
  return (
    <IsRestoringContext.Provider value={value}>
      {children}
    </IsRestoringContext.Provider>
  );
};

export const useIsRestoring = () => React.useContext(IsRestoringContext);
