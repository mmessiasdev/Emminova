import { MessageSquare } from "lucide-react"
import { branding } from "@/values/config/branding"

export function ContactHero() {
    return (
        <section className="pt-32 pb-20 max-w-[1400px] mx-auto px-6 bg-background">
            <div className="animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-balance">
                    Vamos conversar
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
                    Tem dúvidas sobre nossa plataforma? Quer conhecer mais sobre nosso gerenciador de telas?
                    Nossa equipe está pronta para ajudar!
                </p>
                <div className="flex flex-wrap gap-4">
                    <a
                        href={branding.contact.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#25D366] text-white font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#25D366]/20"
                    >
                        <MessageSquare className="w-5 h-5 fill-current" />
                        Falar via WhatsApp
                    </a>
                </div>
            </div>
        </section>
    )
}
