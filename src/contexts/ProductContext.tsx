import React, { createContext, useContext } from 'react';

interface ProductContextType {
  // Minimal context for compatibility
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Alias for compatibility
export const useProductContext = useProducts;

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const value: ProductContextType = {
    // Minimal implementation
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
