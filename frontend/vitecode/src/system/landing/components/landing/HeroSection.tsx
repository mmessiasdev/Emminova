import { useRef, useLayoutEffect, useState, useEffect } from "react"
import { Button } from "@landing/components/ui/button"
import { HoverBorderGradient } from "@landing/components/ui/hover-border-gradient"
import { branding } from "@/values/config/branding"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import heroData from "@values/data/hero.json"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useLayoutEffect(() => {
        const video = videoRef.current
        const hero = heroRef.current
        if (!hero) return

        const mm = gsap.matchMedia()

        mm.add("(min-width: 1024px)", () => {
            if (!video) return;
            video.currentTime = 0

            // ScrollTrigger pin and video scrub only on desktop
            const st = ScrollTrigger.create({
                trigger: hero,
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: true,
                onUpdate: (self) => {
                    if (video.duration) {
                        video.currentTime = self.progress * video.duration
                    }
                },
            })

            return () => st.kill()
        })

        // Refresh after layout settles
        const timer = setTimeout(() => ScrollTrigger.refresh(), 200)

        return () => {
            clearTimeout(timer)
            mm.revert()
        }
    }, [])

    const replaceBrandingName = (text: string) =>
        text.replace(/{brandingName}/g, branding.name)

    return (
        <div ref={heroRef} className="relative w-full min-h-screen flex items-center bg-background overflow-hidden lg:-mt-20 lg:pt-20">
            {/* Background grid */}
            <div className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden pointer-events-none opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        transform: "perspective(600px) rotateX(65deg) scale(2) translateY(-20%)",
                        transformOrigin: "50% 0%",
                    }}
                />
            </div>

            <div className="mx-auto max-w-[1400px] px-6 w-full py-4 lg:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
                    {/* Left: Heading + CTA */}
                    <div className="space-y-3 lg:space-y-6 text-center lg:text-left">
                        <h1
                            className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-7xl lg:text-[clamp(1.75rem,3.5vw,3.5rem)] xl:text-[clamp(2.25rem,4.5vw,4rem)]"
                            dangerouslySetInnerHTML={{ __html: replaceBrandingName(heroData.title) }}
                        />

                        <p className="max-w-md mx-auto lg:mx-0 text-sm lg:text-base leading-relaxed text-muted-foreground opacity-90 line-clamp-2 lg:line-clamp-3">
                            {replaceBrandingName(heroData.description)}
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                            <Button
                                onClick={() => navigate(heroData.cta_primary.link)}
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 lg:px-7 h-9 lg:h-11 text-xs lg:text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {replaceBrandingName(heroData.cta_primary.text)}
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>

                            <HoverBorderGradient
                                containerClassName="rounded-full"
                                as="button"
                                onClick={() => navigate(heroData.cta_secondary.link)}
                                className="bg-background dark:bg-zinc-900 text-foreground flex items-center space-x-2 px-5 lg:px-7 h-9 lg:h-11 text-xs lg:text-sm font-bold shadow-sm"
                            >
                                <span>{replaceBrandingName(heroData.cta_secondary.text)}</span>
                            </HoverBorderGradient>
                        </div>
                    </div>

                    {/* Right: Scroll-controlled Video (Hidden on Mobile) */}
                    {isDesktop && (
                        <div className="relative w-full max-w-[500px] mx-auto lg:ml-auto hidden lg:flex items-center justify-center h-full max-h-[70vh] xl:max-h-[75vh]">
                            <div className="relative w-full aspect-video lg:aspect-square rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm max-h-full">
                                <video
                                    ref={videoRef}
                                    src={heroData.video_url}
                                    className="h-full w-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                />
                            </div>

                            {/* Accent glow (Hidden on Mobile) */}
                            <div className="absolute -z-10 -bottom-8 -right-8 w-40 h-40 lg:w-56 lg:h-56 bg-primary/10 blur-[60px] lg:blur-[80px] rounded-full" />
                            <div className="absolute -z-10 -top-8 -left-8 w-40 h-40 lg:w-56 lg:h-56 bg-primary/10 blur-[60px] lg:blur-[80px] rounded-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
