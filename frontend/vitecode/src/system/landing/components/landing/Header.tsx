import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@landing/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { branding } from "@/values/config/branding"

const navLinks = [
    { label: "Produto", href: "#produto" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Preços", href: "/pricing" },
    ...(branding.appStoreUrl || branding.playStoreUrl ? [{ label: "Aplicativo", href: "#download" }] : []),
    { label: "Contato", href: "/contact" },
    { label: "Ajuda", href: "/help" },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#") || href.startsWith("/#")) {
            e.preventDefault()
            const targetId = href.includes("#") ? href.split("#")[1] : ""
            if (!targetId) return

            if (window.location.pathname !== "/") {
                navigate("/", { state: { scrollTo: targetId } })
            } else {
                const element = document.getElementById(targetId)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }
            setMobileMenuOpen(false)
        }
    }

    const handleLogoClick = (e: React.MouseEvent) => {
        if (window.location.pathname !== "/") {
            window.scrollTo(0, 0)
        } else {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
        setMobileMenuOpen(false)
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
            <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 group">
                    <img
                        src={branding.logo}
                        alt={`Logo ${branding.name}`}
                        className="h-9 w-auto object-contain rounded-md transition-transform group-hover:scale-105"
                        width="150"
                        height="36"
                        fetchpriority="high"
                    />
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        {branding.name}
                    </span>
                </Link>

                {/* Center Nav */}
                <div className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link) => (
                        link.href.startsWith("/") && !link.href.includes("#") ? (
                            <Link
                                key={link.label}
                                to={link.href}
                                className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <a
                                key={link.label}
                                href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                                onClick={(e) => handleLinkClick(e, link.href)}
                                className="rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        )
                    ))}
                </div>

                {/* Right */}
                <div className="hidden items-center gap-3 lg:flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors mr-2"
                    >
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => navigate('/contact/demo')}
                        className="rounded-lg bg-foreground text-background hover:bg-foreground/90 text-[13px] font-medium px-4 h-8 transition-colors"
                    >
                        Começar Agora
                    </Button>
                    <Link to={branding.loginRoute} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                        Login
                    </Link>
                </div>

                {/* Mobile toggle */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </Button>
                    <button
                        type="button"
                        className="text-foreground p-1"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="border-t border-border bg-background lg:hidden transition-colors duration-300">
                    <div className="flex flex-col gap-1 px-6 py-4">
                        {navLinks.map((link) => (
                            link.href.startsWith("/") && !link.href.includes("#") ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href.startsWith("#") ? `/${link.href}` : link.href}
                                    onClick={(e) => handleLinkClick(e, link.href)}
                                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                        <div className="mt-3 flex flex-col gap-2">

                            <Button
                                onClick={() => { navigate('/contact/demo'); setMobileMenuOpen(false); }}
                                className="rounded-lg bg-foreground text-background hover:bg-foreground/90 text-sm font-medium w-full transition-colors"
                            >
                                Começar Agora
                            </Button>
                            <Link to={branding.loginRoute} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
