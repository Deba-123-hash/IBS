import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage as setI18nLanguage } from '../i18n/index.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [language, setLanguageState] = useState(getLanguage());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleLangChange = () => setLanguageState(getLanguage());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('languageChange', handleLangChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('languageChange', handleLangChange);
    };
  }, []);

  const changeLanguage = (lang) => {
    setI18nLanguage(lang);
    setLanguageState(lang);
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        language,
        changeLanguage,
        sidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed(prev => !prev)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
