"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LoopVideoProps = {
  /** File stem in /public/video, e.g. "hero-loop". */
  name: string;
  /** Load and start right away (first viewport) instead of when scrolled near. */
  eager?: boolean;
  className?: string;
  controlClassName?: string;
};

/**
 * A silent background loop. The poster is a plain image underneath, so it is what shows
 * before the video starts, when it is paused, and for visitors who prefer reduced motion
 * (the video itself is hidden by CSS for them). It only plays while on screen.
 */
export function LoopVideo({ name, eager = false, className, controlClassName }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const pausedByUser = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    setMotionOk(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pausedByUser.current) {
          if (video.preload === "none") video.preload = "auto";
          video.play().catch(() => setPaused(true));
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      pausedByUser.current = false;
      video.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      pausedByUser.current = true;
      video.pause();
      setPaused(true);
    }
  };

  const poster = `/video/${name}-poster.webp`;
  return (
    <>
      <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" width={1920} height={1080} fetchPriority={eager ? "high" : undefined} className="absolute inset-0 h-full w-full object-cover" />
        <video
          ref={ref}
          className="loop-video absolute inset-0 h-full w-full object-cover"
          poster={poster}
          autoPlay={eager}
          muted
          loop
          playsInline
          preload={eager ? "auto" : "none"}
          disablePictureInPicture
          tabIndex={-1}
        >
          <source src={`/video/${name}.webm`} type="video/webm" />
          <source src={`/video/${name}.mp4`} type="video/mp4" />
        </video>
      </div>
      {motionOk && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play background video" : "Pause background video"}
          className={cn(
            "absolute z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-fg/70 shadow-soft ring-1 ring-line backdrop-blur transition-colors hover:text-fg",
            controlClassName,
          )}
        >
          <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
            {paused ? <path d="M5 3.5v9l7.5-4.5z" /> : <path d="M4.5 3.5h2.25v9H4.5zM9.25 3.5h2.25v9H9.25z" />}
          </svg>
        </button>
      )}
    </>
  );
}
