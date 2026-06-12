import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.style.setProperty('--surface-0', '#f8fafc');
      root.style.setProperty('--surface-1', '#f1f5f9');
      root.style.setProperty('--surface-2', '#ffffff');
      root.style.setProperty('--surface-3', '#f1f5f9');
      root.style.setProperty('--surface-4', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border', 'rgba(0,0,0,0.08)');
      root.style.setProperty('--border-bright', 'rgba(0,0,0,0.14)');
      document.body.style.background = '#f8fafc';
    } else {
      root.style.setProperty('--surface-0', '#0a0a0f');
      root.style.setProperty('--surface-1', '#0f1117');
      root.style.setProperty('--surface-2', '#161821');
      root.style.setProperty('--surface-3', '#1e2130');
      root.style.setProperty('--surface-4', '#252840');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--text-muted', '#475569');
      root.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      root.style.setProperty('--border-bright', 'rgba(255,255,255,0.12)');
      document.body.style.background = '#0a0a0f';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
