import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Theme, defaultTheme, lightTheme, darkTheme } from './theme';
import { GlobalStyles } from './GlobalStyles';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  switchToLight: () => void;
  switchToDark: () => void;
  switchToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  const switchToLight = () => setCurrentTheme(lightTheme);
  const switchToDark = () => setCurrentTheme(darkTheme);
  const switchToDefault = () => setCurrentTheme(defaultTheme);

  const value: ThemeContextType = {
    theme: currentTheme,
    setTheme: setCurrentTheme,
    switchToLight,
    switchToDark,
    switchToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyles />
        {children}
      </StyledThemeProvider>
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