import { useState, useRef, useLayoutEffect, memo } from "react"
import { Tv, Link2, ListVideo, LucideIcon } from "lucide-react"
import { branding } from "@/values/config/branding"
import { CinematicSection, Reveal } from "./ScrollFX"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import howItWorksData from "@values/data/how-it-works.json"

gsap.registerPlugin(ScrollTrigger)

const ICON_MAP: Record<string, LucideIcon> = {
    Tv,
    Link2,
    ListVideo
}

const formatText = (text: string, totalSteps: number) => {
    return text
        .replace(/{brandingName}/g, branding.name)
        .replace(/{totalSteps}/g, totalSteps.toString())
}


export const HowItWorks = memo(function HowItWorks() {
    const steps = howItWorksData.items
    if (!steps || steps.length === 0) return null

    const [activeStep, setActiveStep] = useState(0)
    const cardRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const sectionRef = useRef<HTMLElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [rotate, setRotate] = useState({ x: 4, y: -8 })

    useLayoutEffect(() => {
        const section = sectionRef.current
        const container = containerRef.current
        const content = contentRef.current
        if (!section || !container || !content) return

        const mm = gsap.matchMedia()

        mm.add("(min-width: 1024px)", () => {
            let st: globalThis.ScrollTrigger | null = null;
            
            const initGSAP = setTimeout(() => {
                st = ScrollTrigger.create({
                    trigger: content,
                    start: "top top+=96",
                    end: `+=${steps.length * 40}%`,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const totalSteps = steps.length;
                        const newStep = Math.min(
                            Math.floor(progress * totalSteps),
                            totalSteps - 1
                        );
                        setActiveStep(newStep);
                    },
                    onLeave: () => setActiveStep(steps.length - 1),
                    onEnterBack: () => setActiveStep(steps.length - 1),
                });
                
                // Automatically sort triggers to fix lazy load out-of-order bugs
                ScrollTrigger.sort();
                ScrollTrigger.refresh();
            }, 100);

            return () => {
                clearTimeout(initGSAP);
                if (st) st.kill();
            };
        });

        // Safe refresh strategy avoiding ResizeObserver loops
        const timeouts = [100, 500, 1500].map(time =>
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, time)
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
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10

        setRotate({ x: rotateX + 4, y: rotateY - 8 })
    }

    const handleMouseLeave = () => {
        setRotate({ x: 4, y: -8 })
    }

    const activeImage = steps[activeStep]?.image
    const hasImage = activeImage && activeImage.trim() !== ""

    return (
        <CinematicSection
            ref={sectionRef}
            id="como-funciona"
            className="relative z-20 overflow-hidden bg-background py-10 lg:py-16"
            noReveal
        >
            <div ref={containerRef} className="mx-auto flex max-w-[1400px] flex-col px-6">
                <div
                    ref={contentRef}
                    className="relative z-10 flex min-h-[70vh] flex-col justify-center gap-6 lg:min-h-[78vh] lg:gap-10"
                >
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-3 text-2xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-3xl lg:text-[clamp(1.9rem,3vw,3rem)]">
                            {howItWorksData.title}
                        </h2>
                        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
                            {formatText(howItWorksData.description, steps.length)}
                        </p>
                    </Reveal>
                    <div className={`grid grid-cols-1 items-center gap-8 ${hasImage ? "lg:grid-cols-2 lg:gap-12" : "mx-auto max-w-3xl"}`}>
                    <Reveal className="flex h-full flex-col justify-center">
                        <div className="flex flex-col gap-1.5 lg:gap-2">
                            {steps.map((step: any, index: number) => (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveStep(index)
                                    }}
                                    className={`group flex items-start gap-3 lg:gap-4 rounded-[16px] lg:rounded-[24px] p-3 lg:p-4 text-left transition-all duration-500 ${activeStep === index ? "bg-[#0A0A0A]" : ""
                                        }`}
                                >
                                    <div className={`flex h-7 w-7 lg:h-9 lg:w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${activeStep === index ? "bg-white/90 text-black" : "bg-white/5 text-white/30"
                                        }`}>
                                        {step.id}
                                    </div>
                                    <div>
                                        <h3 className={`text-sm lg:text-base font-bold transition-colors ${activeStep === index ? "text-white" : "text-muted-foreground"
                                            }`}>
                                            {step.title}
                                        </h3>
                                        <div className={`grid transition-all duration-300 ease-in-out ${activeStep === index ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}>
                                            <p className="overflow-hidden text-[11px] lg:text-xs leading-relaxed text-muted-foreground line-clamp-1 lg:line-clamp-2">
                                                {formatText(step.description, steps.length)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Reveal>

                    {/* Right: Premium 3D Image Card with mouse-reactive tilt */}
                    {hasImage && (
                        <Reveal from="right" className="flex items-center lg:h-auto lg:max-h-[35vh] xl:max-h-[40vh]">
                            <div
                                className="relative w-full max-w-[550px] mx-auto"
                                style={{ perspective: "2000px" }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div
                                    ref={cardRef}
                                    className="w-full overflow-hidden rounded-[20px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] transition-transform duration-200 ease-out"
                                    style={{
                                        transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg) rotateZ(-1deg)`,
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="aspect-[16/9] w-full relative bg-[#080808]">
                                        {steps.map((step: any, index: number) => {
                                            const stepImage = step.image
                                            const stepHasImage = stepImage && stepImage.trim() !== ""
                                            if (!stepHasImage) return null
                                            return (
                                                <img
                                                    key={index}
                                                    src={stepImage}
                                                    alt={formatText(step.imageAlt, steps.length)}
                                                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${activeStep === index
                                                        ? "opacity-100 scale-100 translate-y-0"
                                                        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                                                        }`}
                                                    loading="lazy"
                                                />
                                            )
                                        })}



                                        {/* Inner glow/shadow ring */}
                                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Step indicator pips */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                                    {steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1 rounded-full transition-all duration-500 ${activeStep === index ? "w-8 bg-white/40" : "w-1.5 bg-white/10"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    )}
                    </div>
                </div>
            </div>
        </CinematicSection>
    )
})
