import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/system/system/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@landing": path.resolve(__dirname, "./src/system/landing"),
      "@system": path.resolve(__dirname, "./src/system/system"),
      "@values": path.resolve(__dirname, "./src/values"),
    },
  },
});
