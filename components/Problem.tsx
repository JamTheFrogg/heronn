/* The storefront band: the first store's products, large, with the case for removing steps. */
const principles = [
  {
    title: "Intent over keywords",
    copy: "Search should understand sentences, not just words, and run inside the store, with no outside widget adding delay.",
  },
  {
    title: "Speed is a budget",
    copy: "Wortox keeps one for the page and for the whole path to the cart: no plugins nobody can tune, nothing it does not need.",
  },
  {
    title: "The store owns everything",
    copy: "The infrastructure and the data belong to the store, with no black boxes and no plugin lock\u2011in.",
  },
];

export function ProblemSection() {
  return (
    <section id="why" className="relative bg-studio">
      <div className="relative mx-auto max-w-[1600px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/hero-family.webp"
          alt="Sample products from a security store: a bullet camera, an indoor cube camera, a solar camera, a dome camera and a video doorbell."
          width={2400}
          height={1350}
          loading="lazy"
          decoding="async"
          className="fade-edges aspect-[6/5] w-full object-cover object-[96%_50%] sm:aspect-[16/10] sm:object-[80%_50%] lg:aspect-[2/1] lg:object-center"
        />
        <div className="mx-auto max-w-page px-5 sm:px-8 lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="relative -mt-4 max-w-[34rem] space-y-6 sm:-mt-10 lg:mt-0 lg:w-[38%] lg:max-w-none">
            <h2 className="font-display text-[clamp(2rem,1.2rem+2.1vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-fg">
              Every step between landing and buying costs sales.
            </h2>
            <p className="text-lg leading-relaxed text-fg/80">
              Studies of online stores, the best known from Amazon, found that every 100&nbsp;ms of delay costs about
              1% of sales. Clicking through categories, opening filters and scrolling past the wrong products is that
              delay, many times over.
            </p>
            <p className="text-sm text-muted">A widely cited industry figure, not a measurement of Wortox.</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-page px-5 pb-24 pt-14 sm:px-8 md:pb-36 lg:pt-6">
        <dl className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="border-t border-fg/15 pt-6">
              <dt className="font-display text-[1.375rem] font-semibold tracking-[-0.015em] text-fg">{p.title}</dt>
              <dd className="mt-2.5 max-w-[38ch] leading-relaxed text-muted">{p.copy}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-12 text-xs text-muted">Sample products, rendered for this page.</p>
      </div>
    </section>
  );
}
