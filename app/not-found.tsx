import { Section } from "@/components/Section";

export default function NotFound() {
  return (
    <Section className="pt-16">
      <div className="max-w-xl space-y-5 py-10">
        <h1 className="font-display text-display-lg font-semibold">This page does not exist.</h1>
        <p className="text-lg text-fg/80">The link may be old, or the address mistyped.</p>
        <a href="/" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-deep">
          Back to the home page
        </a>
      </div>
    </Section>
  );
}
