import { Monitor, Gift, Crown, GraduationCap, BriefcaseBusiness, Building2, BarChart3, LucideIcon } from "lucide-react"
import { CinematicSection, Reveal } from "./ScrollFX"
import techData from "@values/data/tech-features.json"

const ICON_MAP: Record<string, LucideIcon> = {
    Monitor,
    Gift,
    Crown,
    GraduationCap,
    BriefcaseBusiness,
    Building2,
    BarChart3
}


export function TechFeatures() {
    if (!techData.items || techData.items.length === 0) return null

    return (
        <CinematicSection id="funcionalidades" className="py-24 lg:py-32 bg-transparent">
            <div className="mx-auto max-w-[1400px] px-6">
                <Reveal className="max-w-2xl">
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
                        {techData.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-muted-foreground lg:text-lg">
                        {techData.description}
                    </p>
                </Reveal>

                {/* Grid - 3 cols like Framer's feature grid */}
                <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {techData.items.map((feature: any, index: number) => {
                        const Icon = ICON_MAP[feature.icon] || Monitor
                        return (
                            <Reveal key={feature.title} delay={index * 0.05} className="h-full">
                                <div
                                    className="group flex flex-col h-full rounded-[32px] bg-card border border-border p-8 transition-all card-hover"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 group-hover:bg-primary/20 transition-colors overflow-hidden">
                                        {feature.logo ? (
                                            <img src={feature.logo} alt={feature.title} className="h-7 w-7 object-contain" loading="lazy" width="28" height="28" />
                                        ) : (
                                            <Icon className="h-6 w-6 text-foreground" />
                                        )}
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-foreground">{feature.title}</h3>
                                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            </Reveal>
                        )
                    })}
                </div>

                {/* Stats row - Focus on technical excellence */}
                <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3">
                    {techData.stats.map((stat: any, index: number) => (
                        <Reveal key={stat.label} delay={index * 0.05} className="h-full">
                            <div className="flex flex-col items-center justify-center rounded-[32px] bg-card border border-border p-8 text-center h-full">
                                <span className="text-3xl font-bold text-foreground lg:text-4xl">{stat.value}</span>
                                <span className="mt-2 text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </CinematicSection>
    )
}
