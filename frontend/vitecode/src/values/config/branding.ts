export const branding = {
  name: "Emminova",
  defaultTheme: "light",
  moleculesColor: "#70D9F7",
  logo: "/images/branding/logo.png", // Fallback if env is missing
  loginRoute: "/login",
  appStoreUrl: "",
  playStoreUrl: "https://play.google.com/apps/testing/com.emminova.EmmiChat",
  colors: {
    // Light Mode (from :root in index.css)
    light: {
      background: "210 20% 98%",
      foreground: "222 47% 11%",
      primary: "#70D9F7", // Bright Blue
      secondary: "#cedeff",
      accent: "210 20% 90%",
      muted: "210 20% 94%",
      destructive: "0 84% 60%",
      success: "142 71% 45%",
      warning: "38 92% 50%",
      border: "214 32% 91%",
    },
    // Dark Mode (from .dark in index.css)
    dark: {
      background: "#000000",
      foreground: "0 0% 100%",
      primary: "#70D9F7", // Pure White in dark mode as per index.css
      secondary: "#cedeff",
      accent: "216 100% 50%", // Electric Blue
      muted: "0 0% 8%",
      border: "0 0% 10%",
    },
    // Custom gradients and special colors
    gradients: {
      primary: "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
      glow: "0 0 20px rgba(59, 130, 246, 0.2)",
    }
  },
  contact: {
    email: "emminovacorporate@gmail.com",
    whatsapp: "+55 77 9105-7040",
    whatsappLink: "https://wa.me/557791057040",
  }
};
