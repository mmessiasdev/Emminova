import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branding } from '@/values/config/branding';
import { HoverBorderGradient } from '@landing/components/ui/hover-border-gradient';
import { CinematicSection } from './ScrollFX';
import pricingData from "@values/data/pricing.json"

const formatText = (text: string) => {
    return text.replace(/{brandingName}/g, branding.name)
}


export function PricingTiers() {
    const navigate = useNavigate();
    const plan = pricingData.plan

    return (
        <CinematicSection noReveal className="py-20 px-6 md:px-8 max-w-4xl mx-auto bg-transparent">
            <div className="flex justify-center">
                <div className="w-full max-w-2xl rounded-3xl p-8 md:p-12 bg-card border border-border relative overflow-hidden shadow-xl">

                    <div className="relative space-y-8 z-10">
                        {/* Header */}
                        <div className="space-y-3 text-center md:text-left">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest mb-2">
                                {plan.badge}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight">{plan.name}</h3>
                            <p className="text-base text-muted-foreground">{formatText(plan.description)}</p>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 py-6 border-y border-white/5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">{plan.price}</span>
                                <span className="text-lg text-muted-foreground font-medium">{plan.period}</span>
                            </div>
                            <p className="text-xs text-primary/60 font-medium md:ml-auto">
                                {plan.note}
                            </p>
                        </div>

                        {/* CTA Button — UPDATED TO MATCH HERO EXACTLY */}
                        <div className="flex justify-center w-full">
                            <HoverBorderGradient
                                containerClassName="rounded-full w-full"
                                as="button"
                                onClick={() => navigate('/contact')}
                                className="bg-black text-white flex justify-center items-center space-x-2 py-5 px-8 w-full text-sm font-bold uppercase tracking-widest"
                            >
                                <span className="pt-0.5">{plan.cta}</span>
                            </HoverBorderGradient>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-4">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3 group">
                                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary transition-colors">
                                        <Check className="w-3 h-3 text-primary group-hover:text-primary-foreground" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Note */}
            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    {pricingData.footer_note}
                    <button onClick={() => navigate('/contact/demo')} className="text-primary font-bold hover:underline ml-1">
                        {pricingData.footer_cta}
                    </button>
                </p>
            </div>
        </CinematicSection>
    );
}

// EmmiLogo can be kept or removed if not used. It was likely for decoration but I'll leave it out if not needed to keep it clean.
