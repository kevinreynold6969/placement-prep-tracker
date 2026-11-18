import React, { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('placement-prep-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  } catch {
    // Continue with the light palette when storage is unavailable.
  }
  return 'light';
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('placement-prep-theme', theme);
    } catch {
      // The current page still uses the selected theme without persistent storage.
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
