import React, { createContext, useContext } from 'react';

interface SalesContextType {
  // Minimal context for compatibility
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

// Alias for compatibility
export const useSalesContext = useSales;

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const value: SalesContextType = {
    // Minimal implementation
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}
