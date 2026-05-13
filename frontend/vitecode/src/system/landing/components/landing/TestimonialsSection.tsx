import { branding } from "@/values/config/branding"
import testimonialsData from "@values/data/testimonials.json"

const formatText = (text: string) => {
    return text.replace(/{brandingName}/g, branding.name)
}


export function TestimonialsSection() {
    if (!testimonialsData.items || testimonialsData.items.length === 0) return null

    return (
        <section id="depoimentos" className="py-12 lg:py-20 bg-transparent overflow-hidden">
            <div className="mx-auto max-w-[1400px] px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        O que nossos clientes dizem
                    </h2>
                </div>

                {/* Testimonial bento grid */}
                <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonialsData.items.map((testimonial: any) => (
                        <div
                            key={testimonial.name}
                            className="flex flex-col justify-between rounded-2xl border border-border bg-secondary p-8"
                        >
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {`"${formatText(testimonial.quote)}"`}
                            </p>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-xs font-bold text-foreground">
                                    {testimonial.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {testimonial.role}, {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Highlight card - larger */}
                    <div className="md:col-span-2 lg:col-span-3 overflow-hidden rounded-2xl border border-border bg-secondary">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="flex flex-col justify-center p-8 lg:p-12">
                                <p className="text-xl font-semibold leading-snug text-foreground lg:text-2xl">
                                    {`"${formatText(testimonialsData.highlight.quote)}"`}
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-xs font-bold text-foreground">
                                        RL
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{testimonialsData.highlight.name}</p>
                                        <p className="text-xs text-muted-foreground">{testimonialsData.highlight.role}, {testimonialsData.highlight.company}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center bg-card p-4 lg:p-6 overflow-hidden">
                                {testimonialsData.highlight.dashboard_image ? (
                                    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border/50 shadow-2xl skew-x-[-2deg] skew-y-[2deg] hover:skew-x-0 hover:skew-y-0 transition-transform duration-700 ease-out">
                                        <img
                                            src={testimonialsData.highlight.dashboard_image}
                                            alt="Dashboard Preview"
                                            className="w-full h-auto object-cover transform scale-110 hover:scale-100 transition-transform duration-700"
                                            loading="lazy"
                                            width="800"
                                            height="600"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <span className="text-xs">Dashboard Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
