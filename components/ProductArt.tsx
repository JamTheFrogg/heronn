/* Line drawings for the demo catalogue, one per product shape. No photos: these are sample products. */
const paths: Record<string, React.ReactNode> = {
  bullet: (
    <>
      <rect x="14" y="22" width="34" height="16" rx="5" />
      <path d="M48 26h4a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-4" />
      <circle cx="51" cy="30" r="1.5" />
      <path d="M12 20h38M24 38v8M18 50h12M24 46v4" />
    </>
  ),
  dome: (
    <>
      <path d="M14 26h36M18 26a14 14 0 0 0 28 0" />
      <circle cx="32" cy="31" r="5" />
      <circle cx="32" cy="31" r="1.5" />
      <path d="M16 22h32v4H16z" />
    </>
  ),
  ptz: (
    <>
      <path d="M22 14h20M32 14v6" />
      <rect x="20" y="20" width="24" height="10" rx="3" />
      <circle cx="32" cy="42" r="12" />
      <circle cx="32" cy="42" r="5" />
      <path d="M12 42a20 20 0 0 1 4-12M52 42a20 20 0 0 0-4-12" />
    </>
  ),
  cube: (
    <>
      <rect x="18" y="14" width="28" height="28" rx="8" />
      <circle cx="32" cy="27" r="7" />
      <circle cx="32" cy="27" r="2" />
      <path d="M28 42v6M36 42v6M22 50h20" />
    </>
  ),
  solar: (
    <>
      <rect x="20" y="24" width="24" height="24" rx="7" />
      <circle cx="32" cy="36" r="6" />
      <circle cx="32" cy="36" r="1.5" />
      <path d="M16 10h32l-4 9H20zM24 10l-1 9M32 10v9M40 10l1 9M32 19v5" />
    </>
  ),
  doorbell: (
    <>
      <rect x="22" y="10" width="20" height="44" rx="8" />
      <circle cx="32" cy="22" r="5" />
      <circle cx="32" cy="22" r="1.5" />
      <circle cx="32" cy="42" r="5" />
    </>
  ),
  recorder: (
    <>
      <rect x="10" y="22" width="44" height="18" rx="3" />
      <path d="M16 31h14M38 31h2M44 31h2M14 40v4M50 40v4" />
      <path d="M22 18c3-3 7-4 10-4s7 1 10 4" />
    </>
  ),
  sensor: (
    <>
      <rect x="20" y="16" width="24" height="32" rx="6" />
      <circle cx="32" cy="28" r="6" />
      <path d="M14 22a18 18 0 0 0 0 12M50 22a18 18 0 0 1 0 12M30 42h4" />
    </>
  ),
  alarm: (
    <>
      <path d="M22 44V30a10 10 0 0 1 20 0v14" />
      <path d="M16 44h32v6H16z" />
      <path d="M32 12v4M18 18l3 3M46 18l-3 3" />
    </>
  ),
  lock: (
    <>
      <rect x="20" y="10" width="24" height="44" rx="6" />
      <circle cx="32" cy="22" r="4" />
      <path d="M28 34h2M34 34h2M28 40h2M34 40h2M28 46h8" />
    </>
  ),
};

export function ProductArt({ art }: { art: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[art] ?? paths.cube}
    </svg>
  );
}
