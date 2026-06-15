import { ArrowRight } from "lucide-react"
import { CinematicSection, ParallaxMedia, Reveal } from "./ScrollFX"
import showcaseData from "@values/data/showcase.json"


export function ImageShowcase() {
    if (!showcaseData.items || showcaseData.items.length === 0) return null

    return (
        <CinematicSection className="py-24 lg:py-40 bg-transparent">
            <div className="mx-auto max-w-[1400px] px-6">
                {/* Header */}
                <Reveal className="mb-24 lg:mb-32 max-w-2xl">
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
                        {showcaseData.title}
                    </h2>
                </Reveal>

                {/* Staggered Layout */}
                <div className="flex flex-col gap-32 lg:gap-56">
                    {showcaseData.items.map((item: any, index: number) => {
                        const hasImage = item.image && item.image.trim() !== ""
                        return (
                            <div
                                key={item.number}
                                className={`flex flex-col lg:items-center gap-16 lg:gap-24 ${
                                    hasImage
                                        ? item.imagePos === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'
                                        : 'lg:flex-row'
                                }`}
                            >
                                {/* Text part */}
                                <Reveal delay={index * 0.1} className={`${hasImage ? "flex-1" : "w-full"} space-y-6`}>
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 text-sm font-bold text-foreground/50">
                                            {item.number}
                                        </span>
                                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                            {item.label}
                                        </span>
                                    </div>
                                    <h3 className="text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
                                        {item.title}
                                    </h3>
                                    <p className={`text-lg text-muted-foreground leading-relaxed ${hasImage ? "max-w-md" : "max-w-3xl"}`}>
                                        {item.description}
                                    </p>
                                </Reveal>

                                {/* Image part — Variable 3D Effects */}
                                {hasImage && (
                                    <ParallaxMedia className="flex-[1.4] w-full" strength={90}>
                                        <div
                                            className="relative transition-transform duration-700 hover:scale-[1.02]"
                                            style={{ transformStyle: "preserve-3d" }}
                                        >
                                            <div
                                                className="relative overflow-hidden rounded-[24px] shadow-2xl bg-card border border-border aspect-video w-full"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.imageAlt}
                                                    className="absolute inset-0 w-full h-full object-cover block"
                                                    loading="lazy"
                                                    width="800"
                                                    height="600"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
                                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
                                                <div className="absolute inset-0 ring-1 ring-inset ring-foreground/[0.08] rounded-[24px] pointer-events-none" />
                                            </div>

                                            {/* Reactive Glow / Reflection underneath */}
                                            <div
                                                className="absolute -inset-4 bg-foreground/[0.02] blur-3xl -z-10 rounded-full pointer-events-none"
                                                style={{ transform: "translateZ(-1px)" }}
                                            />
                                        </div>
                                    </ParallaxMedia>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </CinematicSection>
    )
}
