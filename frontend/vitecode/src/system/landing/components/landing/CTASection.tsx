import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"
import { HoverBorderGradient } from "@landing/components/ui/hover-border-gradient"
import { CinematicSection, Reveal } from "./ScrollFX"
import ctaData from "@values/data/cta.json"

export function CTASection() {
    const navigate = useNavigate()

    const formatText = (text: string) => {
        return text.replace(/{brandingName}/g, branding.name)
    }

    return (
        <CinematicSection className="relative overflow-hidden py-32 lg:py-44 bg-transparent">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute bottom-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 translate-y-1/4 rounded-full bg-primary/10 blur-[150px]" />
            </div>

            <div className="relative mx-auto max-w-[1400px] px-6 text-center">
                <Reveal className="space-y-8">
                    <h2
                        className="mx-auto max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[80px]"
                        dangerouslySetInnerHTML={{ __html: formatText(ctaData.title) }}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Reveal from="scale" delay={0.05} className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => navigate(ctaData.cta_primary.link)}
                                className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-10 h-14 text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                {ctaData.cta_primary.text}
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <HoverBorderGradient
                                containerClassName="rounded-full"
                                as="button"
                                onClick={() => navigate(ctaData.cta_secondary.link)}
                                className="bg-black text-white flex items-center space-x-2 px-10 h-14 text-sm font-bold"
                            >
                                <span>{ctaData.cta_secondary.text}</span>
                            </HoverBorderGradient>
                        </Reveal>
                    </div>
                </Reveal>
            </div>
        </CinematicSection>
    )
}

const EmmiLogo = () => {
    return (
        <svg
            width="66"
            height="65"
            viewBox="0 0 66 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 text-white"
        >
            <path
                d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
                stroke="currentColor"
                strokeWidth="15"
                strokeMiterlimit="3.86874"
                strokeLinecap="round"
            />
        </svg>
    );
};
