import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Cleanup = () => void;

export function useGsapLanding() {
  useEffect(() => {
    const revealEls = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const parallaxEls = gsap.utils.toArray<HTMLElement>("[data-parallax]");
    const timelines: Cleanup[] = [];

    revealEls.forEach((el) => {
      const dir = el.dataset.reveal || "bottom";
      const delay = Number(el.dataset.revealDelay || 0);
      const base: gsap.TweenVars = { opacity: 0 };
      if (dir === "left") base.x = -40;
      else if (dir === "right") base.x = 40;
      else if (dir === "scale") base.scale = 0.9;
      else base.y = 40;

      const tween = gsap.fromTo(
        el,
        base,
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          ease: "power3.out",
          duration: 0.9,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        }
      );
      timelines.push(() => tween.scrollTrigger?.kill());
    });

    parallaxEls.forEach((el) => {
      const strength = Number(el.dataset.parallax || 60);
      const tween = gsap.to(el, {
        y: () => -strength,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      timelines.push(() => tween.scrollTrigger?.kill());
    });

    return () => {
      timelines.forEach((kill) => kill());
    };
  }, []);
}
