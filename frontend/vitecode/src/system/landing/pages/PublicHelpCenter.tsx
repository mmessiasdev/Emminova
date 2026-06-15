import { PlayCircle, Tv, MonitorPlay, MessageSquare, Info, ShieldCheck, Check } from "lucide-react"
import { PublicLayout } from "@landing/components/layout/PublicLayout"
import { Button } from "@landing/components/ui/button"
import { useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"
import helpData from "@values/data/help.json"

const iconMap: Record<string, React.ElementType> = {
    Info,
    PlayCircle,
    Tv,
    MonitorPlay,
    MessageSquare,
    ShieldCheck,
    Check
};

export default function PublicHelpCenter() {
    const navigate = useNavigate()

    const parseText = (text: string) => {
        return text.replace(/{branding\.name}/g, branding.name);
    }

    return (
        <PublicLayout>
            <section className="pt-32 pb-32 max-w-[1400px] mx-auto px-6">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        {helpData.header.title}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        {helpData.header.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {helpData.guides.map((guide) => {
                        const Icon = iconMap[guide.icon] || Info;
                        return (
                            <div key={guide.title} className="p-8 rounded-3xl border border-white/5 bg-secondary/30 backdrop-blur-xl hover:border-primary/20 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{guide.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{guide.description}</p>
                                <ul className="space-y-3">
                                    {guide.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-muted-foreground">
                                            <div className="mt-1 w-4 h-4 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-white/5">
                                                {i + 1}
                                            </div>
                                            {parseText(step)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    })}
                </div>

                <div className="p-10 rounded-3xl border border-primary/20 bg-primary/5 mb-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                    <div className="relative">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            {helpData.faq.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {helpData.faq.items.map((issue) => {
                                const Icon = iconMap[issue.icon] || Info;
                                return (
                                    <div key={issue.title} className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <h4 className="font-bold">{issue.title}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                            {parseText(issue.solution)}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="text-center p-16 rounded-3xl bg-secondary/20 border border-white/5">
                    <h2 className="text-2xl font-bold mb-4">{helpData.support.title}</h2>
                    <p className="text-muted-foreground mb-8">{helpData.support.description}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {helpData.support.buttons.map((btn, idx) => {
                            if (btn.type === "navigate") {
                                return (
                                    <Button key={idx} onClick={() => navigate(btn.path)} className="rounded-xl px-8 focus:ring-primary shadow-xl shadow-primary/10"> 
                                        {btn.label} 
                                    </Button>
                                )
                            }
                            if (btn.type === "whatsapp") {
                                const Icon = iconMap[btn.icon] || MessageSquare;
                                return (
                                    <a
                                        key={idx}
                                        href={branding.contact.whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-8 py-2 rounded-xl border border-border hover:bg-white/5 transition-colors font-medium text-sm"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {btn.label}
                                    </a>
                                )
                            }
                            return null;
                        })}
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
