import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Grid, Card } from '../../styles/styledComponents';
import { apiService, Step } from '../../services/api';

const StepsSection = styled.section`
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

const StepsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const StepCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  border-radius: 20px;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.effects.shadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${props => props.theme.effects.glow};
  }
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto ${props => props.theme.spacing.md};
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: ${props => props.theme.effects.glow};
`;

const StepTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.h3};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StepDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

export default function Steps() {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    apiService.getSteps().then(setSteps).catch(err => {
      console.error('Erro ao carregar etapas:', err);
    });
  }, []);

  // Ordenar os steps pelo número (caso a API não envie ordenado)
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <StepsSection id="etapas">
      <Container>
        <SectionTitle>Passo a Passo do Desenvolvimento</SectionTitle>
        <StepsGrid>
          {sortedSteps.length > 0 ? (
            sortedSteps.map((step) => (
              <StepCard key={step.id}>
                <StepNumber>{step.step_number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepCard>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
              Nenhuma etapa encontrada.
            </p>
          )}
        </StepsGrid>
      </Container>
    </StepsSection>
  );
}
