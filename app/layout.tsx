import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/familjen-grotesk";
import "../styles/globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const description =
  "An e-commerce platform where categories, products and the store itself adapt on the fly, and the buyer's own words are the filter.";

export const metadata: Metadata = {
  metadataBase: new URL("https://wortox.srnja.com"),
  title: "Wortox AI | The buyer's words are the filter",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Wortox AI",
    title: "Wortox AI | The buyer's words are the filter",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Wortox AI: the buyer's words are the filter." }],
  },
  twitter: { card: "summary_large_image", title: "Wortox AI", description, images: ["/og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#f5f3f0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg font-sans text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex min-h-[70vh] flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
