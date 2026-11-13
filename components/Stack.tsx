import { Section } from "./Section";

const stack = [
  "Next.js frontend",
  "Node.js + TypeScript backend",
  "MongoDB (aggregation-heavy)",
  "AI-native search pipeline",
  "AWS Lambda + edge delivery",
  "SES, custom shipping providers"
];

export function StackSection() {
  return (
    <Section id="stack">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">Stack</p>
        <h2 className="text-3xl md:text-4xl">For CTO eyes only.</h2>
        <div className="space-y-3 border-l border-secondary/15 pl-5">
          {stack.map((item) => (
            <p key={item} className="font-mono text-sm text-secondary">
              {item}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}

