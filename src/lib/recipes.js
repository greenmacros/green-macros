import { uid } from "./id";

const num = v => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function createRecipe(name, items) {
  return {
    id: uid(),
    name,
    items: items.filter(it => it.productId).map(it => ({ productId: it.productId, amount: it.amount }))
  };
}

export function normalizeRecipes(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    let id = r.id == null ? uid() : String(r.id);
    if (seen.has(id)) id = uid();
    seen.add(id);
    out.push({
      id,
      name: String(r.name ?? "").trim() || "Recipe",
      items: (Array.isArray(r.items) ? r.items : [])
        .filter(it => it && it.productId != null)
        .map(it => ({ productId: String(it.productId), amount: num(it.amount) }))
    });
  }
  return out;
}
