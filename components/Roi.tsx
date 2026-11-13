"use client";

import { useId, useMemo, useState } from "react";
import { Section, SectionHead } from "./Section";

/* Ported from the Wortox case study: same inputs, defaults and formula. */
const inputs = [
  { id: "questions", label: "Product questions per week", min: 0, max: 1000, step: 10, value: 80, hint: "Which camera, which recorder, will it fit, is it in stock." },
  { id: "answerMinutes", label: "Minutes a person spends on each", unit: "min", min: 1, max: 30, step: 1, value: 6 },
  { id: "products", label: "New products per month", min: 0, max: 500, step: 10, value: 40 },
  { id: "copyMinutes", label: "Minutes writing the description and SEO text for each", unit: "min", min: 0, max: 60, step: 5, value: 20 },
  { id: "rate", label: "Value of an hour of staff time", unit: "€/h", min: 5, max: 100, step: 1, value: 20 },
];

/** Minutes per month are the product of the inputs, times a multiplier (4.33 weeks per month). */
const savings = [
  { label: "Answering product questions", factors: ["questions", "answerMinutes"], multiplier: 4.33 },
  { label: "Writing product pages", factors: ["products", "copyMinutes"], multiplier: 1 },
];

const fmt = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const money = (amount: number) => `€${fmt.format(Math.round(amount))}`;

export function RoiSection() {
  const baseId = useId();
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(inputs.map((input) => [input.id, input.value])),
  );

  const result = useMemo(() => {
    const lines = savings.map((s) => ({
      label: s.label,
      hours: s.factors.reduce((product, id) => product * (values[id] ?? 0), s.multiplier) / 60,
    }));
    const hours = lines.reduce((sum, line) => sum + line.hours, 0);
    return { lines, hours, monthly: hours * values.rate, yearly: hours * values.rate * 12 };
  }, [values]);
  const total = Math.max(result.hours, 0.0001);

  return (
    <Section id="roi">
      <SectionHead
        title={<>What it&rsquo;s worth, on an example</>}
        lead="A store that answers product questions by phone, email and chat, and writes every product page by hand. Change the numbers to match yours."
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="flex flex-col">
          {inputs.map((input) => {
            const id = `${baseId}-${input.id}`;
            const value = values[input.id];
            const shown = `${fmt.format(value)}${input.unit ? ` ${input.unit}` : ""}`;
            const fill = ((value - input.min) / (input.max - input.min)) * 100;
            return (
              <div key={input.id} className="flex flex-col gap-3 border-t border-fg/10 py-6 first:border-t-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-6">
                  <label htmlFor={id} className="text-[15px] text-fg">
                    {input.label}
                  </label>
                  <span aria-hidden className="shrink-0 font-display text-xl font-semibold tabular-nums tracking-[-0.01em] text-fg">
                    {shown}
                  </span>
                </div>
                <input
                  id={id}
                  type="range"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={value}
                  aria-valuetext={shown}
                  onChange={(event) => setValues((current) => ({ ...current, [input.id]: Number(event.target.value) }))}
                  style={{ "--fill": `${fill}%` } as React.CSSProperties}
                  className="range"
                />
                {input.hint && <p className="text-[13px] text-muted">{input.hint}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-8 self-start rounded-frame bg-surface p-6 shadow-stage ring-1 ring-line sm:p-10 lg:sticky lg:top-24">
          <output
            htmlFor={inputs.map((input) => `${baseId}-${input.id}`).join(" ")}
            aria-live="polite"
            className="flex flex-col gap-3"
          >
            <span className="text-[13px] font-medium text-muted">Projection from your inputs</span>
            <span className="mt-3 text-[15px] text-fg/80">Time saved is worth</span>
            <span className="font-display text-[clamp(3.5rem,2.4rem+4.6vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] tabular-nums text-fg">
              {money(result.monthly)}
            </span>
            <span className="max-w-[40ch] text-lg leading-relaxed text-fg/80">
              a month, or {money(result.yearly)} a year: {fmt.format(result.hours)} hours given back every month.
            </span>
          </output>

          <div className="flex flex-col gap-4 border-t border-fg/10 pt-7">
            <div aria-hidden className="flex h-1.5 gap-1 overflow-hidden rounded-full">
              {result.lines.map((line, index) => (
                <span
                  key={line.label}
                  className={index === 0 ? "rounded-full bg-primary" : "rounded-full bg-primary/35"}
                  style={{ width: `${(line.hours / total) * 100}%` }}
                />
              ))}
            </div>
            <ul className="flex flex-col gap-2">
              {result.lines.map((line, index) => (
                <li key={line.label} className="flex items-center justify-between gap-4 text-[15px]">
                  <span className="flex items-center gap-2.5 text-fg/80">
                    <span aria-hidden className={`h-2 w-2 rounded-full ${index === 0 ? "bg-primary" : "bg-primary/35"}`} />
                    {line.label}
                  </span>
                  <span className="font-semibold tabular-nums text-fg">{fmt.format(line.hours)} h</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 border-t border-fg/10 pt-7">
            <p className="text-[15px] leading-relaxed text-fg/80">
              Wortox AI is a custom build, so there is no list price. The AI search runs on GPT-4o-mini and is billed per
              use by the provider.
            </p>
            <p className="text-[13px] text-muted">An illustration built on assumptions, not a measurement.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
