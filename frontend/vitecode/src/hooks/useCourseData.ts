import { useState, useEffect } from 'react';
import { apiService, HomeData, Service, Testimonial, Step } from '../services/api';

export const useCourseData = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeResponse, servicesResponse, testimonialsResponse, stepsResponse] = await Promise.all([
          apiService.getHomeData(),
          apiService.getServices(),
          apiService.getTestimonials(),
          apiService.getSteps()
        ]);

        setHomeData(homeResponse[0] || null);
        setServices(servicesResponse);
        setTestimonials(testimonialsResponse);
        setSteps(stepsResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { homeData, services, testimonials, steps, loading, error };
};