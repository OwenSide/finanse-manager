import React, { createContext, useState, useContext, useEffect } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [mainCurrency, setMainCurrency] = useState(() => {
    return localStorage.getItem("mainCurrency") || "PLN";
  });

  useEffect(() => {
    localStorage.setItem("mainCurrency", mainCurrency);
  }, [mainCurrency]);

  return (
    <PreferencesContext.Provider value={{ mainCurrency, setMainCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}