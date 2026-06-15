import { useRef, useEffect, useState } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from '../landing/Header';
import { Footer } from '../landing/Footer';
import { useScrollAnimation } from '@landing/hooks/useScrollAnimation';
import { useLocation } from 'react-router-dom';
import { Molecules } from '@landing/components/ui/molecules';
import { useGsapLanding } from '@landing/hooks/useGsapLanding';
import { branding } from '@/values/config/branding';

interface PublicLayoutProps {
    children: React.ReactNode;
    /** When true, the header starts hidden and appears after scrolling 50px. Used by the landing page. */
    hideHeaderOnTop?: boolean;
}

export function PublicLayout({ children, hideHeaderOnTop = false }: PublicLayoutProps) {
    useScrollAnimation();
    useGsapLanding();
    const location = useLocation();
    const glowRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [headerScrolled, setHeaderScrolled] = useState(!hideHeaderOnTop);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll detection for header visibility — only active when hideHeaderOnTop is true
    useEffect(() => {
        if (!hideHeaderOnTop) {
            setHeaderScrolled(true);
            return;
        }

        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [hideHeaderOnTop]);

    useEffect(() => {
        if (!glowRef.current) return;

        const glowTween = gsap.to(glowRef.current, {
            y: 220,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "75% top",
                scrub: true,
            }
        });

        return () => {
            glowTween.kill();
            glowTween.scrollTrigger?.kill();
        };
    }, []);


    return (
        <div className="min-h-screen w-full relative bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans transition-colors duration-300">
            <div
                ref={glowRef}
                className="absolute left-0 right-0 top-0 h-[75vh] z-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 78% 55% at 50% 0%, rgba(226, 232, 240, 0.08), transparent 72%)",
                }}
            />
            <Molecules
                className="absolute inset-0 z-[40]"
                quantity={isMobile ? 30 : 100}
                color={branding.moleculesColor}
                proximity={100}
                lineOpacity={1}
                speed={.5}
                interactivityStrength={.5}
            />
            <div className="relative z-10">
                <Header scrolled={headerScrolled} />
                <main key={location.pathname} className={`animate-fade-in ${!hideHeaderOnTop ? "pt-20" : ""}`}>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}

