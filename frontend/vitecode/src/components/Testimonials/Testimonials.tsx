import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Grid, Card } from '../../styles/styledComponents';
import { apiService, Testimonial } from '../../services/api';

const TestimonialsSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  background: ${props => props.theme.colors.background.secondary};
  position: relative;
  overflow: hidden;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.sizes.h2};
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TestimonialGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const TestimonialCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  border-radius: 20px;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.effects.shadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.effects.glow};
  }
`;

const Stars = styled.div`
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Comment = styled.p`
  font-style: italic;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  line-height: 1.6;
`;

const Author = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  strong {
    color: ${props => props.theme.colors.text.primary};
    font-weight: 600;
  }

  span {
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.sizes.small};
  }
`;

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    apiService.getTestimonials().then(setTestimonials).catch(err => {
      console.error('Erro ao carregar depoimentos:', err);
    });
  }, []);

  const renderStars = (rating: number) => {
    const max = 5;
    return '★'.repeat(rating) + '☆'.repeat(max - rating);
  };

  return (
    <TestimonialsSection id="depoimentos">
      <Container>
        <SectionTitle>O que nossos clientes dizem</SectionTitle>
        <TestimonialGrid>
          {testimonials.length > 0 ? (
            testimonials.map((item) => (
              <TestimonialCard key={item.id}>
                <Stars>{renderStars(item.rating)}</Stars>
                <Comment>"{item.comment}"</Comment>
                <Author>
                  <strong>{item.name}</strong>
                  <span>{item.company}</span>
                </Author>
              </TestimonialCard>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
              Nenhum depoimento encontrado.
            </p>
          )}
        </TestimonialGrid>
      </Container>
    </TestimonialsSection>
  );
}
