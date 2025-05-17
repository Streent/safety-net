'use client';
import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { ThemeContext } from '@/contexts/theme-context';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = window.localStorage.getItem(storageKey) as 'light' | 'dark' | null;
        if (storedTheme) {
          return storedTheme;
        }
      } catch (e) {
        console.error('Failed to read theme from localStorage', e);
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    try {
      window.localStorage.setItem(storageKey, newTheme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
    setThemeState(newTheme);
  }, [storageKey]);
  
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
