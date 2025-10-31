import styled from 'styled-components';
import { Theme } from './theme';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: 0 ${props => props.theme.spacing.sm};
  }
`;

export const Flex = styled.div<{
  direction?: string;
  justify?: string;
  align?: string;
  gap?: string;
  wrap?: string;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || props.theme.spacing.md};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

export const Grid = styled.div<{
  columns?: string;
  gap?: string;
  align?: string;
}>`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: ${props => props.gap || props.theme.spacing.lg};
  align-items: ${props => props.align || 'stretch'};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

export const Card = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 20px;
  padding: ${props => props.theme.spacing.lg};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme.effects.shadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.effects.glow};
  }
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}>`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${props.theme.spacing.xs} ${props.theme.spacing.sm}`;
      case 'lg': return `${props.theme.spacing.md} ${props.theme.spacing.lg}`;
      default: return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
    }
  }};
  
  border-radius: 12px;
  font-weight: 600;
  font-size: ${props => props.theme.typography.sizes.body};
  transition: all 0.3s ease;

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.accent};
            transform: translateY(-2px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 2px solid ${props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primary};
            color: white;
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.secondary};
            transform: translateY(-2px);
            box-shadow: ${props.theme.effects.glow};
          }
        `;
    }
  }}
`;

export const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.primary};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.sizes.body};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;