import { Link, useLocation, useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"
import footerData from "@values/data/footer.json"

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

    const parseText = (text: string) => {
        return text
            .replace(/{branding\.name}/g, branding.name)
            .replace(/{branding\.contact\.email}/g, branding.contact.email)
            .replace(/{branding\.contact\.whatsappLink}/g, branding.contact.whatsappLink);
    }

    const renderLink = (link: any, idx: number) => {
        if (link.type === "scroll") {
            return (
                <li key={idx}>
                    <button
                        type="button"
                        onClick={() => handleSectionClick(link.target)}
                        className={`${sectionLinkClass} bg-transparent border-0 p-0 text-left`}
                    >
                        {parseText(link.label)}
                    </button>
                </li>
            )
        }
        if (link.type === "navigate") {
            return (
                <li key={idx}>
                    <Link to={parseText(link.target)} className={sectionLinkClass}>{parseText(link.label)}</Link>
                </li>
            )
        }
        if (link.type === "href") {
            return (
                <li key={idx}>
                    <a 
                        href={parseText(link.target)} 
                        className={sectionLinkClass}
                        {...(link.blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                        {parseText(link.label)}
                    </a>
                </li>
            )
        }
        return null;
    }

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

                    {footerData.columns.map((col, cIdx) => (
                        <div key={cIdx}>
                            <h3 className="text-[13px] font-medium text-foreground">{col.title}</h3>
                            <ul className="mt-4 flex flex-col gap-3">
                                {col.links.map((link, lIdx) => renderLink(link, lIdx))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                    <p className="text-[13px] text-muted-foreground">
                        {parseText(footerData.bottom.copyright)}
                    </p>
                    <div className="flex items-center gap-5 text-[13px]">
                        {footerData.bottom.links.map((link, idx) => (
                            <Link key={idx} to={parseText(link.target)} className={sectionLinkClass}>
                                {parseText(link.label)}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
