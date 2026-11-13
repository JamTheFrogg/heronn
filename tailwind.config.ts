import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-deep": "rgb(var(--color-primary-deep) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        studio: "rgb(var(--color-studio) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-fg) / 0.1)",
      },
      fontFamily: {
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        display: ['"Familjen Grotesk Variable"', '"Inter Variable"', "system-ui", "sans-serif"],
      },
      fontSize: {
        /* Fluid display steps; body stays on Tailwind's rem scale. */
        "display-xl": ["clamp(2.75rem, 1.55rem + 5vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.125rem, 1.45rem + 2.9vw, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.5rem, 1.25rem + 1vw, 2.125rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        card: "14px",
        frame: "24px",
      },
      boxShadow: {
        /* One light source from above: a tight contact shadow plus a wide soft one. */
        soft: "0 1px 2px rgb(var(--color-fg) / 0.05), 0 4px 14px -6px rgb(var(--color-fg) / 0.08)",
        lift: "0 2px 4px rgb(var(--color-fg) / 0.04), 0 18px 40px -18px rgb(var(--color-fg) / 0.2)",
        stage: "0 2px 6px rgb(var(--color-fg) / 0.04), 0 40px 90px -40px rgb(var(--color-fg) / 0.28)",
      },
      maxWidth: {
        page: "1240px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
