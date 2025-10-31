import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { useCourseData } from './hooks/useCourseData';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Steps from './components/Steps/Steps';
import Testimonials from './components/Testimonials/Testimonials';
import CTA from './components/CTA/cta';
import Projects from './components/Projects/Projects';
import Services from './components/Services/Services';
import { apiService } from './services/api';

function AppContent() {
  const { homeData, testimonials, steps, loading, error } = useCourseData();

  const [services, setServices] = useState([]);

  useEffect(() => {
    apiService.getServices().then(setServices);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Erro: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <Services services={services} />
      <Testimonials />
      <Projects />
      <Steps />
      <CTA />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}