import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, Flex, Button } from "../../styles/styledComponents";
import { useTheme } from '../../styles/ThemeProvider';
import { APP_CONFIG } from '../../config/app';
import { IMAGES } from '../../config/images';

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background.primary}80;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.theme.colors.border};
  z-index: 1000;
  padding: ${props => props.theme.spacing.sm} 0;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
`;

const LogoImage = styled.img<{ width: number; height: number }>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoText = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.secondary};
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.primary};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const ThemeSwitcher = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  margin-left: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    justify-content: center;
  }
`;

const ThemeButton = styled.button<{ active: boolean; color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  background: ${props => {
    switch (props.color) {
      case 'default': return '#6366f1';
      case 'light': return '#ffffff';
      case 'dark': return '#000000';
      default: return '#6366f1';
    }
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// Novos componentes para o menu mobile
const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
  }

  span {
    width: 24px;
    height: 2px;
    background: ${props => props.theme.colors.text.primary};
    margin: 2px 0;
    transition: all 0.3s ease;
    transform-origin: center;

    &:nth-child(1) {
      transform: ${props => props.open ? 'rotate(45deg) translate(6px, 6px)' : 'none'};
    }

    &:nth-child(2) {
      opacity: ${props => props.open ? '0' : '1'};
    }

    &:nth-child(3) {
      transform: ${props => props.open ? 'rotate(-45deg) translate(6px, -6px)' : 'none'};
    }
  }
`;

const MobileMenu = styled.div<{ open: boolean }>`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background.primary};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: ${props => props.open ? 'translateY(0)' : 'translateY(-10px)'};
  opacity: ${props => props.open ? '1' : '0'};
  visibility: ${props => props.open ? 'visible' : 'hidden'};
  transition: all 0.3s ease;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.lg};
  }
`;

const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MobileNavLink = styled.a`
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  font-size: 1.1rem;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.primary};
    border-bottom-color: ${props => props.theme.colors.primary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MobileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export default function Header() {
  const { theme, switchToDefault, switchToLight, switchToDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDefaultTheme = theme.colors.primary === '#6366f1';
  const isLightTheme = theme.colors.background.primary === '#ffffff';
  const isDarkTheme = theme.colors.background.primary === '#0a0a0a';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <HeaderWrapper>
      <Container>
        <Flex justify="space-between" align="center">
          <LogoContainer as="a" href="#">
            {APP_CONFIG.logo.show && (
              <LogoImage
                src={IMAGES.logo}
                alt={`Logo ${APP_CONFIG.name}`}
                width={APP_CONFIG.logo.width}
                height={APP_CONFIG.logo.height}
              />
            )}
            <LogoText>{APP_CONFIG.name}</LogoText>
          </LogoContainer>

          <Flex align="center">
            <Nav>
              <NavLink href="#projetos">Projetos</NavLink>
              <NavLink href="#depoimentos">Depoimentos</NavLink>
              <NavLink href="#servicos">Serviços</NavLink>
            </Nav>

            <ThemeSwitcher>
              <ThemeButton
                color="default"
                active={isDefaultTheme}
                onClick={switchToDefault}
                title="Tema Padrão"
              />
              <ThemeButton
                color="light"
                active={isLightTheme}
                onClick={switchToLight}
                title="Tema Claro"
              />
              <ThemeButton
                color="dark"
                active={isDarkTheme}
                onClick={switchToDark}
                title="Tema Escuro"
              />
            </ThemeSwitcher>

       

            {/* Botão do menu mobile */}
            <MobileMenuButton 
              open={mobileMenuOpen} 
              onClick={toggleMobileMenu}
              aria-label="Menu mobile"
            >
              <span></span>
              <span></span>
              <span></span>
            </MobileMenuButton>
          </Flex>
        </Flex>

        {/* Menu suspenso mobile */}
        <MobileMenu open={mobileMenuOpen}>
          <MobileNav>
            <MobileNavLink href="#projetos" onClick={closeMobileMenu}>
              Projetos
            </MobileNavLink>
            <MobileNavLink href="#depoimentos" onClick={closeMobileMenu}>
              Depoimentos
            </MobileNavLink>
            <MobileNavLink href="#servicos" onClick={closeMobileMenu}>
              Serviços
            </MobileNavLink>
          </MobileNav>

          <MobileActions>
            <ThemeSwitcher>
              <ThemeButton
                color="default"
                active={isDefaultTheme}
                onClick={() => {
                  switchToDefault();
                  closeMobileMenu();
                }}
                title="Tema Padrão"
              />
              <ThemeButton
                color="light"
                active={isLightTheme}
                onClick={() => {
                  switchToLight();
                  closeMobileMenu();
                }}
                title="Tema Claro"
              />
              <ThemeButton
                color="dark"
                active={isDarkTheme}
                onClick={() => {
                  switchToDark();
                  closeMobileMenu();
                }}
                title="Tema Escuro"
              />
            </ThemeSwitcher>

            <Button 
              variant="primary" 
              size="sm" 
              onClick={closeMobileMenu}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Entrar em contato
            </Button>
          </MobileActions>
        </MobileMenu>
      </Container>
    </HeaderWrapper>
  );
}