import { Section } from "./Section";

type Metric = {
  label: string;
  value: string;
  note?: string;
};

const metrics: Metric[] = [
  { label: "API latency", value: "< 100ms", note: "p95 across core flows" },
  { label: "Compute", value: "Serverless", note: "auto-scale without plugins" },
  { label: "Database", value: "MongoDB", note: "aggregation-optimized" },
  { label: "Overhead", value: "Zero plugins", note: "no theme cruft" }
];

export function PerformanceSection() {
  return (
    <Section id="performance">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          Performance
        </p>
        <h2 className="text-3xl md:text-4xl">
          Built for measurable speed, not marketing claims.
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="space-y-2 border-l border-secondary/10 pl-4"
            >
              <p className="text-sm uppercase tracking-wide text-muted">
                {metric.label}
              </p>
              <p className="text-3xl font-semibold text-primary">
                {metric.value}
              </p>
              {metric.note && <p className="text-sm text-muted">{metric.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

