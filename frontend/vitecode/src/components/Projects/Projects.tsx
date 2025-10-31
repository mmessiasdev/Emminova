import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService, Project } from '../../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* ---------- ANIMAÇÕES ---------- */
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const modalSlideIn = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.8) translateY(50px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

/* ---------- STYLES ---------- */
const PortfolioWrapper = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background.primary};
  padding: 80px 5% 40px;
  position: relative;
`;

const BackgroundElements = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    right: 5%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: linear-gradient(45deg, 
      ${p => p.theme.colors.primary}20, 
      ${p => p.theme.colors.secondary}20
    );
    filter: blur(60px);
    animation: ${float} 8s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    left: 5%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(45deg, 
      ${p => p.theme.colors.secondary}15, 
      ${p => p.theme.colors.primary}15
    );
    filter: blur(40px);
    animation: ${float} 6s ease-in-out infinite reverse;
  }
`;

const Header = styled(motion.header)`
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 2;

  h1 {
    font-size: 4rem;
    font-weight: 800;
    background: linear-gradient(
      135deg,
      ${p => p.theme.colors.primary},
      ${p => p.theme.colors.secondary}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.3rem;
    color: ${p => p.theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const ProjectsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const ProjectCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: ${p => p.theme.colors.primary}40;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      ${p => p.theme.colors.primary}, 
      transparent
    );
    z-index: 1;
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 240px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    45deg,
    ${p => p.theme.colors.background.secondary},
    ${p => p.theme.colors.background.primary}
  );

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  ${ProjectCard}:hover & img {
    transform: scale(1.1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  }
`;

const ProjectContent = styled.div`
  padding: 28px;
  position: relative;
`;

const ProjectLogo = styled.div`
  position: absolute;
  top: -30px;
  right: 28px;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${p => p.theme.colors.background.primary};
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  
  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const ProjectTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.theme.colors.text.primary};
  margin-bottom: 12px;
  margin-right: 70px;
`;

const ProjectDescription = styled.p`
  color: ${p => p.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ProjectLink = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(
    135deg,
    ${p => p.theme.colors.primary},
    ${p => p.theme.colors.secondary}
  );
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 76, 255, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const DetailsButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: ${p => p.theme.colors.text.primary};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${p => p.theme.colors.primary};
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* ---------- MODAL STYLES ---------- */
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: ${p => p.theme.colors.background.primary};
  border-radius: 24px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: ${modalSlideIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
   grid-template-columns: 1fr;
    max-height: 80vh;
    overflow-y: auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    max-height: 80vh;
    overflow-y: auto;
  }
`;

const CarouselSection = styled.div`
  position: relative;
  background: transparent;

  .swiper {
    width: 100%;
    height: 100%;
    background: transparent;
    padding: 50px;

  }

  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    position: relative;
    
    /* Efeito de vidro no slide */
    &::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      z-index: 1;
    }
  }

  .swiper-slide img {
    object-fit: contain;
    max-height: 50vh;
    position: relative;
    z-index: 2;
    border-radius: 12px;

    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: ${p => p.theme.colors.primary};
    background: rgba(255, 255, 255, 0.1);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &::after {
      font-size: 1.2rem;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
  }

  .swiper-pagination {
    bottom: 0px !important;
  }

  .swiper-pagination-bullet {
    background: ${p => p.theme.colors.primary};
    opacity: 0.5;
    width: 10px;
    height: 10px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .swiper-pagination-bullet-active {
    background: ${p => p.theme.colors.primary};
    opacity: 1;
    transform: scale(1.2);
  }

  /* Efeito de vidro adicional no container principal */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    backdrop-filter: blur(10px);
    pointer-events: none;
    z-index: 0;
  }
`;

const InfoSection = styled.div`
  padding: 40px;
  overflow-y: auto;
  max-height: 80vh;

  @media (max-width: 968px) {
    max-height: none;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 30px;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${p => p.theme.colors.text.primary};
    margin-bottom: 1rem;
    background: linear-gradient(
      135deg,
      ${p => p.theme.colors.primary},
      ${p => p.theme.colors.secondary}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ModalDescription = styled.div`
  color: ${p => p.theme.colors.text.secondary};
  line-height: 1.7;
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const TechStack = styled.div`
  margin-bottom: 30px;

  h3 {
    color: ${p => p.theme.colors.text.primary};
    margin-bottom: 15px;
    font-size: 1.2rem;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const TechTag = styled.span`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: ${p => p.theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 500;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const LoadingSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SkeletonCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  height: 400px;
  position: relative;

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
    animation: ${shimmer} 1.5s infinite;
  }
`;

const FilterBar = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 50px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
`;

const FilterButton = styled(motion.button)`
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${p => p.active ?
    `linear-gradient(135deg, ${p.theme.colors.primary}20, ${p.theme.colors.secondary}20)` :
    'rgba(255, 255, 255, 0.05)'
  };
  color: ${p => p.active ? p.theme.colors.primary : p.theme.colors.text.secondary};
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: ${p => p.theme.colors.primary}40;
    transform: translateY(-2px);
  }
`;

// Fallback component para quando não há imagens
const NoImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${p => p.theme.colors.primary}20,
    ${p => p.theme.colors.secondary}20
  );
  color: ${p => p.theme.colors.text.secondary};
  font-size: 1.2rem;
`;

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    apiService.getProjects()
      .then(data => {
        setProjects(data);
        setFilteredProjects(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filters = ['Todos', 'Web'];

  const filterProjects = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.category?.toLowerCase().includes(filter)
      );
      setFilteredProjects(filtered);
    }
  };

  const openModal = (project: Project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  // Função auxiliar para obter imagens do projeto
  const getProjectImages = (project: Project) => {
    if (!project.image || project.image.length === 0) return [];

    return project.image.map(img => {
      // Tenta diferentes formatos em ordem de preferência
      return img.formats?.large?.url ||
        img.formats?.medium?.url ||
        img.formats?.small?.url ||
        img.url;
    }).filter(Boolean); // Remove valores undefined/null
  };

  // Função auxiliar para obter tecnologias
  const getProjectTechnologies = (project: Project) => {
    if (project.technologies && project.technologies.length > 0) {
      return project.technologies;
    }
    if (project.techStack && project.techStack.length > 0) {
      return project.techStack;
    }
    // Fallback padrão baseado na categoria
    const defaultTechs = {
      web: ['React', 'TypeScript', 'Styled Components', 'Node.js'],
      mobile: ['React Native', 'TypeScript', 'Expo', 'Firebase'],
      design: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
      other: ['JavaScript', 'HTML5', 'CSS3', 'Git']
    };

    return defaultTechs[project.category as keyof typeof defaultTechs] ||
      defaultTechs.other;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const contentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  if (loading) {
    return (
      <PortfolioWrapper>
        <Header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Meus Projetos</h1>
          <p>Explorando ideias criativas e soluções inovadoras</p>
        </Header>

        <LoadingSkeleton>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </LoadingSkeleton>
      </PortfolioWrapper>
    );
  }

  return (
    <PortfolioWrapper id="projetos">
      <BackgroundElements />

      <Header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Portfólio</h1>
        <p>Uma coleção dos meus trabalhos mais recentes e projetos criativos</p>
      </Header>

      <FilterBar
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {filters.map(filter => (
          <FilterButton
            key={filter}
            active={activeFilter === filter}
            onClick={() => filterProjects(filter)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </FilterButton>
        ))}
      </FilterBar>

      <AnimatePresence>
        <ProjectsGrid
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filteredProjects.map((project) => {
            const logo = project.logo?.formats?.thumbnail?.url || project.logo?.url;
            const mainImage = project.image?.[0]?.formats?.medium?.url || project.image?.[0]?.url;

            return (
              <ProjectCard
                key={project.id}
                variants={cardVariants}
                layout
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <ProjectImage>
                  {mainImage ? (
                    <motion.img
                      src={mainImage}
                      alt={project.title}
                      loading="lazy"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                  ) : (
                    <NoImagePlaceholder>
                      Sem imagem
                    </NoImagePlaceholder>
                  )}
                </ProjectImage>

                <ProjectContent>
                  {logo && (
                    <ProjectLogo>
                      <img src={logo} alt={`${project.title} logo`} />
                    </ProjectLogo>
                  )}

                  <ProjectTitle>{project.title}</ProjectTitle>
                  <ProjectDescription>
                    {project.description}
                  </ProjectDescription>

                  <ProjectActions>
                    {project.link && (
                      <ProjectLink
                        href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Ver Projeto
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M5 12h14m-7-7l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </ProjectLink>
                    )}

                    <DetailsButton
                      onClick={() => openModal(project)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Detalhes
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2" />
                      </svg>
                    </DetailsButton>
                  </ProjectActions>
                </ProjectContent>
              </ProjectCard>
            );
          })}
        </ProjectsGrid>
      </AnimatePresence>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedProject && (
          <ModalOverlay
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeModal}
          >
            <ModalContent
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClick={closeModal}>
                ×
              </CloseButton>

              <ModalBody>
                <CarouselSection>
                  {getProjectImages(selectedProject).length > 0 ? (
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 5000 }}
                      loop={true}
                      className="modal-swiper"
                    >
                      {getProjectImages(selectedProject).map((imgUrl, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={imgUrl}
                            alt={`${selectedProject.title} - ${index + 1}`}
                            onError={(e) => {
                              // Fallback se a imagem não carregar
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">Imagem não disponível</div>';
                            }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <NoImagePlaceholder>
                      Nenhuma imagem disponível para este projeto
                    </NoImagePlaceholder>
                  )}
                </CarouselSection>

                <InfoSection>
                  <ModalHeader>
                    <h2>{selectedProject.title}</h2>
                  </ModalHeader>

                  <ModalDescription>
                    <p>{selectedProject.description}</p>

                    {selectedProject.fullDescription && (
                      <p style={{ marginTop: '15px' }}>{selectedProject.fullDescription}</p>
                    )}
                  </ModalDescription>
                  {/* 
                  <TechStack>
                    <h3>Tecnologias & Ferramentas</h3>
                    <div className="tech-tags">
                      {getProjectTechnologies(selectedProject).map((tech, index) => (
                        <TechTag key={index}>{tech}</TechTag>
                      ))}
                    </div>
                  </TechStack> */}

                  <ModalActions>
                    {selectedProject.link && (
                      <ProjectLink
                        href={selectedProject.link.startsWith('http') ? selectedProject.link : `https://${selectedProject.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Visitar Site
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M5 12h14m-7-7l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </ProjectLink>
                    )}

                    {selectedProject.github && (
                      <ProjectLink
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        Ver Código
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </ProjectLink>
                    )}
                  </ModalActions>
                </InfoSection>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PortfolioWrapper>
  );
}