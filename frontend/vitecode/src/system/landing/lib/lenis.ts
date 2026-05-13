import Lenis from "@studio-freight/lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

let lenisInstance: Lenis | null = null;

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance;
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    lerp: 0.12,
    duration: 1.2,
    smoothWheel: true,
  });

  // Enable ScrollTrigger normalization to prevent jumps
  ScrollTrigger.normalizeScroll(true);

  // Connect Lenis scroll events to GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // Use GSAP ticker instead of manual RAF for better synchronization
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

export function destroySmoothScroll() {
  if (!lenisInstance) return;
  lenisInstance.destroy();
  lenisInstance = null;
}
