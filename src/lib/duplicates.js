import { fold } from "./foods";

const nameKey = p => fold(p.name).replace(/[^\p{L}\p{N}]+/gu, "");
const nutritionKey = p => [p.servingGrams, p.unit, p.cal, p.protein, p.carbs, p.fat].join("|");

/**
 * Groups of products that are probably the same thing:
 *  - "name":      same name once case, width, spaces and punctuation are ignored
 *  - "nutrition": different names but identical serving and macros
 * A product appears in at most one group. Returns [{ reason, items }].
 */
export function findDuplicateGroups(products) {
  const taken = new Set();
  const groups = [];

  const collect = (reason, keyOf) => {
    const buckets = new Map();
    for (const p of products) {
      if (taken.has(p.id)) continue;
      const k = keyOf(p);
      if (!k) continue;
      buckets.set(k, [...(buckets.get(k) ?? []), p]);
    }
    for (const items of buckets.values()) {
      if (items.length < 2) continue;
      items.forEach(p => taken.add(p.id));
      groups.push({ reason, items });
    }
  };

  collect("name", nameKey);
  collect("nutrition", p => (p.cal || p.protein || p.carbs || p.fat ? nutritionKey(p) : ""));
  return groups;
}
