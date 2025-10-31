import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Container, Button } from '../../styles/styledComponents';
import { apiService, HomeData } from '../../services/api';

/* ---------- ANIMAÇÕES ---------- */
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

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ---------- STYLES ---------- */
const CTASection = styled.section`
  padding: ${props => props.theme.spacing.xxl} 0;
  position: relative;
  overflow: hidden;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const BackgroundImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      ${props => props.theme.colors.background.primary}30 0%,
      ${props => props.theme.colors.primary}20 50%,
      ${props => props.theme.colors.secondary}15 100%
    );
    backdrop-filter: blur(5px);
  }
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.background.primary}80 0%,
    ${props => props.theme.colors.background.primary}60 50%,
    ${props => props.theme.colors.background.primary}80 100%
  );
  z-index: 2;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  max-width: 800px;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const Title = styled(motion.h2)`
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: ${props => props.theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.text.primary},
    ${props => props.theme.colors.text.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.3rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  opacity: 0.9;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.1rem;
  }
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
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  animation: ${floatAnimation} 3s ease-in-out infinite;

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
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 76, 255, 0.4);
    animation: none;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      ${props => props.theme.colors.primary}15,
      ${props => props.theme.colors.secondary}15
    );
    filter: blur(40px);
    animation: ${floatAnimation} 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 20%;
    left: 10%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      ${props => props.theme.colors.secondary}10,
      ${props => props.theme.colors.primary}10
    );
    filter: blur(30px);
    animation: ${floatAnimation} 8s ease-in-out infinite reverse;
  }
`;

const LoadingSkeleton = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const SkeletonTitle = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: 60px;
  margin-bottom: 1.5rem;
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
`;

const SkeletonButton = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  height: 50px;
  width: 200px;
  margin: 2rem auto 0;
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
`;

export default function CTA() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await apiService.getHomeData();
        if (data && data.length > 0) {
          setHomeData(data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Pega a segunda imagem do wallpaper (índice 1) ou a primeira se não tiver segunda
  const getSecondWallpaperUrl = () => {
    if (!homeData?.wallpaper || homeData.wallpaper.length < 2) {
      // Se não tiver segunda imagem, retorna a primeira ou string vazia
      return homeData?.wallpaper?.[0]?.url || '';
    }
    
    const secondWallpaper = homeData.wallpaper[1];
    return secondWallpaper.formats?.large?.url || 
           secondWallpaper.formats?.medium?.url || 
           secondWallpaper.formats?.small?.url || 
           secondWallpaper.url;
  };

  const wallpaperUrl = getSecondWallpaperUrl();

  if (loading) {
    return (
      <CTASection id="contato">
        <BackgroundOverlay />
        <ContentWrapper>
          <LoadingSkeleton>
            <SkeletonTitle />
            <SkeletonButton />
          </LoadingSkeleton>
        </ContentWrapper>
      </CTASection>
    );
  }

  return (
    <CTASection id="contato">
      <BackgroundWrapper>
        {wallpaperUrl && (
          <BackgroundImage
            imageUrl={wallpaperUrl}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        )}
        <FloatingElements />
      </BackgroundWrapper>
      
      <BackgroundOverlay />
      
      <ContentWrapper>
        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {homeData?.title || 'Escolha uma equipe de desenvolvedores que gera resultados'}
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {homeData?.desc || 'Trabalhamos com as mais modernas tecnologias para entregar soluções que realmente fazem a diferença para o seu negócio.'}
        </Subtitle>
        
        <CTAButton
          variant="primary"
          size="lg"
          as={motion.button}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Entrar em contato
        </CTAButton>
      </ContentWrapper>
    </CTASection>
  );
}