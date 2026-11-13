import manifest from "@/public/products/manifest.json";
import type { Product } from "./parser";

type Entry = { image: string; small: string };
const keys = manifest.keys as Record<string, Entry>;
const byId = manifest.byId as Record<string, string>;
const byArt = manifest.byArt as Record<string, string>;

/** The rendered image for a catalogue product: by id first, then by its art shape. */
export function productImage(product: Pick<Product, "id" | "art">): Entry {
  return keys[byId[product.id] ?? byArt[product.art] ?? "cube"] ?? keys.cube;
}
