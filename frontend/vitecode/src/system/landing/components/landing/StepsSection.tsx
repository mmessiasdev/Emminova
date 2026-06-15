import { Search, LayoutGrid, Code, TrendingUp, LucideIcon } from "lucide-react"
import { CinematicSection, Reveal } from "./ScrollFX"
import stepsData from "@values/data/steps.json"

const ICON_MAP: Record<string, LucideIcon> = {
    Search,
    LayoutGrid,
    Code,
    TrendingUp,
}

export function StepsSection() {
    const steps = stepsData.steps
    if (!steps || steps.length === 0) return null

    return (
        <CinematicSection className="py-20 lg:py-32 bg-transparent overflow-hidden">
            <div className="mx-auto max-w-[1200px] px-6">
                {/* Header */}
                <Reveal className="text-center mb-16 lg:mb-24">
                    {stepsData.label && (
                        <span className="inline-block text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-4">
                            {stepsData.label}
                        </span>
                    )}
                    <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {stepsData.title}
                        {stepsData.highlight && (
                            <>
                                <br />
                                <span className="text-primary">{stepsData.highlight}</span>
                            </>
                        )}
                    </h2>
                    {stepsData.description && (
                        <p className="mt-5 mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
                            {stepsData.description}
                        </p>
                    )}
                </Reveal>

                {/* Steps timeline */}
                <div className="relative">
                    {/* Horizontal connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-px z-0">
                        <div className="w-full h-full bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0" />
                        {/* Animated glow pulse */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                    </div>

                    {/* Vertical connecting line (mobile) */}
                    <div className="lg:hidden absolute top-0 bottom-0 left-[28px] w-px z-0">
                        <div className="w-full h-full bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0" />
                    </div>

                    {/* Steps grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10">
                        {steps.map((step: any, index: number) => {
                            const Icon = ICON_MAP[step.icon] || Search
                            return (
                                <Reveal key={index} delay={index * 0.1} className="flex lg:flex-col items-start lg:items-center gap-5 lg:gap-0">
                                    {/* Circle icon */}
                                    <div className="relative group flex-shrink-0">
                                        {/* Outer glow ring on hover */}
                                        <div className="absolute -inset-2 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-all duration-500 blur-md" />
                                        <div className="relative w-14 h-14 lg:w-[88px] lg:h-[88px] rounded-full border-2 border-primary/40 group-hover:border-primary/80 flex items-center justify-center bg-background transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb,236,72,153),0.15)]">
                                            <Icon className="w-5 h-5 lg:w-7 lg:h-7 text-primary/70 group-hover:text-primary transition-colors duration-300" strokeWidth={1.5} />
                                        </div>
                                        {/* Step number badge */}
                                        <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                            <span className="text-[9px] lg:text-[10px] font-bold text-primary/80">{index + 1}</span>
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="lg:mt-6 lg:text-center">
                                        <h3 className="text-sm lg:text-base font-bold uppercase tracking-wider text-foreground mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-xs lg:text-sm leading-relaxed text-muted-foreground max-w-[260px] lg:mx-auto">
                                            {step.description}
                                        </p>
                                    </div>
                                </Reveal>
                            )
                        })}
                    </div>
                </div>
            </div>
        </CinematicSection>
    )
}
