import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '@landing/components/landing/HeroSection';
import { BenefitsSection } from '@landing/components/landing/BenefitsSection';
import { PublicLayout } from '@landing/components/layout/PublicLayout';
import { SocialProof } from '@landing/components/landing/SocialProof';

const ImageShowcase = lazy(() => import('@landing/components/landing/ImageShowcase').then(module => ({ default: module.ImageShowcase })));
const HowItWorks = lazy(() => import('@landing/components/landing/HowItWorks').then(module => ({ default: module.HowItWorks })));
const TechFeatures = lazy(() => import('@landing/components/landing/TechFeatures').then(module => ({ default: module.TechFeatures })));
const PricingTiers = lazy(() => import('@landing/components/landing/PricingTiers').then(module => ({ default: module.PricingTiers })));
const CTASection = lazy(() => import('@landing/components/landing/CTASection').then(module => ({ default: module.CTASection })));
const TestimonialsSection = lazy(() => import('@landing/components/landing/TestimonialsSection').then(module => ({ default: module.TestimonialsSection })));
const AboutUsSection = lazy(() => import('@landing/components/landing/AboutUsSection').then(module => ({ default: module.AboutUsSection })));
const DownloadSection = lazy(() => import('@landing/components/landing/DownloadSection').then(module => ({ default: module.DownloadSection })));
const ProductsCarousel = lazy(() => import('@landing/components/landing/ProductsCarousel').then(module => ({ default: module.ProductsCarousel })));
const StepsSection = lazy(() => import('@landing/components/landing/StepsSection').then(module => ({ default: module.StepsSection })));

const Index = () => {
    const location = useLocation();

    useEffect(() => {
        const state = location.state as { scrollTo?: string } | null;
        if (state?.scrollTo) {
            const element = document.getElementById(state.scrollTo);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
            // Clear state to prevent re-scroll
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <PublicLayout hideHeaderOnTop>
            <HeroSection />
            <BenefitsSection />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {/* <SocialProof /> */}
                <ImageShowcase />
                <ProductsCarousel />
                <HowItWorks />
                <StepsSection />
                <TechFeatures />
                {/* <DownloadSection /> */}
                <TestimonialsSection />
                <AboutUsSection />
                {/* <PricingTiers /> */}
                <CTASection />
            </Suspense>
        </PublicLayout>
    );
};

export default Index;
