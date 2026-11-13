import { LoopVideo } from "./LoopVideo";
import { buttonPrimary } from "./Section";

export function FinalCTA() {
  return (
    <section id="contact" className="relative isolate overflow-hidden">
      <LoopVideo name="ambient-loop" className="-z-20" controlClassName="bottom-6 right-5 sm:right-8" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(var(--color-bg))_0%,rgb(var(--color-bg)/0.55)_30%,rgb(var(--color-bg)/0.55)_75%,rgb(var(--color-bg)/0.9)_100%)]"
      />
      <div className="mx-auto flex max-w-page flex-col items-center px-5 py-32 text-center sm:px-8 md:py-48">
        <h2 className="max-w-[18ch] font-display text-display-lg font-semibold text-fg">
          Want the shortest path from landing to buying in your store?
        </h2>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-fg/80">
          Wortox AI is a custom build, so there is no list price. Tell us about your catalogue and we will tell you what
          it would take.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <a href="mailto:faris@saaisolutions.com" className={buttonPrimary}>
            Talk to us
          </a>
          <a
            href="mailto:faris@saaisolutions.com"
            className="text-[15px] text-fg/75 underline decoration-fg/25 underline-offset-[6px] transition-colors hover:text-fg hover:decoration-primary"
          >
            faris@saaisolutions.com
          </a>
        </div>
      </div>
    </section>
  );
}
