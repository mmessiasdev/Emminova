import { DefaultTheme } from 'styled-components';

export interface Theme extends DefaultTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      primary: string;
      secondary: string;
      gradient: string;
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
      dark: string;
    };
    border: string;
    success: string;
    error: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  effects: {
    glow: string;
    shadow: string;
  };
}

/* ------------------------- THEME BASE (Emminova Style) ------------------------- */
const base = {
  typography: {
    fontFamily: {
      primary: 'Montserrat, sans-serif',
      secondary: 'Montserrat, sans-serif',
    },
    sizes: {
      h1: '3rem',
      h2: '2rem',
      h3: '1.25rem',
      body: '1rem',
      small: '0.875rem',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '48px',
    xxl: '80px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1200px',
  },
};

/* ------------------------- DEFAULT THEME (Emminova azul) ------------------------- */
export const defaultTheme: Theme = {
  ...base,
  colors: {
    primary: '#004cff',
    secondary: '#63a0ff',
    accent: '#0072ff',
    background: {
      primary: '#ffffff',
      secondary: '#f6f8ff',
      gradient: 'linear-gradient(180deg, #ffffff 0%, #f6f8ff 100%)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      light: '#94a3b8',
      dark: '#0f172a',
    },
    border: '#e2e8f0',
    success: '#22c55e',
    error: '#ef4444',
  },
  effects: {
    glow: '0 0 20px rgba(0,76,255,0.3)',
    shadow: '0 8px 20px rgba(0,0,0,0.08)',
  },
};

/* ------------------------- LIGHT THEME (variante clara minimalista) ------------------------- */
export const lightTheme: Theme = {
  ...base,
  colors: {
    primary: '#000000ff',
    secondary: '#2b2b2bff',
    accent: '#4c4b4bff',
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      gradient: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      light: '#94a3b8',
      dark: '#0f172a',
    },
    border: '#e2e8f0',
    success: '#22c55e',
    error: '#ef4444',
  },
  effects: {
    glow: '0 0 20px rgba(37,99,235,0.3)',
    shadow: '0 8px 20px rgba(0,0,0,0.05)',
  },
};

/* ------------------------- DARK THEME (variante profissional escura) ------------------------- */
export const darkTheme: Theme = {
  ...base,
  colors: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    accent: '#1d4ed8',
    background: {
      primary: '#0a0a0a',
      secondary: '#111827',
      gradient: 'linear-gradient(180deg, #0a0a0a 0%, #111827 100%)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      light: '#94a3b8',
      dark: '#0f172a',
    },
    border: '#1e293b',
    success: '#16a34a',
    error: '#ef4444',
  },
  effects: {
    glow: '0 0 25px rgba(96,165,250,0.3)',
    shadow: '0 8px 25px rgba(0,0,0,0.4)',
  },
};
