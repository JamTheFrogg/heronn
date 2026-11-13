/*
 * The demo's query parser: a small, deterministic stand-in for the language
 * model the real product uses. It turns a sentence into filters over a
 * sample catalogue. shortcut: fixed English vocabulary, no grammar; the
 * product itself uses GPT-4o-mini against the store's real properties.
 */

/** The example query from the case study. */
export const EXAMPLE = "outdoor 4K camera with night vision under 300";

export type Category = "camera" | "doorbell" | "recorder" | "sensor" | "alarm" | "lock";
export type Feature =
  | "outdoor"
  | "indoor"
  | "night-vision"
  | "wireless"
  | "wired"
  | "battery"
  | "solar"
  | "ptz"
  | "two-way-audio";
export type Resolution = "1080p" | "2K" | "4K";
export type Sort = "relevance" | "price-asc" | "price-desc" | "resolution-desc";

export interface Product {
  id: string;
  name: string;
  category: Category;
  art: string;
  price: number;
  resolution?: Resolution;
  channels?: number;
  features: Feature[];
}

export interface Filters {
  category?: Category;
  features: Feature[];
  without: Feature[];
  minResolution?: Resolution;
  minPrice?: number;
  maxPrice?: number;
  minChannels?: number;
  sort: Sort;
  corrections: [string, string][];
}

export interface Chip {
  label: string;
  kind: "category" | "feature" | "without" | "resolution" | "price" | "channels" | "sort" | "spelling";
}

const CATEGORY_WORDS: [string, Category][] = [
  ["video doorbell", "doorbell"], ["doorbell", "doorbell"], ["door bell", "doorbell"], ["ring camera", "doorbell"],
  ["smart lock", "lock"], ["door lock", "lock"], ["deadbolt", "lock"], ["lock", "lock"], ["locks", "lock"],
  ["nvr", "recorder"], ["dvr", "recorder"], ["recorder", "recorder"], ["recorders", "recorder"], ["recording box", "recorder"],
  ["sensor", "sensor"], ["sensors", "sensor"], ["detector", "sensor"], ["detectors", "sensor"],
  ["alarm", "alarm"], ["alarms", "alarm"], ["siren", "alarm"], ["sirens", "alarm"], ["alarm kit", "alarm"],
  ["camera", "camera"], ["cameras", "camera"], ["cam", "camera"], ["cams", "camera"], ["cctv", "camera"],
  ["bullet", "camera"], ["dome", "camera"], ["turret", "camera"], ["ptz", "camera"], ["webcam", "camera"],
];

const FEATURE_WORDS: [string, Feature][] = [
  ["outdoor", "outdoor"], ["outdoors", "outdoor"], ["outside", "outdoor"], ["exterior", "outdoor"], ["garden", "outdoor"],
  ["yard", "outdoor"], ["driveway", "outdoor"], ["weatherproof", "outdoor"], ["waterproof", "outdoor"], ["ip66", "outdoor"], ["ip67", "outdoor"],
  ["indoor", "indoor"], ["indoors", "indoor"], ["inside", "indoor"], ["interior", "indoor"], ["living room", "indoor"], ["nursery", "indoor"],
  ["night vision", "night-vision"], ["night", "night-vision"], ["infrared", "night-vision"], ["ir", "night-vision"],
  ["dark", "night-vision"], ["low light", "night-vision"],
  ["wireless", "wireless"], ["wifi", "wireless"], ["cordless", "wireless"], ["wire free", "wireless"], ["no wires", "wireless"],
  ["wired", "wired"], ["cabled", "wired"], ["ethernet", "wired"], ["poe", "wired"], ["power over ethernet", "wired"],
  ["battery", "battery"], ["battery powered", "battery"], ["rechargeable", "battery"],
  ["solar", "solar"], ["solar powered", "solar"],
  ["pan", "ptz"], ["tilt", "ptz"], ["zoom", "ptz"], ["ptz", "ptz"], ["rotating", "ptz"], ["360", "ptz"],
  ["two way audio", "two-way-audio"], ["two way", "two-way-audio"], ["talk back", "two-way-audio"], ["talkback", "two-way-audio"],
  ["speaker", "two-way-audio"], ["microphone", "two-way-audio"], ["intercom", "two-way-audio"], ["audio", "two-way-audio"],
];

const RESOLUTION_WORDS: [string, Resolution][] = [
  ["4k", "4K"], ["uhd", "4K"], ["ultra hd", "4K"], ["2160p", "4K"], ["8mp", "4K"],
  ["2k", "2K"], ["1440p", "2K"], ["qhd", "2K"], ["4mp", "2K"], ["5mp", "2K"],
  ["1080p", "1080p"], ["1080", "1080p"], ["full hd", "1080p"], ["fhd", "1080p"], ["hd", "1080p"], ["2mp", "1080p"],
];

const SORT_WORDS: [string, Sort][] = [
  ["cheapest", "price-asc"], ["cheap", "price-asc"], ["budget", "price-asc"], ["affordable", "price-asc"],
  ["inexpensive", "price-asc"], ["lowest price", "price-asc"],
  ["most expensive", "price-desc"], ["premium", "price-desc"], ["high end", "price-desc"],
  ["best", "resolution-desc"], ["sharpest", "resolution-desc"], ["highest resolution", "resolution-desc"], ["best quality", "resolution-desc"],
];

const RES_RANK: Record<Resolution, number> = { "1080p": 1, "2K": 2, "4K": 3 };
const NEGATIONS = new Set(["no", "not", "without", "non"]);
// Everyday words one letter away from a vocabulary word ("light" is not a typo of "night").
const KNOWN = new Set(["light", "right", "eight", "sight", "tight", "house", "price", "doors", "where", "there", "cheaper"]);

// Single words the spelling fix may correct towards.
const VOCABULARY = Array.from(
  new Set(
    [...CATEGORY_WORDS, ...FEATURE_WORDS, ...SORT_WORDS]
      .map(([w]) => w)
      .concat(["under", "below", "between", "cameras", "channel", "channels", "vision"])
      .filter((w) => !w.includes(" ") && w.length >= 4),
  ),
);

/** Edit distance where swapping two neighbouring letters counts as one edit. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function normalize(query: string): string {
  return ` ${query
    .toLowerCase()
    .replace(/wi-?fi/g, "wifi")
    .replace(/(\d)\s*k\b/g, "$1k")
    .replace(/\b(2|two)[\s-]*way\b/g, "two way")
    .replace(/€|eur\b|euros?\b|\$|usd\b|dollars?\b/g, " € ")
    .replace(/[^a-z0-9€<>\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/** Index of every whole-phrase match in a normalized string. */
function find(text: string, phrase: string): number[] {
  const hits: number[] = [];
  let at = text.indexOf(` ${phrase} `);
  while (at !== -1) {
    hits.push(at + 1);
    at = text.indexOf(` ${phrase} `, at + 1);
  }
  return hits;
}

function negated(text: string, index: number): boolean {
  const before = text.slice(0, index).trim().split(" ");
  return before.slice(-2).some((w) => NEGATIONS.has(w));
}

// A number that is a price, not "4k", "8 channel" or "16 cameras".
const N = String.raw`€?\s*(\d+)\b(?!\s*(?:k|p|mp|ch|channels?|cameras?|cams?)\b)\s*€?`;

export function parse(query: string): Filters {
  const corrections: [string, string][] = [];
  let text = normalize(query);
  text = ` ${text
    .trim()
    .split(" ")
    .map((word) => {
      if (word.length < 5 || VOCABULARY.includes(word) || KNOWN.has(word) || /\d/.test(word)) return word;
      const best = VOCABULARY.find((v) => Math.abs(v.length - word.length) <= 1 && distance(v, word) <= (word.length >= 8 ? 2 : 1));
      if (best) corrections.push([word, best]);
      return best ?? word;
    })
    .join(" ")} `;

  const filters: Filters = { features: [], without: [], sort: "relevance", corrections };

  // Category: the first one named wins ("nvr for 4k cameras" is a recorder); a doorbell is always a doorbell.
  let first = Infinity;
  for (const [phrase, category] of CATEGORY_WORDS) {
    const hit = find(text, phrase)[0];
    if (hit === undefined) continue;
    if (category === "doorbell") {
      filters.category = "doorbell";
      break;
    }
    if (hit < first) {
      first = hit;
      filters.category = category;
    }
  }

  for (const [phrase, feature] of FEATURE_WORDS) {
    for (const hit of find(text, phrase)) {
      const list = phrase.startsWith("no ") || !negated(text, hit) ? filters.features : filters.without;
      if (!list.includes(feature)) list.push(feature);
    }
  }
  // "ptz" names both a camera type and the feature; "outdoor and indoor" or "wired or wireless" means either.
  for (const [a, b] of [["outdoor", "indoor"], ["wired", "wireless"]] as [Feature, Feature][]) {
    if (filters.features.includes(a) && filters.features.includes(b)) filters.features = filters.features.filter((f) => f !== a && f !== b);
  }
  filters.without = filters.without.filter((f) => !filters.features.includes(f));

  for (const [phrase, resolution] of RESOLUTION_WORDS) {
    if (find(text, phrase).length && (!filters.minResolution || RES_RANK[resolution] > RES_RANK[filters.minResolution])) {
      filters.minResolution = resolution;
    }
  }

  const between = text.match(new RegExp(String.raw`(?:between|from)\s*${N}\s*(?:and|to)\s*${N}`));
  const max =
    text.match(new RegExp(String.raw`(?:under|below|less than|max|maximum|up to|within|cheaper than|no more than|at most|budget of|budget|<)\s*${N}`)) ??
    text.match(new RegExp(String.raw`\b(\d+)\s*€?\s*(?:or less|max|tops)\b`)) ??
    text.match(/€\s*(\d+)\b|\b(\d+)\s*€/);
  const min = text.match(new RegExp(String.raw`(?:over|above|more than|at least|from|min|minimum|starting at|>)\s*${N}`));
  if (between) {
    filters.minPrice = Math.min(Number(between[1]), Number(between[2]));
    filters.maxPrice = Math.max(Number(between[1]), Number(between[2]));
  } else {
    if (max) filters.maxPrice = Number(max[1] ?? max[2]);
    if (min) filters.minPrice = Number(min[1]);
  }

  const channels = text.match(/\b(\d+)\s*(?:ch|channels?)\b/) ?? text.match(/\bfor\s+(\d+)\s*(?:cameras?|cams?)\b/);
  if (channels && (!filters.category || filters.category === "recorder" || /channel| ch /.test(text))) {
    filters.category = "recorder";
    filters.minChannels = Number(channels[1]);
  }

  for (const [phrase, sort] of SORT_WORDS) {
    if (find(text, phrase).length) {
      filters.sort = sort;
      break;
    }
  }
  return filters;
}

const CATEGORY_LABEL: Record<Category, [string, string]> = {
  camera: ["Camera", "cameras"],
  doorbell: ["Video doorbell", "video doorbells"],
  recorder: ["Recorder", "recorders"],
  sensor: ["Sensor", "sensors"],
  alarm: ["Alarm", "alarms and sirens"],
  lock: ["Smart lock", "smart locks"],
};

const FEATURE_LABEL: Record<Feature, string> = {
  outdoor: "Outdoor",
  indoor: "Indoor",
  "night-vision": "Night vision",
  wireless: "Wireless",
  wired: "Wired",
  battery: "Battery",
  solar: "Solar",
  ptz: "Pan and tilt",
  "two-way-audio": "Two-way audio",
};

const SORT_LABEL: Record<Sort, string> = {
  relevance: "",
  "price-asc": "Cheapest first",
  "price-desc": "Most expensive first",
  "resolution-desc": "Sharpest first",
};

const ADJECTIVES: Feature[] = ["outdoor", "indoor", "wireless", "wired", "battery", "solar"];

export function featureLabel(feature: Feature) {
  return FEATURE_LABEL[feature];
}

export function chips(f: Filters): Chip[] {
  const out: Chip[] = [];
  if (f.category) out.push({ kind: "category", label: CATEGORY_LABEL[f.category][0] });
  f.features.forEach((x) => out.push({ kind: "feature", label: FEATURE_LABEL[x] }));
  f.without.forEach((x) => out.push({ kind: "without", label: `Not ${FEATURE_LABEL[x].toLowerCase()}` }));
  if (f.minResolution) out.push({ kind: "resolution", label: `${f.minResolution} or better` });
  if (f.minChannels) out.push({ kind: "channels", label: `${f.minChannels}+ channels` });
  if (f.minPrice !== undefined && f.maxPrice !== undefined) out.push({ kind: "price", label: `€${f.minPrice}–€${f.maxPrice}` });
  else if (f.maxPrice !== undefined) out.push({ kind: "price", label: `Up to €${f.maxPrice}` });
  else if (f.minPrice !== undefined) out.push({ kind: "price", label: `From €${f.minPrice}` });
  if (f.sort !== "relevance") out.push({ kind: "sort", label: SORT_LABEL[f.sort] });
  f.corrections.forEach(([from, to]) => out.push({ kind: "spelling", label: `${from} → ${to}` }));
  return out;
}

export function title(f: Filters): string {
  const adjectives = f.features.filter((x) => ADJECTIVES.includes(x)).map((x) => FEATURE_LABEL[x].toLowerCase());
  const extras = f.features.filter((x) => !ADJECTIVES.includes(x)).map((x) => FEATURE_LABEL[x].toLowerCase());
  if (f.minChannels) extras.push(`${f.minChannels}+ channels`);
  const noun = f.category ? CATEGORY_LABEL[f.category][1] : "security gear";
  let text = [...adjectives, f.minResolution, noun].filter(Boolean).join(" ");
  if (extras.length) text += ` with ${extras.join(" and ")}`;
  if (f.without.length) text += `, not ${f.without.map((x) => FEATURE_LABEL[x].toLowerCase()).join(" or ")}`;
  if (f.minPrice !== undefined && f.maxPrice !== undefined) text += `, €${f.minPrice} to €${f.maxPrice}`;
  else if (f.maxPrice !== undefined) text += ` under €${f.maxPrice}`;
  else if (f.minPrice !== undefined) text += ` from €${f.minPrice}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface Match {
  product: Product;
  missing: string[];
}

export interface Result {
  matches: Match[];
  exact: boolean;
  understood: boolean;
}

function misses(p: Product, f: Filters): { missing: string[]; score: number } {
  const missing: string[] = [];
  let score = 0;
  const check = (ok: boolean, label: string, weight: number) => (ok ? (score += weight) : missing.push(label));
  if (f.category) check(p.category === f.category, CATEGORY_LABEL[f.category][0], 4);
  f.features.forEach((x) => check(p.features.includes(x), FEATURE_LABEL[x], 1));
  f.without.forEach((x) => check(!p.features.includes(x), `Not ${FEATURE_LABEL[x].toLowerCase()}`, 1));
  if (f.minResolution) check(!!p.resolution && RES_RANK[p.resolution] >= RES_RANK[f.minResolution], f.minResolution, 1);
  if (f.minChannels) check((p.channels ?? 0) >= f.minChannels, `${f.minChannels}+ channels`, 1);
  if (f.maxPrice !== undefined) check(p.price <= f.maxPrice, `Up to €${f.maxPrice}`, 1);
  if (f.minPrice !== undefined) check(p.price >= f.minPrice, `From €${f.minPrice}`, 1);
  return { missing, score };
}

const SORTERS: Record<Sort, (a: Product, b: Product) => number> = {
  relevance: (a, b) => a.price - b.price,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "resolution-desc": (a, b) => RES_RANK[b.resolution ?? "1080p"] - RES_RANK[a.resolution ?? "1080p"] || b.price - a.price,
};

export function search(catalogue: Product[], f: Filters, limit = 8): Result {
  const understood = chips(f).some((c) => c.kind !== "spelling");
  const scored = catalogue.map((product) => ({ product, ...misses(product, f) }));
  const exact = scored.filter((s) => s.missing.length === 0);
  const sort = SORTERS[f.sort];
  if (exact.length) {
    return { exact: true, understood, matches: exact.sort((a, b) => sort(a.product, b.product)).slice(0, limit) };
  }
  // Closest matches: keep the category if one was named, then the most filters met.
  const pool = f.category ? scored.filter((s) => s.product.category === f.category) : scored;
  const closest = pool
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || sort(a.product, b.product))
    .slice(0, Math.min(limit, 6));
  return { exact: false, understood, matches: closest.map(({ product, missing }) => ({ product, missing })) };
}
