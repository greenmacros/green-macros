import { uid } from "./id";

export const UNITS = ["g", "ml", "unit", "scoop"];

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const round1 = n => Math.round(n * 10) / 10;

export function createProduct(fields = {}) {
  return {
    id: uid(),
    name: "",
    unit: "g",
    servingGrams: 100,
    cal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fav: false,
    ...fields
  };
}

/** Coerce anything (old saves, imports, share links) into a valid product, or null. */
export function normalizeProduct(p) {
  if (!p || typeof p !== "object") return null;
  return {
    id: p.id == null ? uid() : String(p.id),
    name: String(p.name ?? "").trim() || "Unnamed product",
    unit: UNITS.includes(p.unit) ? p.unit : "g",
    servingGrams: num(p.servingGrams, 100) || 100,
    cal: round1(num(p.cal ?? p.calories)),
    protein: round1(num(p.protein)),
    carbs: round1(num(p.carbs)),
    fat: round1(num(p.fat)),
    fav: Boolean(p.fav)
  };
}

export function normalizeProducts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const p = normalizeProduct(raw);
    if (!p) continue;
    if (seen.has(p.id)) p.id = uid();
    seen.add(p.id);
    out.push(p);
  }
  return out;
}

export function sameProduct(a, b) {
  return (
    a.name === b.name &&
    a.servingGrams === b.servingGrams &&
    a.cal === b.cal &&
    a.protein === b.protein &&
    a.carbs === b.carbs &&
    a.fat === b.fat
  );
}

export function sortProducts(products, sortBy) {
  const list = [...products];
  const by = key => (a, b) => b[key] - a[key] || a.name.localeCompare(b.name);
  switch (sortBy) {
    case "protein": return list.sort(by("protein"));
    case "carbs": return list.sort(by("carbs"));
    case "fat": return list.sort(by("fat"));
    case "cal": return list.sort(by("cal"));
    case "recent": return list.reverse();
    case "name":
    default: return list.sort((a, b) => a.name.localeCompare(b.name));
  }
}
