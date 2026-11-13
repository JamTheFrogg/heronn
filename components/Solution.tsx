import { Section } from "./Section";

const pillars = [
  {
    title: "Custom backend",
    copy: "Purpose-built services tuned to your catalog, promos, and data."
  },
  {
    title: "AI-native search",
    copy: "Natural language search that understands intent, not just tokens."
  },
  {
    title: "Performance-first infra",
    copy: "Serverless-first footprint with ruthless latency budgeting."
  },
  {
    title: "Full ownership",
    copy: "Your infra, your data. No black boxes, no plugin lock-in."
  }
];

export function SolutionSection() {
  return (
    <Section id="solution">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          The solution
        </p>
        <h2 className="text-3xl md:text-4xl">
          wortox.ai is not a platform. It’s an architecture.
        </h2>
        <p className="max-w-3xl text-lg text-muted">
          We design and build the stack that fits your volume, data, and growth
          model—end to end. No themes. No app bloat. Just clean, measurable
          speed.
        </p>
        <div className="grid gap-8 border-t border-secondary/10 pt-10 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="space-y-3 border-secondary/10 md:border-l md:pl-6 lg:first:border-l-0"
            >
              <h3 className="text-xl">{pillar.title}</h3>
              <p className="text-sm text-muted">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

