import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ExternalLink, BookOpen, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@landing/components/ui/button';
import productsData from '@/values/data/products.json';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type MediaItem = { type: string; url: string };
type Project = {
    id: string;
    name: string;
    description: string;
    image: string;
    link: string;
    tags: string[];
    logo?: string;
    gallery?: MediaItem[];
    documentationUrl?: string;
};

const ProjectPopup = ({ project, onClose }: { project: Project; onClose: () => void }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    const mediaList = project.gallery?.length ? project.gallery : [{ type: 'image', url: project.image }];

    // Prevent scrolling behind modal
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-background/50 backdrop-blur-md rounded-full text-foreground hover:bg-background/80 transition-colors border border-border"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Gallery Carousel */}
                <div className="w-full md:w-2/3 h-[40vh] md:h-full relative bg-black/5 flex flex-col">
                    <div className="overflow-hidden flex-1 relative group" ref={emblaRef}>
                        <div className="flex h-full">
                            {mediaList.map((media, idx) => (
                                <div key={idx} className="flex-[0_0_100%] min-w-0 h-full relative">
                                    {media.type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black/10">
                                            <video
                                                src={media.url}
                                                controls
                                                className="w-full h-full object-contain"
                                                controlsList="nodownload"
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={media.url}
                                            alt={`${project.name} gallery ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Gallery Controls */}
                        {mediaList.length > 1 && (
                            <>
                                <button
                                    onClick={scrollPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/40 hover:bg-background/80 backdrop-blur-md rounded-full text-foreground border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={scrollNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/40 hover:bg-background/80 backdrop-blur-md rounded-full text-foreground border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Pagination indicators */}
                        {mediaList.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                {mediaList.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-6 bg-primary' : 'w-2 bg-primary/40'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Info */}
                <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col h-[50vh] md:h-full overflow-y-auto">
                    <div className="mb-6 flex flex-wrap gap-2">
                        {project.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {project.logo && (
                        <img
                            src={project.logo}
                            alt={`${project.name} logo`}
                            className="self-start h-16 w-16 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h2 className="text-3xl font-bold mb-4">{project.name}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                        {project.description}
                    </p>

                    <div className="mt-auto space-y-4">
                        <Link to={project.link} className="block w-full" target="_blank">
                            <Button className="w-full h-12 text-base font-semibold group relative overflow-hidden rounded-xl">
                                <span className="relative z-10 flex items-center gap-2">
                                    Acessar Solução
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                            </Button>
                        </Link>

                        {project.documentationUrl && (
                            <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button variant="outline" className="w-full h-12 text-base font-semibold group rounded-xl border-primary/30 hover:bg-primary/5">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Ver Documentação
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const ProductsCarousel = () => {
    const { items, title, subtitle, description } = productsData;
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isHovered, setIsHovered] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Main embla carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        skipSnaps: false,
        dragFree: true
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        const carousel = carouselRef.current;
        if (!section || !carousel || !emblaApi) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            let st: globalThis.ScrollTrigger | null = null;

            const initGSAP = setTimeout(() => {
                st = ScrollTrigger.create({
                    trigger: carousel,
                    start: "center center",
                    end: `+=${items.length * 30}%`,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const totalSlides = items.length;
                        const targetSlide = Math.min(
                            Math.floor(progress * totalSlides),
                            totalSlides - 1
                        );
                        emblaApi.scrollTo(targetSlide);
                    },
                });

                ScrollTrigger.sort();
                ScrollTrigger.refresh();
            }, 100);

            return () => {
                clearTimeout(initGSAP);
                if (st) st.kill();
            };
        });

        const timeouts = [100, 500, 1500].map(time =>
            setTimeout(() => ScrollTrigger.refresh(), time)
        );

        const handleLoad = () => {
            setTimeout(() => ScrollTrigger.refresh(), 100);
        };
        window.addEventListener('load', handleLoad);

        if (document.fonts) {
            document.fonts.ready.then(() => {
                setTimeout(() => ScrollTrigger.refresh(), 100);
            });
        }

        return () => {
            timeouts.forEach(clearTimeout);
            window.removeEventListener('load', handleLoad);
            mm.revert();
        };
    }, [emblaApi, items.length]);

    return (
        <section ref={sectionRef} className="relative py-24 overflow-hidden bg-background" id="produtos">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div ref={containerRef} className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 ">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 tracking-wider uppercase">
                            {subtitle}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {title}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {description}
                        </p>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                            className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                            className="rounded-full w-12 h-12 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Pinned Carousel Area */}
                <div ref={carouselRef} className="flex flex-col items-center justify-center min-h-[70vh]">
                {/* Embla Carousel Viewport */}
                <div className="overflow-hidden w-full -mx-4 px-4 md:mx-0 md:px-0 py-4" ref={emblaRef}>
                    <div className="flex gap-6 md:gap-8 ml-[40px] mb-[40px] mr-[40px]">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 relative group rounded-3xl overflow-hidden cursor-pointer bg-card border border-border shadow-xl hover:shadow-2xl transition-shadow duration-500"
                                onMouseEnter={() => setIsHovered(index)}
                                onMouseLeave={() => setIsHovered(null)}
                                whileHover={{ y: -8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => setSelectedProject(item)}
                            >
                                {/* Card Height Wrapper */}
                                <div className="h-[480px] md:h-[520px] w-full relative flex flex-col">
                                    {/* Image Wrapper */}
                                    <div className="relative w-full h-[55%] overflow-hidden">
                                        <motion.img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            animate={{
                                                scale: isHovered === index ? 1.08 : 1
                                            }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                                        {/* Tags */}
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                                            {item.tags.slice(0, 2).map((tag, tagIdx) => (
                                                <span
                                                    key={tagIdx}
                                                    className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-semibold text-foreground border border-white/10"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="p-6 md:p-8 flex flex-col flex-1 relative z-10 bg-card -mt-6">
                                        {item.logo && (
                                            <img
                                                src={item.logo}
                                                alt={`${item.name} logo`}
                                                className="self-start h-12 w-12 object-cover rounded-lg mb-3"
                                            />
                                        )}
                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                            {item.name}
                                        </h3>

                                        <div className="relative flex-1 overflow-hidden">
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Animated Button Reveal */}
                                        <div className="mt-4 overflow-hidden h-[30px]">
                                            <motion.div
                                                initial={{ y: 20, opacity: 0.7 }}
                                                animate={{
                                                    y: isHovered === index ? 0 : 5,
                                                    opacity: isHovered === index ? 1 : 0.8
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <span className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                    Ver detalhes do projeto
                                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex justify-center gap-4 mt-8 md:hidden">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        className="rounded-full w-12 h-12 border-primary/20"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        className="rounded-full w-12 h-12 border-primary/20"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
                </div>{/* end carouselRef */}
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <ProjectPopup
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};
