import React from 'react';
import styled from 'styled-components';
import { Container, Grid, Card } from '../../styles/styledComponents';
import { Service } from '../../services/api';

const ServicesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  background: ${props => props.theme.colors.background.primary};
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

const ServiceCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  transition: all 0.3s ease;
  border-radius: 20px;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.effects.shadow};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.effects.glow};
  }
`;

const ServiceImage = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto ${props => props.theme.spacing.md};
  border-radius: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
  }
`;

const ServiceTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.h3};
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const ServiceDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  font-size: ${props => props.theme.typography.sizes.body};
`;

interface ServicesProps {
  services: Service[];
}

export default function Services({ services }: ServicesProps) {
  return (
    <ServicesSection id="servicos">
      <Container>
        <SectionTitle>Nossos Serviços</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(300px, 1fr))" gap="2rem">
          {services.map(service => {
            const imageUrl =
              service.thumb?.[0]?.formats?.medium?.url ||
              service.thumb?.[0]?.formats?.small?.url ||
              service.thumb?.[0]?.url;

            return (
              <ServiceCard key={service.id}>
                {imageUrl && (
                  <ServiceImage>
                    <img src={imageUrl} alt={service.title} />
                  </ServiceImage>
                )}
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceCard>
            );
          })}
        </Grid>
      </Container>
    </ServicesSection>
  );
}
