import { ReactNode, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@landing/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { branding } from '@/values/config/branding';

// Landing Pages
import Index from '@landing/pages/Index';
import PricingPage from '@landing/pages/PricingPage';
import ContactPage from '@landing/pages/ContactPage';
// import DemoContactPage from '@landing/pages/DemoContactPage';
import PublicHelpCenter from '@landing/pages/PublicHelpCenter';
import DemoContactPage from './system/landing/pages/DemoContactPage';




const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const hexToHslToken = (hex: string): string => {
  const normalized = hex.replace('#', '').trim();
  const shortHex = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  const r = parseInt(shortHex.substring(0, 2), 16) / 255;
  const g = parseInt(shortHex.substring(2, 4), 16) / 255;
  const b = parseInt(shortHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};


const toCssHslToken = (value: string): string => {
  const normalized = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return hexToHslToken(normalized);
  }
  if (/^hsl\(/i.test(normalized)) {
    return normalized.replace(/^hsl\(\s*/i, '').replace(/\)\s*$/i, '').trim();
  }
  return normalized;
};


function BrandingCssVariables() {
  useEffect(() => {
    const root = document.documentElement;
    const gradientPalette = branding.colors.gradients;

    const applyThemeVariables = () => {
      const activePalette = root.classList.contains('dark')
        ? branding.colors.dark
        : branding.colors.light;

      Object.entries(activePalette).forEach(([token, value]) => {
        root.style.setProperty(`--${token}`, toCssHslToken(value));
      });

      if (gradientPalette?.primary) {
        root.style.setProperty('--gradient-primary', gradientPalette.primary);
      }

      if (gradientPalette?.glow) {
        root.style.setProperty('--shadow-glow', gradientPalette.glow);
      }
    };

    applyThemeVariables();

    const observer = new MutationObserver(applyThemeVariables);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return null;
}






function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme={branding.defaultTheme} enableSystem={false}>
        {/* <AuthProvider> */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <BrandingCssVariables />

          <ScrollToTop />
          <Routes>
            {/* Landing/Public Routes */}
            <Route path="/" element={<Index />} />
            {/* <Route path="/pricing" element={<PricingPage />} /> */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact/demo" element={<DemoContactPage />} />
            <Route path="/contato" element={<Navigate to="/contact" replace />} />
            <Route path="/contato/demo" element={<Navigate to="/contact/demo" replace />} />
            <Route path="/help" element={<PublicHelpCenter />} />
            {/* <Route path="/docs/:id" element={<PublicProjectPage />} /> */}

          
            <Route path="/auth" element={<Navigate to="/login" replace />} />

         

            <Route path="*" element={<Index />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
        {/* </AuthProvider> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;