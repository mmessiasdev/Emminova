import { cn } from "@landing/lib/utils";
import { ReactNode, forwardRef } from "react";

interface CinematicSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  noReveal?: boolean;
}

// Minimal wrapper: only carries data attributes for GSAP triggers, no visual layers
export const CinematicSection = forwardRef<HTMLElement, CinematicSectionProps>(
  ({ children, className, id, noReveal }, ref) => {
    return (
      <section ref={ref} id={id} className={cn("relative", className)}>
        <div className="relative z-10" data-reveal={noReveal ? undefined : "bottom"}>
          {children}
        </div>
      </section>
    );
  }
);

CinematicSection.displayName = "CinematicSection";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right" | "scale";
}

export function Reveal({ children, delay = 0, className, from = "bottom" }: RevealProps) {
  return (
    <div
      className={className}
      data-reveal={from}
      data-reveal-delay={delay}
    >
      {children}
    </div>
  );
}

interface ParallaxMediaProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function ParallaxMedia({ children, className, strength = 60 }: ParallaxMediaProps) {
  return (
    <div className={className} data-parallax={strength}>
      {children}
    </div>
  );
}
