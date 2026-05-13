import { Gift, Handshake, Users, Crown, MapPinned, Tv, LucideIcon } from "lucide-react"
import { CinematicSection, Reveal } from "./ScrollFX"
import benefitsData from "@values/data/benefits.json"

const ICON_MAP: Record<string, LucideIcon> = {
    Gift,
    Handshake,
    Users,
    Crown,
    MapPinned,
    Tv
}


export function BenefitsSection() {
    if (!benefitsData.items || benefitsData.items.length === 0) return null

    return (
        <CinematicSection id="produto" className="py-12 lg:py-16 bg-transparent">
            <div className="mx-auto max-w-[1400px] px-6">
                <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
                    <div className="max-w-2xl">
                        <h2
                            className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[clamp(2rem,4vw,3.5rem)]"
                            dangerouslySetInnerHTML={{ __html: benefitsData.title }}
                        />
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-lg">
                            {benefitsData.description}
                        </p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    {benefitsData.items.map((card: any, index: number) => {
                        const Icon = ICON_MAP[card.icon] || Tv
                        const imageStyle = card.wide
                            ? { transform: "perspective(800px) rotateY(-12deg) rotateX(4deg) scale(1.05)", transformOrigin: "right center" }
                            : { transform: "perspective(800px) rotateY(-15deg) rotateX(5deg) scale(1.08)", transformOrigin: "right center" }
                        return (
                            <div key={card.id} className={card.wide ? "lg:col-span-8" : "lg:col-span-4"}>
                                <article
                                    className={`group relative overflow-hidden rounded-[20px] bg-secondary/30 shadow-[0_0px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-500 hover:shadow-[0_0px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 flex flex-col h-full`}
                                >
                                    {/* Decorative glow like pricing card */}
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
                                    {/* Text content area */}
                                    <div className="p-8 flex-shrink-0">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <Icon className="h-5 w-5 text-foreground/80" />
                                            </div>
                                            <span className="text-[10px] font-black tracking-[0.25em] text-white/20 uppercase">{card.id}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{card.title}</h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                                    </div>

                                    {/* Image area - 3D angled */}
                                    <div className="relative flex-1 overflow-hidden min-h-[200px]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10 pointer-events-none" />
                                        <div className="absolute inset-0 overflow-hidden">
                                            <img
                                                src={card.image}
                                                alt={card.imageAlt}
                                                className="absolute top-4 right-0 h-[95%] w-[90%] object-cover object-left-top rounded-tl-[16px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] transition-transform duration-700 group-hover:scale-[1.02]"
                                                style={imageStyle}
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </article>
                            </div>
                        )
                    })}
                </div>
            </div>
        </CinematicSection>
    )
}
