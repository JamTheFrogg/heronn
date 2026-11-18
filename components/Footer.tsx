export function Footer() {
  return (
    <footer className="border-t border-fg/10">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:px-8">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/nav-logo.svg" alt="" width={11} height={17} />
          <p>© {new Date().getFullYear()} Wortox AI</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <a href="https://faris.srnja.com/work/wortox" className="transition-colors hover:text-fg">
            Built by Faris Srnja
          </a>
          <a href="mailto:faris@saaisolutions.com" className="transition-colors hover:text-fg">
            faris@saaisolutions.com
          </a>
        </div>
      </div>
    </footer>
  );
}
