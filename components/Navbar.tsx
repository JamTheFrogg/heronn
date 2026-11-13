"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "/#demo", label: "Demo" },
  { href: "/#how", label: "How it works" },
  { href: "/#roi", label: "What it's worth" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-scrolled={scrolled} className="fixed inset-x-0 top-0 z-50">
      <div className="nav-bar">
        <div className="mx-auto flex h-full max-w-page items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5 rounded-sm" aria-label="Wortox AI, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/nav-logo.svg" alt="" width={17} height={26} />
            <span className="font-display text-[19px] font-semibold tracking-[-0.02em] text-fg">Wortox AI</span>
          </a>
          <nav aria-label="Main" className="flex items-center gap-8 text-[14px]">
            <ul className="hidden items-center gap-8 md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-fg/70 transition-colors duration-300 hover:text-fg">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:faris@saaisolutions.com"
              className="inline-flex h-9 items-center rounded-full bg-fg px-4 font-semibold text-surface transition-colors duration-300 hover:bg-primary"
            >
              Talk to us
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
