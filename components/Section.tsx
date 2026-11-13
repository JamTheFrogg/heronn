import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
};

export function Section({ id, className, innerClassName, children }: SectionProps) {
  return (
    <section id={id} className={cn("relative", className)}>
      <div className={cn("mx-auto flex max-w-page flex-col gap-12 px-5 py-24 sm:px-8 md:gap-16 md:py-36", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Section heading block: one display heading and its lead paragraph. */
export function SectionHead({ title, lead, className }: { title: React.ReactNode; lead?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-[44rem] space-y-5", className)}>
      <h2 className="font-display text-display-lg font-semibold text-fg">{title}</h2>
      {lead && <p className="max-w-[60ch] text-lg leading-relaxed text-muted md:text-xl md:leading-relaxed">{lead}</p>}
    </div>
  );
}

export const buttonPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgb(26_23_22/0.2),0_10px_24px_-12px_rgb(127_20_22/0.6)] transition-[background-color,transform,box-shadow] duration-300 ease-out hover:bg-primary-deep active:translate-y-px";

export const buttonQuiet =
  "inline-flex h-12 items-center justify-center rounded-full bg-surface/70 px-6 text-[15px] font-semibold text-fg ring-1 ring-fg/15 transition-[background-color,box-shadow,color] duration-300 ease-out hover:bg-surface hover:ring-fg/30";
