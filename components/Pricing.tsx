import { Section } from "./Section";

export function PricingSection() {
  return (
    <Section id="pricing">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          Pricing philosophy
        </p>
        <h2 className="text-3xl md:text-4xl">This is not for everyone.</h2>
        <p className="max-w-3xl text-lg text-muted">
          Custom builds. High-ticket. Long-term partnership. We prioritize
          brands where performance directly impacts revenue and where ownership
          of the stack matters.
        </p>
      </div>
    </Section>
  );
}

