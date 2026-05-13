import { useState } from 'react'
import { Button } from '@landing/components/ui/button'
import { branding } from '@/values/config/branding'

interface ContactFormProps {
    title?: string
    submitLabel?: string
    successTitle?: string
    successDescription?: string
    messagePlaceholder?: string
    defaultMessage?: string
}

export function ContactForm({
    title = 'Envie-nos uma mensagem',
    submitLabel = 'Enviar Mensagem',
    successTitle = 'Mensagem enviada com sucesso! ✓',
    successDescription = 'Obrigado por entrar em contato. Nossa equipe responderá em breve.',
    messagePlaceholder = 'Conte-nos sobre sua necessidade...',
    defaultMessage = '',
}: ContactFormProps) {
    const emptyFormData = {
        name: '',
        email: '',
        company: '',
        phone: '',
        message: defaultMessage,
    }

    const [formData, setFormData] = useState(emptyFormData)
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("https://formsubmit.co/ajax/d5b273e751d063229cd41db6cd050d78", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    _subject: `Formulário ${branding.name}: ${formData.company || formData.name}`,
                    _template: "table"
                })
            });

            if (response.ok) {
                setSubmitted(true)
                setFormData(emptyFormData)
                setTimeout(() => setSubmitted(false), 5000)
            } else {
                throw new Error("Erro na resposta do servidor");
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div data-scroll-animate className="scroll-fade-in bg-background p-8 rounded-2xl border border-border">
            <h2 className="text-3xl font-bold mb-8">{title}</h2>

            {submitted ? (
                <div className="animate-fade-in-up bg-secondary/50 border border-border rounded-xl p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">{successTitle}</h3>
                    <p className="text-muted-foreground">{successDescription}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <label className="block text-sm font-medium mb-2">Nome *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Seu nome"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="seu@email.com"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <label className="block text-sm font-medium mb-2">Empresa</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Sua empresa"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <label className="block text-sm font-medium mb-2">Telefone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(11) 9xxxx-xxxx"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <label className="block text-sm font-medium mb-2">Mensagem *</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder={messagePlaceholder}
                            rows={6}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        />
                    </div>

                    <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 text-base font-semibold py-3 rounded-lg transition-all disabled:opacity-70"
                        >
                            {loading ? 'Enviando...' : submitLabel}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        * Campos obrigatórios. Responderemos em até 24 horas.
                    </p>
                </form>
            )}
        </div>
    )
}
