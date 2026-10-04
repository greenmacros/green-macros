// Local food database search (English + Japanese, kana-insensitive).

let cache = null;

/** Lazy-loads the bundled food list so it stays out of the main chunk. */
export async function loadFoods() {
  if (!cache) cache = (await import("../data/foods.js")).FOODS;
  return cache;
}

/** lower-case, NFKC, katakana → hiragana so "トウフ" finds "とうふ". */
export function fold(text) {
  return String(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .trim();
}

export function searchFoods(foods, query, region = "all", limit = 40) {
  const q = fold(query);
  const pool = region === "all" ? foods : foods.filter(f => f.region === region);
  if (!q) return pool.slice(0, limit);

  const scored = [];
  for (const f of pool) {
    const keys = [f.en, f.ja, f.reading].filter(Boolean).map(fold);
    let best = Infinity;
    for (const k of keys) {
      const i = k.indexOf(q);
      if (i === 0) best = Math.min(best, 0);
      else if (i > 0) best = Math.min(best, 1 + i / 100);
    }
    if (best < Infinity) scored.push([best, f]);
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, f]) => f);
}
