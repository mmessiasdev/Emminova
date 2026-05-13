import { branding } from "@/values/config/branding"
import socialData from "@values/data/social-proof.json"

export function SocialProof() {
    if (!socialData.companies || socialData.companies.length === 0) return null

    const title = socialData.title?.replace(/{brandingName}/g, branding.name) || `Empresas que confiam no ${branding.name}`

    return (
        <section className="py-12 lg:py-16 bg-background/50 border-y border-border/50">
            <div className="mx-auto max-w-[1400px] px-6">
                <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-10 font-bold">
                    {title}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-20 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    {socialData.companies.map((company: any) => (
                        <div key={company.name} className="flex items-center justify-center">
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className={`${company.width || 'h-6'} w-auto object-contain`}
                                    loading="lazy"
                                    width="120"
                                    height="24"
                                />
                            ) : (
                                <span className="text-sm font-bold tracking-tight text-muted-foreground/60 uppercase">
                                    {company.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
