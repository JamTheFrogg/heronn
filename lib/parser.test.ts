// Self-check for the demo parser: `npm test` (Node 22+ runs TypeScript directly).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chips, parse, search, title, type Product } from "./parser.ts";

const catalogue: Product[] = JSON.parse(readFileSync(new URL("./catalogue.json", import.meta.url), "utf8"));

const cases: [string, (f: ReturnType<typeof parse>, r: ReturnType<typeof search>) => void][] = [
  ["outdoor 4K camera with night vision under 300", (f, r) => {
    assert.equal(f.category, "camera");
    assert.deepEqual([...f.features].sort(), ["night-vision", "outdoor"]);
    assert.equal(f.minResolution, "4K");
    assert.equal(f.maxPrice, 300);
    assert.ok(r.exact && r.matches.length >= 3);
    assert.ok(r.matches.every((m) => m.product.price <= 300));
  }],
  ["wireless battery doorbell with two-way audio", (f, r) => {
    assert.equal(f.category, "doorbell");
    assert.ok(f.features.includes("wireless") && f.features.includes("battery") && f.features.includes("two-way-audio"));
    assert.ok(r.exact);
  }],
  ["8 channel nvr for 4k cameras", (f) => {
    assert.equal(f.category, "recorder");
    assert.equal(f.minChannels, 8);
    assert.equal(f.minPrice, undefined);
    assert.equal(f.maxPrice, undefined);
  }],
  ["cheapest indoor wifi camera", (f, r) => {
    assert.equal(f.sort, "price-asc");
    assert.ok(f.features.includes("indoor") && f.features.includes("wireless"));
    assert.equal(r.matches[0].product.price, Math.min(...r.matches.map((m) => m.product.price)));
  }],
  ["solar ptz camera 4k under 100", (f, r) => {
    assert.equal(f.maxPrice, 100);
    assert.equal(r.exact, false);
    assert.ok(r.matches.length > 0 && r.matches.every((m) => m.product.category === "camera"));
  }],
  ["outdor camra with nigth vision", (f) => {
    assert.equal(f.category, "camera");
    assert.ok(f.features.includes("outdoor") && f.features.includes("night-vision"));
    assert.ok(f.corrections.length >= 2);
  }],
  ["motion sensor between 20 and 60 euros", (f, r) => {
    assert.equal(f.category, "sensor");
    assert.equal(f.minPrice, 20);
    assert.equal(f.maxPrice, 60);
    assert.ok(r.matches.every((m) => m.product.price >= 20 && m.product.price <= 60));
  }],
  ["camera without wifi", (f, r) => {
    assert.deepEqual(f.without, ["wireless"]);
    assert.ok(r.matches.every((m) => !m.product.features.includes("wireless")));
  }],
  ["smart lock for the front door", (f) => assert.equal(f.category, "lock")],
  ["best ptz camera", (f) => {
    assert.equal(f.sort, "resolution-desc");
    assert.ok(f.features.includes("ptz"));
  }],
  ["a birthday present for my aunt", (_f, r) => assert.equal(r.understood, false)],
];

for (const [query, check] of cases) {
  const f = parse(query);
  const r = search(catalogue, f);
  check(f, r);
  console.log(`ok  "${query}"`);
  console.log(`    ${title(f)} | ${chips(f).map((c) => c.label).join(", ")} | ${r.exact ? "exact" : "closest"}: ${r.matches.map((m) => m.product.id).join(" ")}`);
}
console.log(`${cases.length} queries passed`);
