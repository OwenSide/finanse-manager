import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем сам контекст
const PreferencesContext = createContext();

// Провайдер — это обертка, которая будет хранить настройки и раздавать их
export function PreferencesProvider({ children }) {
  // Инициализируем стейт сразу из localStorage
  const [mainCurrency, setMainCurrency] = useState(() => {
    return localStorage.getItem("mainCurrency") || "PLN";
  });

  // Эффект: каждый раз, когда mainCurrency меняется, автоматически сохраняем в память
  useEffect(() => {
    localStorage.setItem("mainCurrency", mainCurrency);
  }, [mainCurrency]);

  return (
    <PreferencesContext.Provider value={{ mainCurrency, setMainCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Удобный хук, чтобы не импортировать useContext каждый раз
export function usePreferences() {
  return useContext(PreferencesContext);
}