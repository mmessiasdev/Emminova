import { useRef, useLayoutEffect, useState, useEffect } from "react"
// NOTE: Text entry animation uses CSS class (animate-fade-in-up) instead of GSAP
// to avoid conflicts with ScrollTrigger's scrubbed timeline on the same element.
import { Button } from "@landing/components/ui/button"
import { branding } from "@/values/config/branding"
import {  ArrowDownIcon, ArrowRight, ArrowUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import heroData from "@values/data/hero.json"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const videoOverlayRef = useRef<HTMLDivElement>(null)
    const colorOverlayRef = useRef<HTMLDivElement>(null)
    const cardsContainerRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<HTMLDivElement[]>([])

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Entry animation is handled by CSS class "animate-fade-in-up" on the text container.
    // Using GSAP here would conflict with ScrollTrigger's scrubbed timeline (both animate opacity/y).

    useLayoutEffect(() => {
        const hero = heroRef.current
        if (!hero) return

        const isDesktopLocal = window.innerWidth >= 1024
        
        // Return early on mobile/tablet to prevent heavy scroll pinning/resizing layout recalculations
        if (!isDesktopLocal) {
            // Ensure cards container remains hidden and video container is full size on mobile
            if (cardsContainerRef.current) cardsContainerRef.current.style.display = "none"
            return
        }

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=120%",
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                }
            })

            // 1. Fade out and slide up text
            tl.to(textRef.current, {
                opacity: 0,
                y: -120,
                ease: "power2.inOut",
                duration: 1
            }, 0)

            // 2. Shrink video container and center it
            tl.to(videoContainerRef.current, {
                width: "60vw",
                height: "33.75vw", // 16:9 aspect ratio
                borderRadius: "2rem",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
                ease: "power2.inOut",
                duration: 1
            }, 0)

            // 3. Fade out the dark overlay on the video to make it pop
            tl.to(videoOverlayRef.current, {
                opacity: 0.15,
                ease: "power2.inOut",
                duration: 1
            }, 0)

            // 4. Slide the left half solid color out to reveal the image
            tl.to(colorOverlayRef.current, {
                x: "-100%",
                ease: "power2.inOut",
                duration: 1
            }, 0)

            // 5. Fade in the background cards
            tl.to(cardsContainerRef.current, {
                opacity: 1,
                ease: "power2.inOut",
                duration: 1
            }, 0)

            // 5. Parallax zoom / entry of background cards
            cardsRef.current.forEach((card, index) => {
                if (!card) return
                const isLeft = index % 2 === 0
                const isTop = index < 4
                
                // Directional movement from the corners inwards
                const xStart = isLeft ? -80 : 80
                const yStart = isTop ? -80 : 80
                
                tl.fromTo(card, {
                    opacity: 0,
                    scale: 0.7,
                    x: xStart,
                    y: yStart,
                }, {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    ease: "power2.inOut",
                    duration: 1
                }, 0)
            })

        }, hero)

        return () => ctx.revert()
    }, [])

    const replaceBrandingName = (text: string) =>
        text.replace(/{brandingName}/g, branding.name)

    // Detect if the hero media is a video or an image
    const mediaUrl = heroData.video_url || ""
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"]
    const isVideo = videoExtensions.some(ext => mediaUrl.toLowerCase().includes(ext))

    // Predefined positions and configurations for the background template images
    const cardPositions = [
        { top: "12%", left: "4%", rotate: "-6deg", size: "w-28 md:w-56" },
        { top: "8%", left: "28%", rotate: "4deg", size: "hidden lg:block lg:w-48" },
        { top: "8%", right: "28%", rotate: "-3deg", size: "hidden lg:block lg:w-48" },
        { top: "12%", right: "4%", rotate: "8deg", size: "w-28 md:w-56" },
        { bottom: "12%", left: "4%", rotate: "5deg", size: "w-28 md:w-56" },
        { bottom: "8%", left: "28%", rotate: "-4deg", size: "hidden lg:block lg:w-48" },
        { bottom: "8%", right: "28%", rotate: "3deg", size: "hidden lg:block lg:w-48" },
        { bottom: "12%", right: "4%", rotate: "-6deg", size: "w-28 md:w-56" },
    ]

    const textAlign = (heroData as any).text_align || "center"
    
    let containerAlignClasses = "text-center items-center"
    let pAlignClasses = "mx-auto"
    let btnAlignClasses = "justify-center"

    if (textAlign === "left") {
        containerAlignClasses = "text-left items-start"
        pAlignClasses = "mr-auto ml-0"
        btnAlignClasses = "justify-start"
    } else if (textAlign === "right") {
        containerAlignClasses = "text-right items-end"
        pAlignClasses = "ml-auto mr-0"
        btnAlignClasses = "justify-end"
    }

    return (
        <div ref={heroRef} className="relative w-full h-screen flex items-center justify-center bg-background overflow-hidden">
            {/* Mesh gradient background - revealed when video shrinks */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-100/40 via-purple-50/40 to-background dark:from-pink-950/10 dark:via-purple-950/10 dark:to-background pointer-events-none" />

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--muted-foreground)) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* Floating cards background */}
            <div ref={cardsContainerRef} className="absolute inset-0 pointer-events-none opacity-0 z-10 overflow-hidden">
                {heroData.bg_images?.map((url, index) => {
                    const pos = cardPositions[index % cardPositions.length]
                    return (
                        <div
                            key={index}
                            ref={(el) => { if (el) cardsRef.current[index] = el }}
                            className={`absolute select-none ${pos.size}`}
                            style={{
                                top: pos.top,
                                left: pos.left,
                                right: pos.right,
                                bottom: pos.bottom,
                                transform: `rotate(${pos.rotate})`,
                            }}
                        >
                            {/* Inner wrapper for hover effect (with CSS transition) to prevent conflict with GSAP */}
                            <div className="w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/10 dark:border-zinc-800/50 bg-card transition-transform hover:scale-105 duration-300 pointer-events-auto">
                                <img 
                                    src={url} 
                                    alt={`Emmidocs screenshot ${index}`} 
                                    className="w-full h-auto object-cover aspect-[16/10] pointer-events-none"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Central Scaling Video Container */}
            <div 
                ref={videoContainerRef} 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen z-20 overflow-hidden bg-background/20 pointer-events-none"
                style={{ transformOrigin: "center center" }}
            >
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Overlay to ensure text readability */}
                <div ref={videoOverlayRef} className="absolute inset-0 bg-background/70 z-10 pointer-events-none" />
                {/* Solid color overlay covering left half initially */}
                <div ref={colorOverlayRef} className="absolute top-0 left-0 w-1/2 h-full bg-background z-20 pointer-events-none" />
            </div>

            {/* Text Content Overlay */}
            <div ref={textRef} className="relative z-30 w-full max-w-7xl mx-auto px-6 text-foreground pointer-events-auto">
                <div className={`flex flex-col w-full ${containerAlignClasses}`}>
                    <h1
                        className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl lg:text-[4.5rem] xl:text-[5rem] max-w-4xl"
                        dangerouslySetInnerHTML={{ __html: replaceBrandingName(heroData.title) }}
                    />

                    <p className={`max-w-2xl mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground ${pAlignClasses}`}>
                        {replaceBrandingName(heroData.description)}
                    </p>

                    <div className={`flex flex-wrap items-center gap-4 mt-10 ${btnAlignClasses}`}>
                        <Button
                            onClick={() => navigate(heroData.cta_primary.link)}
                            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 h-12 text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            {replaceBrandingName(heroData.cta_primary.text)}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>

                        <Button
                            onClick={() => navigate(heroData.cta_secondary.link)}
                            className="rounded-full bg-secondary/80 backdrop-blur-md border border-border text-foreground hover:bg-secondary font-bold px-8 h-12 text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                        >
                            {replaceBrandingName(heroData.cta_secondary.text)}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator Arrow (independent of text centering) */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-lg text-muted-foreground pointer-events-none">
                <ArrowUp />
            </div>
        </div>
    )
}
