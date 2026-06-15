import { Clock3, MessageSquare, MonitorPlay, Sparkles } from 'lucide-react'
import { ContactForm } from '@landing/components/landing/ContactForm'
import { PublicLayout } from '@landing/components/layout/PublicLayout'
import { branding } from '@/values/config/branding'

const whatsappTestLink = `${branding.contact.whatsappLink}?text=Ola!%20Quero%20solicitar%20um%20teste%20do%20sistema%20${branding.name}.`

const DemoContactPage = () => {
    return (
        <PublicLayout>
            <section className="pt-32 pb-16 max-w-[1400px] mx-auto px-6 bg-background">
                <div className="max-w-4xl">


                    <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight text-balance">
                        Solicite um teste do {branding.name}
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                        Preencha o formulario para solicitar um teste da plataforma. Vamos entender seu cenario e
                        entrar em contato com os proximos passos.
                    </p>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <MonitorPlay className="h-4 w-4" />
                                Cenario real
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Teste focado na sua necessidade: tipo de conteudo, numero de telas e rotina de publicacao.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Clock3 className="h-4 w-4" />
                                Retorno rapido
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Assim que recebermos seu contato, nosso time retorna para alinhar o teste do sistema.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-secondary/40 p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <MessageSquare className="h-4 w-4" />
                                WhatsApp direto
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Se preferir, voce pode solicitar o teste agora pelo WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 pb-32">
                <ContactForm
                    title="Solicite seu teste via email"
                    submitLabel="Encaminhar email"
                    successTitle="Solicitacao enviada com sucesso!"
                    successDescription="Recebemos seu pedido de teste. Nossa equipe vai entrar em contato em breve."
                    messagePlaceholder="Fale sobre sua empresa, quantidade de telas e como voce pretende usar o sistema..."
                    defaultMessage={`Quero solicitar um teste do sistema ${branding.name} para minha empresa.`}
                />

                <div className="mt-8">
                    <a
                        href={whatsappTestLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Quero solicitar via whatsapp
                    </a>
                </div>
            </div>
        </PublicLayout>
    )
}

export default DemoContactPage
