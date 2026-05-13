import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSmoothScroll } from "@landing/lib/lenis.ts";

// Enable Lenis smooth scroll + ScrollTrigger proxy once.
initSmoothScroll();

createRoot(document.getElementById("root")!).render(<App />);
