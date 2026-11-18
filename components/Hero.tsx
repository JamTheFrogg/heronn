import { LoopVideo } from "./LoopVideo";
import { buttonPrimary, buttonQuiet } from "./Section";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden md:min-h-[min(100svh,960px)]">
      <LoopVideo name="hero-loop" eager className="-z-20" controlClassName="bottom-6 right-5 sm:right-8" />
      {/* Scrim: a soft wash of the page ground behind the copy, fading out to the right and into the next section. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(var(--color-bg)/0.82)_0%,rgb(var(--color-bg)/0.9)_55%,rgb(var(--color-bg))_100%)] md:bg-[linear-gradient(90deg,rgb(var(--color-bg)/0.96)_0%,rgb(var(--color-bg)/0.88)_38%,rgb(var(--color-bg)/0)_72%),linear-gradient(180deg,rgb(var(--color-bg)/0)_70%,rgb(var(--color-bg))_100%)]"
      />
      <div className="mx-auto w-full max-w-page px-5 pb-20 pt-32 sm:px-8 md:pb-24 md:pt-36">
        <div className="max-w-[40rem]">
          <h1 className="settle font-display text-display-xl font-semibold text-fg">
            <span className="sr-only">Wortox AI: </span>
            The buyer&rsquo;s words are the&nbsp;filter.
          </h1>
          <p className="settle mt-7 max-w-[52ch] text-lg leading-relaxed text-fg/80 [animation-delay:120ms] md:text-xl md:leading-relaxed">
            Wortox AI is an e-commerce platform where categories, products and the store itself adapt on the fly. A
            shopper writes what they need and the store builds the matching category page, instead of sending them
            through menus and filters.
          </p>
          <div className="settle mt-10 flex flex-wrap items-center gap-3 [animation-delay:220ms]">
            <a href="#demo" className={buttonPrimary}>
              Try the demo
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
              </svg>
            </a>
            <a href="mailto:faris@saaisolutions.com" className={buttonQuiet}>
              Talk to us
            </a>
          </div>
          <p className="settle mt-10 text-sm text-muted [animation-delay:320ms]">
            The first store on Wortox sells professional security and surveillance gear.
          </p>
        </div>
      </div>
    </section>
  );
}
