import { branding } from "@/values/config/branding";
import downloadData from "@/values/data/download.json";
import { Button } from "@landing/components/ui/button";

export function DownloadSection() {
    const hasAppStore = Boolean(branding.appStoreUrl && branding.appStoreUrl.trim() !== "");
    const hasPlayStore = Boolean(branding.playStoreUrl && branding.playStoreUrl.trim() !== "");

    if (!hasAppStore && !hasPlayStore) {
        return null;
    }

    return (
        <section id="download" className="py-24 relative overflow-hidden flex justify-center selection:bg-primary/30">
            {/* Background elements */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-70 mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-70 mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

            <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10 flex flex-col items-center">
                <div className="max-w-3xl border border-border/40 bg-background/60 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                        <span className="text-[13px] font-semibold tracking-wide uppercase">App Disponível</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                        {downloadData.title.replace("{brandingName}", branding.name)}
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                        {downloadData.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center relative z-20">
                        {hasAppStore && (
                            <Button
                                asChild
                                size="lg"
                                className="h-16 px-8 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 gap-4 overflow-hidden group/btn hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-1 border border-border"
                            >
                                <a href={branding.appStoreUrl} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-8 h-8 transition-transform duration-500 group-hover/btn:scale-110 group-hover/btn:-rotate-2" fill="currentColor">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                    </svg>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[10px] leading-[1] font-semibold opacity-70 tracking-wide mt-[2px]">Baixar na</span>
                                        <span className="text-[22px] leading-[1.1] font-bold">App Store</span>
                                    </div>
                                </a>
                            </Button>
                        )}

                        {hasPlayStore && (
                            <Button
                                asChild
                                size="lg"
                                className="h-16 px-8 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 gap-4 overflow-hidden group/btn hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-1 border border-border"
                            >
                                <a href={branding.playStoreUrl} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-[30px] h-[30px] transition-transform duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-2" fill="currentColor">
                                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                    </svg>
                                    <div className="flex flex-col items-start text-left ml-1">
                                        <span className="text-[10px] leading-[1] font-semibold opacity-70 tracking-wide uppercase mt-[2px]">Disponível no</span>
                                        <span className="text-[20px] leading-[1.1] font-bold">Google Play</span>
                                    </div>
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
