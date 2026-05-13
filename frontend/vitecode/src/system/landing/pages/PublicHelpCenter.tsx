import { PlayCircle, Tv, MonitorPlay, MessageSquare, Info, ShieldCheck, Check } from "lucide-react"
import { PublicLayout } from "@landing/components/layout/PublicLayout"
import { Button } from "@landing/components/ui/button"
import { useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"

const guides = [
    {
        title: "Primeiros Passos",
        description: "Tudo o que você precisa saber para começar.",
        icon: Info,
        steps: [
            "Entre na sua conta no painel administrativo.",
            "Cadastre sua primeira TV usando o código de pareamento.",
            "Faça o upload dos seus primeiros conteúdos (vídeos, imagens ou links)."
        ]
    },
    {
        title: "Suporte YouTube & Web",
        description: "Transmita vídeos e portais em tempo real.",
        icon: PlayCircle,
        steps: [
            "Em 'Conteúdos', escolha 'Link Externo'.",
            "Cole a URL do vídeo do YouTube ou do site desejado.",
            "O sistema carregará o conteúdo via iframe ou player nativo."
        ]
    },
    {
        title: "Publicação na TV",
        description: "Sincronize sua TV com um código único.",
        icon: Tv,
        steps: [
            `Baixe o app ${branding.name} na sua Android TV ou TV Box.`,
            "Abra o app e anote o código exibido na tela.",
            "No painel web, clique em 'Nova TV' e digite o código."
        ]
    }
]

const commonIssues = [
    {
        title: "Minha TV está offline",
        icon: MonitorPlay,
        solution: "Verifique a conexão com a internet. O player continuará rodando os conteúdos já baixados (Offline-First), mas precisa de rede para novas atualizações."
    },
    {
        title: "Vídeos travando",
        icon: PlayCircle,
        solution: "Certifique-se de que o codec é compatível (recomendamos H.264/H.265). Vídeos com profundidade de cor de 10-bit podem não rodar em dispositivos mais simples."
    }
]

export default function PublicHelpCenter() {
    const navigate = useNavigate()

    return (
        <PublicLayout>
            <section className="pt-32 pb-32 max-w-[1400px] mx-auto px-6">
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Central de Ajuda
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Encontre guias passo a passo e resolva problemas comuns de forma rápida.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {guides.map((guide) => (
                        <div key={guide.title} className="p-8 rounded-3xl border border-white/5 bg-secondary/30 backdrop-blur-xl hover:border-primary/20 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                                <guide.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{guide.title}</h3>
                            <p className="text-sm text-muted-foreground mb-6">{guide.description}</p>
                            <ul className="space-y-3">
                                {guide.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-xs text-muted-foreground">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-white/5">
                                            {i + 1}
                                        </div>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="p-10 rounded-3xl border border-primary/20 bg-primary/5 mb-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                    <div className="relative">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            Soluções Rápidas & FAQ
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {commonIssues.map((issue) => (
                                <div key={issue.title} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5">
                                            <issue.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <h4 className="font-bold">{issue.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                        {issue.solution}
                                    </p>
                                </div>
                            ))}

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <PlayCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <h4 className="font-bold">O sistema funciona sem internet?</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                    Sim! O {branding.name} é Offline-First. Uma vez que o conteúdo é baixado pelo player, ele continuará rodando mesmo se a conexão cair. A internet é necessária apenas para receber novos conteúdos ou atualizações.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <Tv className="w-5 h-5 text-primary" />
                                    </div>
                                    <h4 className="font-bold">Quais TVs são compatíveis?</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                                    Qualquer TV com sistema Android TV (Sony, TCL, Philips) ou qualquer TV comum utilizando um TV Box Android (Xiaomi Mi Box, Fire TV Stick, etc).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center p-16 rounded-3xl bg-secondary/20 border border-white/5">
                    <h2 className="text-2xl font-bold mb-4">Ainda precisa de ajuda?</h2>
                    <p className="text-muted-foreground mb-8">Nossa equipe de suporte técnico está disponível via WhatsApp e E-mail.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button onClick={() => navigate('/contact')} className="rounded-xl px-8 focus:ring-primary shadow-xl shadow-primary/10"> Falar com Suporte </Button>
                        <a
                            href={branding.contact.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-2 rounded-xl border border-border hover:bg-white/5 transition-colors font-medium text-sm"
                        >
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp Suporte
                        </a>
                    </div>
                </div>
            </section>
        </PublicLayout>
    )
}
