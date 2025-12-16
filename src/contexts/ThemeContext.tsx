import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryDark: string;
    error: string;
    placeholder: string;
  };
}

const lightColors = {
  background: '#ffffff',
  surface: '#fafafa',
  text: '#1a1a1a',
  textSecondary: '#49454F',
  border: '#e0e0e0',
  primary: '#6750A4',
  primaryDark: '#7D5260',
  error: '#d32f2f',
  placeholder: '#f5f5f5',
};

const darkColors = {
  background: '#1e1e1e',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  primary: '#9d7dd8',
  primaryDark: '#b894c4',
  error: '#ef5350',
  placeholder: '#2a2a2a',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
