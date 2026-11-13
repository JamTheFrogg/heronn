"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type LandingRevealProps = {
  children: React.ReactNode;
};

export function LandingReveal({ children }: LandingRevealProps) {
  const [animateLogo, setAnimateLogo] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [typed, setTyped] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  const fullText = "WORTOX.AI";

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setAnimateLogo(true);
      setTimeout(() => setShrink(true), 500);
    }, 1000);

    const typeTimer = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        idx += 1;
        setTyped(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setHidden(true), 500);
          }, 1000);
        }
      }, 100);
    }, 1500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(typeTimer);
    };
  }, []);

  return (
    <div className="relative">
      {!hidden && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000",
            fadeOut && "opacity-0"
          )}
          style={{ backgroundColor: "rgb(245 243 240)" }}
        >
          <div className="flex flex-col items-start">
            <div
              className={cn(
                "transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform",
                shrink
                  ? "duration-[1500ms] scale-[0.8]"
                  : animateLogo
                    ? "duration-[1000ms] translate-x-0 scale-[1.32]"
                    : "duration-[420ms] translate-x-0 scale-[1.24]"
              )}
            >
              <Image
                src="/images/landing-logo.svg"
                alt="wortox.ai"
                width={420}
                height={420}
                priority
              />
            </div>
            <div className="h-12 w-[280px] flex items-start">
              <p className="whitespace-nowrap text-5xl font-semibold uppercase tracking-[0.35em] text-primary">
                {typed}
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        className={cn(
          "transition-opacity duration-1000",
          hidden ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

