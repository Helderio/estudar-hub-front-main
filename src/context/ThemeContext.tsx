import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('estudar-hub-theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('estudar-hub-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
