import { DemoSection } from "@/components/Demo";
import { FinalCTA } from "@/components/FinalCTA";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/Problem";
import { ProcessSection } from "@/components/Process";
import { RoiSection } from "@/components/Roi";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <DemoSection />
      <ProcessSection />
      <RoiSection />
      <FinalCTA />
    </>
  );
}
