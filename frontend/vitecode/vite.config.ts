import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@landing": path.resolve(__dirname, "./src/system/landing"),
      "@app": path.resolve(__dirname, "./src/system/app"),
      "@system": path.resolve(__dirname, "./src/system/system"),
      "@values": path.resolve(__dirname, "./src/values"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-gsap': ['gsap'],
          'vendor-icons': ['lucide-react'],
          'vendor-ui': ['framer-motion', 'recharts']
        }
      }
    }
  }
}));
