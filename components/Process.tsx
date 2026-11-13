import catalogue from "@/lib/catalogue.json";
import { productImage } from "@/lib/images";
import { EXAMPLE, chips, parse, search, title, type Product } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { SectionHead, Section } from "./Section";

/* The example query run through the same parser as the demo, at build time. */
const filters = parse(EXAMPLE);
const exampleChips = chips(filters);
const examplePage = { title: title(filters), products: search(catalogue as Product[], filters).matches.slice(0, 4) };

function SearchLine() {
  return (
    <div className="flex w-full items-center gap-3 rounded-full bg-surface px-5 py-4 shadow-lift ring-1 ring-line sm:px-6">
      <SearchIcon className="h-5 w-5 text-muted" />
      <span className="text-base text-fg sm:text-xl">
        {EXAMPLE}
        <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-primary" />
      </span>
    </div>
  );
}

function Filters() {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {exampleChips.map((chip) => (
        <li
          key={chip.label}
          className={cn(
            "rounded-full px-4 py-2 text-[15px] font-medium",
            chip.kind === "category" ? "bg-primary text-white" : "bg-surface text-fg ring-1 ring-primary/30",
          )}
        >
          {chip.label}
        </li>
      ))}
    </ul>
  );
}

function CategoryPage() {
  return (
    <div className="w-full">
      <p className="font-display text-xl font-semibold tracking-[-0.015em] text-fg sm:text-2xl">{examplePage.title}</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {examplePage.products.map(({ product }) => (
          <li key={product.id}>
            <div className="overflow-hidden rounded-card bg-studio ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImage(product).small}
                alt=""
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full scale-[1.14] object-cover"
              />
            </div>
            <p className="mt-2.5 text-[13px] leading-snug text-fg">{product.name}</p>
            <p className="text-[13px] tabular-nums text-muted">€{product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Path() {
  const nodes = ["Storefront", "API Gateway", "Lambda", "MongoDB"];
  return (
    <ol className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {nodes.map((node, i) => (
        <li key={node} className="flex items-center sm:flex-1 sm:last:flex-none">
          <span
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-medium ring-1",
              i === 0 ? "bg-fg text-surface ring-fg" : "bg-surface text-fg ring-line",
            )}
          >
            {node}
          </span>
          {i < nodes.length - 1 && (
            <span aria-hidden className="mx-3 hidden h-px flex-1 bg-gradient-to-r from-fg/30 to-primary/50 sm:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

const steps = [
  {
    title: "The shopper writes a sentence",
    copy: "In their own words, the way they would ask a good salesperson.",
    visual: <SearchLine />,
  },
  {
    title: "The sentence becomes filters",
    copy: "GPT-4o-mini turns it into category, brands, properties and price range. It only uses the category's real properties; filters that cannot exist are dropped instead of guessed.",
    visual: <Filters />,
  },
  {
    title: "The store builds the category page",
    copy: "The database searches the real catalogue with those filters. The page answers in plain language, and only with products that exist.",
    visual: <CategoryPage />,
  },
  {
    title: "Delivered fast",
    copy: "Search runs inside the store, on a serverless back end on AWS: Lambda, API Gateway and S3, with no plugins in the way.",
    visual: <Path />,
  },
];

export function ProcessSection() {
  return (
    <Section id="how">
      <SectionHead
        title="From a sentence to a category page"
        lead="Categories and their properties are created on the fly, products come in variants, and filters, product pages and search follow on their own."
      />
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-6 border-t border-fg/10 py-10 first:border-t-0 first:pt-0 md:grid-cols-12 md:gap-10 md:py-14"
          >
            <div className="md:col-span-4 md:pt-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums text-primary ring-1 ring-primary/35">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-display-md font-semibold text-fg">{step.title}</h3>
              <p className="mt-3 max-w-[40ch] leading-relaxed text-muted">{step.copy}</p>
            </div>
            <div className="flex items-center md:col-span-8 md:min-h-[168px]">
              {step.visual}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
