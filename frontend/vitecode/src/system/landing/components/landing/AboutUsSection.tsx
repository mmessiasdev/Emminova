import { Linkedin, Instagram, MessageCircle, Mail, Globe } from 'lucide-react';
import { branding } from '@/values/config/branding';
import aboutUsData from '@values/data/aboutus.json';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, React.ElementType> = {
    Linkedin,
    Instagram,
    MessageCircle,
    Mail,
    Globe,
};

const formatText = (text: string) => {
    return text.replace(/{brandingName}/g, branding.name);
};

export function AboutUsSection() {
    const { title, subtitle, description, image, socialLinks } = aboutUsData;

    return (
        <section id="aboutus" className="py-12 lg:py-20 bg-transparent overflow-hidden">
            <div className="mx-auto max-w-[1400px] px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 tracking-wider uppercase">
                            {subtitle}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            {formatText(title)}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-8">
                            {formatText(description)}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((link: any) => {
                                const Icon = ICON_MAP[link.icon];
                                if (!Icon) return null;
                                return (
                                    <a
                                        key={link.label}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors duration-300 text-sm font-medium"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                            <img
                                src={image}
                                alt={formatText(title)}
                                className="w-full h-full object-cover aspect-square"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-background/20 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
