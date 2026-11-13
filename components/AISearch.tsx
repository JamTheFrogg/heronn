import { Section } from "./Section";

const examples = [
  "black waterproof running shoes under 150",
  "gift for gym guy who hates brands",
  "organic skincare bundle for sensitive skin",
  "high-volume wholesale restock for SKU A17"
];

export function AISearchSection() {
  return (
    <Section id="ai-search">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          AI search
        </p>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl">
            Users search in sentences. Your store should understand them.
          </h2>
          <p className="max-w-3xl text-lg text-muted">
            Intent detection, embeddings, and tuned ranking built into your
            catalog. No external widget latency. No generic black boxes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example, idx) => (
            <div
              key={example}
              className="rounded-sm border border-secondary/20 bg-bg/60 px-4 py-3 font-mono text-sm text-secondary"
            >
              <span className="text-primary">q{idx + 1}:</span>{" "}
              <span>{example}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

