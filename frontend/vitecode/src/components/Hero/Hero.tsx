import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../Header/Header';
import { Container, Button } from '../../styles/styledComponents';
import { apiService, HomeData } from '../../services/api';

/* ---------- ANIMAÇÕES ---------- */
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.02); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 76, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 76, 255, 0.6); }
`;

/* ---------- STYLES ---------- */
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.background.primary} 0%,
    ${props => props.theme.colors.background.secondary} 50%,
    ${props => props.theme.colors.background.primary} 100%
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite;
  position: relative;
  overflow: hidden;
`;

const BackgroundElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 10%;
    right: 10%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      ${props => props.theme.colors.primary}20,
      ${props => props.theme.colors.secondary}20
    );
    filter: blur(60px);
    animation: ${floatAnimation} 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    left: 10%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      ${props => props.theme.colors.secondary}15,
      ${props => props.theme.colors.primary}15
    );
    filter: blur(40px);
    animation: ${floatAnimation} 8s ease-in-out infinite reverse;
  }
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  max-width: 1200px;
  width: 100%;
  z-index: 2;
  position: relative;
  margin-top: 80px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const TextContent = styled(motion.div)`
  animation: ${fadeInUp} 1s ease-out;

  @media (max-width: 968px) {
    order: 2;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary},
    ${props => props.theme.colors.secondary},
    ${props => props.theme.colors.primary}
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gradientShift} 6s ease infinite;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroDesc = styled.p`
  font-size: 1.3rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ExtraDesc = styled.p`
  color: ${props => props.theme.colors.primary};
  margin-top: 2.5rem;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  display: inline-block;


`;

const CTAButton = styled(Button)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary},
    ${props => props.theme.colors.secondary}
  );
  border: none;
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 76, 255, 0.4);
  }
`;

const ImageContainer = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 968px) {
    order: 1;
  }
`;

const OvalFrame = styled.div`
  position: relative;
  width: 500px;
  height: 300px;
  border-radius: 60%;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(20px);
  border: 2px solid transparent;

  /* Degradê radial principal nas bordas */
  background-image: 
    radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(255, 255, 255, 0.1) 50%,
      ${props => props.theme.colors.primary}15 60%,
      ${props => props.theme.colors.secondary}10 70%,
      transparent 80%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );

  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    background: radial-gradient(
      ellipse at center,
      ${props => props.theme.colors.primary}25 0%,
      ${props => props.theme.colors.secondary}20 15%,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 40%
    );
    z-index: -1;
    filter: blur(4px);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: inherit;
    background: radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(255, 255, 255, 0.05) 40%,
      transparent 60%
    );
    z-index: 1;
  }

  @media (max-width: 768px) {
    width: 400px;
    height: 240px;
  }

  @media (max-width: 480px) {
    width: 320px;
    height: 200px;
  }
`;

const WallpaperImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
  transition: transform 0.5s ease;
  

  &:hover {
    transform: scale(1.05);
  }
`;

const FloatingBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary},
    ${props => props.theme.colors.secondary}
  );
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 8px 25px rgba(0, 76, 255, 0.3);
  animation: ${floatAnimation} 3s ease-in-out infinite;
  z-index: 3;
`;

const LoadingSkeleton = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const SkeletonText = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 80px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: ${gradientShift} 1.5s infinite;
  }

  &:nth-child(2) {
    height: 40px;
    width: 70%;
  }

  &:nth-child(3) {
    height: 30px;
    width: 50%;
  }
`;

const SkeletonImage = styled.div`
  width: 400px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: ${gradientShift} 1.5s infinite;
  }

  @media (max-width: 768px) {
    width: 300px;
    height: 380px;
  }
`;

export default function Hero() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await apiService.getHomeData();
        if (data && data.length > 0) {
          setHomeData(data[0]); // Pega o primeiro item do array
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getWallpaperUrl = () => {
    if (!homeData?.wallpaper?.[0]) return '';

    const wallpaper = homeData.wallpaper[0];
    return wallpaper.formats?.large?.url ||
      wallpaper.formats?.medium?.url ||
      wallpaper.formats?.small?.url ||
      wallpaper.url;
  };

  if (loading) {
    return (
      <>
        <Header />
        <HeroSection>
          <Container>
            <LoadingSkeleton>
              <div>
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </div>
              <SkeletonImage />
            </LoadingSkeleton>
          </Container>
        </HeroSection>
      </>
    );
  }

  return (
    <>
      <Header />

      <HeroSection>
        <BackgroundElements />

        <Container>
          <HeroContent>
            <TextContent
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HeroTitle>
                {homeData?.title || 'Construindo soluções e criando experiências'}
              </HeroTitle>

              <HeroDesc>
                {homeData?.desc || 'Conteúdo dinâmico vindo da API.'}

              </HeroDesc>



              <CTAButton variant="primary" size="lg">
                Entrar em contato
              </CTAButton>
              <div>
                {homeData?.extradesc && (
                  <ExtraDesc>
                    {homeData.extradesc}
                  </ExtraDesc>
                )}
              </div>

            </TextContent>



            <ImageContainer
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <OvalFrame>
                {getWallpaperUrl() && (
                  <>
                    <WallpaperImage
                      src={getWallpaperUrl()}
                      alt={homeData?.title || 'Hero Image'}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />

                  </>
                )}
              </OvalFrame>
              <FloatingBadge>
                Bem vindo ao Futuro!
              </FloatingBadge>
            </ImageContainer>
          </HeroContent>
        </Container>
      </HeroSection>
    </>
  );
}