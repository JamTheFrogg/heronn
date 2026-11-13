"use client";

import { useId, useMemo, useState } from "react";
import catalogue from "@/lib/catalogue.json";
import { productImage } from "@/lib/images";
import { EXAMPLE, chips, featureLabel, parse, search, title, type Product } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { Section, SectionHead } from "./Section";

const products = catalogue as Product[];

const suggestions = [
  EXAMPLE,
  "wireless battery doorbell with two-way audio",
  "8 channel nvr for 4k cameras",
  "cheapest indoor wifi camera",
  "solar ptz camera under 100",
];

export function DemoSection() {
  const [query, setQuery] = useState(EXAMPLE);
  const inputId = useId();
  const noteId = useId();

  const { filters, result, heading } = useMemo(() => {
    const filters = parse(query);
    return { filters, result: search(products, filters), heading: title(filters) };
  }, [query]);
  const parsed = chips(filters);
  const empty = query.trim() === "";

  return (
    <Section id="demo" className="bg-gradient-to-b from-bg via-panel/40 to-bg">
      <SectionHead
        title="Type what you need. Watch the page build itself."
        lead={`A sample security store with ${products.length} products. Write a sentence or pick one below; the filters, the category title and the products follow as you type.`}
      />

      {/* The store: one frame, laid out the way a real storefront is. */}
      <div className="-mx-1 overflow-hidden rounded-frame bg-surface shadow-stage ring-1 ring-line sm:mx-0">
        <form role="search" onSubmit={(event) => event.preventDefault()} className="border-b border-fg/[0.08]">
          <div className="flex flex-col gap-4 px-4 pb-4 pt-5 sm:px-7 sm:pt-6 md:flex-row md:items-center md:gap-8">
            <div className="flex shrink-0 items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/nav-logo.svg" alt="" width={13} height={20} />
              <span className="font-display text-[17px] font-semibold tracking-[-0.015em] text-fg">Sample store</span>
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor={inputId} className="sr-only">
                Search the sample store
              </label>
              <div className="flex items-center gap-3 rounded-full bg-bg px-5 ring-1 ring-fg/15 transition-shadow duration-300 focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/60">
                <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id={inputId}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-describedby={noteId}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. outdoor 4K camera with night vision under 300"
                  className="h-12 w-full min-w-0 bg-transparent text-base text-fg outline-none placeholder:text-muted focus-visible:outline-none sm:h-14 sm:text-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="-mr-2 shrink-0 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-fg/5 hover:text-fg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="rail flex gap-2 overflow-x-auto px-4 pb-5 sm:flex-wrap sm:overflow-visible sm:px-7" aria-label="Example searches" role="group">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                aria-pressed={query === s}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] transition-[background-color,color,box-shadow] duration-300",
                  query === s
                    ? "bg-fg text-surface"
                    : "bg-surface text-fg/80 ring-1 ring-fg/15 hover:text-fg hover:ring-fg/30",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </form>

        <div className="px-4 pb-6 pt-7 sm:px-7 sm:pb-8 sm:pt-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div aria-live="polite" className="min-w-0 space-y-2">
              <h3 className="font-display text-display-md font-semibold text-fg">
                {empty || !result.understood ? "All products" : heading}
              </h3>
              <p className="text-sm text-muted">
                {empty
                  ? "Start typing, or pick an example above."
                  : !result.understood
                    ? "No filters recognised in that sentence. Try a product type, a feature such as night vision or wireless, a resolution or a price. Showing a few products meanwhile."
                    : result.exact
                      ? `${result.matches.length} ${result.matches.length === 1 ? "product matches" : "products match"} every filter.`
                      : "No product matches every filter. Showing the closest matches; each card says what it misses."}
              </p>
            </div>
            <div className="shrink-0 lg:max-w-[50%]">
              <p className="sr-only">What the store understood</p>
              {parsed.length ? (
                <ul className="flex flex-wrap gap-1.5 lg:justify-end" aria-label="Filters the store understood">
                  {parsed.map((chip) => (
                    <li
                      key={chip.kind + chip.label}
                      className={cn(
                        "rounded-full px-3 py-1 text-[13px] font-medium",
                        chip.kind === "spelling"
                          ? "border border-dashed border-fg/25 text-muted"
                          : chip.kind === "category"
                            ? "bg-primary text-white"
                            : "bg-primary/[0.07] text-primary ring-1 ring-primary/20",
                      )}
                    >
                      {chip.kind === "spelling" ? `Spelling: ${chip.label}` : chip.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">No filters yet</p>
              )}
            </div>
          </div>

          <ul
            key={heading + result.matches.length}
            className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {result.matches.map(({ product, missing }, index) => (
              <li key={product.id} style={{ animationDelay: `${index * 45}ms` }} className="demo-rise group flex flex-col">
                <div className="relative overflow-hidden rounded-card bg-studio ring-1 ring-line transition-shadow duration-500 ease-out group-hover:shadow-lift">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage(product).small}
                    alt={product.name}
                    width={600}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full scale-[1.14] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.2]"
                  />
                </div>
                <div className="mt-3.5 flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <p className="text-[15px] font-medium leading-snug text-fg">{product.name}</p>
                  <p className="order-last mt-1 shrink-0 text-[15px] font-semibold tabular-nums text-fg sm:order-none sm:mt-0">€{product.price}</p>
                </div>
                <p className="mt-1 text-[13px] leading-snug text-muted">{specs(product)}</p>
                {missing.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug text-fg/75">
                    <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
                    Misses: {missing.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <p id={noteId} className="border-t border-fg/[0.08] bg-bg/60 px-4 py-4 text-[13px] leading-relaxed text-muted sm:px-7">
          Scripted demo: a small rule-based parser over invented sample products, running in your browser. The product
          itself uses a language model over the store&rsquo;s real catalogue.
        </p>
      </div>
    </Section>
  );
}

function specs(p: Product) {
  return [p.resolution, p.channels ? `${p.channels} channels` : undefined, ...p.features.map(featureLabel)]
    .filter(Boolean)
    .join(" · ");
}
