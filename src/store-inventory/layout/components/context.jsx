import { createContext, useContext, useState } from 'react';
/* eslint-disable react-refresh/only-export-components */

const LayoutContext = createContext(undefined);

export function LayoutProvider({ children }) {
  const [sidebarCollapse, setSidebarCollapse] = useState(false);
  const [sidebarTheme, setSidebarTheme] = useState('light');

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapse,
        setSidebarCollapse,
        sidebarTheme,
        setSidebarTheme,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook for consuming the context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
