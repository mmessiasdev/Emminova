import { Link, useLocation, useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"


export function Footer() {
    const navigate = useNavigate()
    const location = useLocation()

    const handleSectionClick = (sectionId: string) => {
        if (location.pathname !== "/") {
            navigate("/", { state: { scrollTo: sectionId } })
            return
        }

        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    const sectionLinkClass = "text-[13px] text-muted-foreground transition-colors hover:text-foreground"

    return (
        <footer className="border-t border-border py-12 bg-background">
            <div className="mx-auto max-w-[1400px] px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src={branding.logo}
                                alt={`Logo ${branding.name}`}
                                className="h-8 w-auto object-contain rounded-md"
                                loading="lazy"
                                width="150"
                                height="32"
                            />
                            <span className="text-base font-semibold tracking-tight text-foreground">
                                {branding.name}
                            </span>
                        </Link>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-medium text-foreground">Produto</h3>
                        <ul className="mt-4 flex flex-col gap-3">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleSectionClick("funcionalidades")}
                                    className={`${sectionLinkClass} bg-transparent border-0 p-0 text-left`}
                                >
                                    Funcionalidades
                                </button>
                            </li>
                            <li>
                                <Link to="/pricing" className={sectionLinkClass}>Preços</Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => handleSectionClick("como-funciona")}
                                    className={`${sectionLinkClass} bg-transparent border-0 p-0 text-left`}
                                >
                                    Como Funciona
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-medium text-foreground">Recursos</h3>
                        <ul className="mt-4 flex flex-col gap-3">
                            <li>
                                <Link to="/help" className={sectionLinkClass}>Central de Ajuda</Link>
                            </li>
                            <li>
                                <Link to="/contact" className={sectionLinkClass}>Suporte</Link>
                            </li>
                            <li>
                                <Link to="/contact/demo" className={sectionLinkClass}>Solicitar Demo</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-medium text-foreground">Empresa</h3>
                        <ul className="mt-4 flex flex-col gap-3">
                            <li>
                                <Link to="/contact" className={sectionLinkClass}>Contato</Link>
                            </li>
                            <li>
                                <Link to="/pricing" className={sectionLinkClass}>Preços</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-medium text-foreground">Contato</h3>
                        <ul className="mt-4 flex flex-col gap-3">
                            <li>
                                <a href={`mailto:${branding.contact.email}`} className={sectionLinkClass}>
                                    {branding.contact.email}
                                </a>
                            </li>
                            <li>
                                <a href={branding.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className={sectionLinkClass}>
                                    WhatsApp Suporte
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                    <p className="text-[13px] text-muted-foreground">
                        Copyright 2026 {branding.name}. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-5 text-[13px]">
                        <Link to="/contact" className={sectionLinkClass}>Contato</Link>
                        <Link to="/contact/demo" className={sectionLinkClass}>Demo Especial</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
