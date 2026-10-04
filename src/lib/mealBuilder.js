import { sumItems } from "./macros";

/*
  "Make a meal from these products": choose an amount of each selected product so the
  meal lands as close as possible to the macro targets.

  It is a small constrained least-squares problem solved with coordinate descent:
    minimise  Σ_macros w·((total − target)/scale)²  +  λ·Σ_items ((amount − serving)/serving)²
    subject to  minServings·serving ≤ amount ≤ maxServings·serving  (items sitting at the
    minimum that don't help are dropped from the meal)
  The second term keeps amounts close to normal servings when many solutions fit.
  Amounts are then rounded to practical steps and polished with a few greedy passes.
*/

const STEP = { g: 5, ml: 5, unit: 0.5, scoop: 0.5 };
const WEIGHT = { protein: 1, carbs: 1, fat: 1, cal: 0.5 };
const MIN_SCALE = { protein: 10, carbs: 10, fat: 10, cal: 100 };
const KEYS = ["protein", "carbs", "fat", "cal"];
const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };
const LAMBDA = 0.002;
export const OK_TOLERANCE = 0.1;

function stepFor(p, amount) {
  if (p.unit === "g" || p.unit === "ml") return amount < 40 ? 1 : STEP[p.unit];
  return STEP[p.unit] ?? 1;
}

const roundStep = (v, step) => Math.round(v / step) * step;

/**
 * @param products  products to use (all of them end up in the meal)
 * @param target    { calories, protein, carbs, fat } — zero/blank means "don't care"
 * @returns null when there is nothing to solve, else { items, totals, deviation, ok, maxed, short, over }
 */
export function buildMeal(products, target, { maxServings = 4, minServings = 0.05 } = {}) {
  const goals = KEYS.filter(k => target[PROFILE_KEY[k]] > 0).map(k => ({
    key: k,
    value: target[PROFILE_KEY[k]],
    weight: WEIGHT[k] / Math.max(target[PROFILE_KEY[k]], MIN_SCALE[k]) ** 2
  }));
  if (!products.length || !goals.length) return null;

  const per = products.map(p => Object.fromEntries(KEYS.map(k => [k, (p[k] || 0) / p.servingGrams])));
  const lo = products.map(p => p.servingGrams * minServings);
  const hi = products.map(p => p.servingGrams * maxServings);
  const x = products.map(p => p.servingGrams);

  const totalOf = (xs, k) => xs.reduce((sum, xi, i) => sum + per[i][k] * xi, 0);
  const cost = xs =>
    goals.reduce((c, g) => c + g.weight * (totalOf(xs, g.key) - g.value) ** 2, 0) +
    LAMBDA * xs.reduce((c, xi, i) => c + ((xi - products[i].servingGrams) / products[i].servingGrams) ** 2, 0);

  // exact 1-D minimisation per coordinate, clamped to the box
  for (let sweep = 0; sweep < 400; sweep++) {
    let moved = 0;
    for (let i = 0; i < x.length; i++) {
      const s = products[i].servingGrams;
      let num = LAMBDA * (x[i] - s) / (s * s);
      let den = LAMBDA / (s * s);
      for (const g of goals) {
        const a = per[i][g.key];
        num += g.weight * a * (totalOf(x, g.key) - g.value);
        den += g.weight * a * a;
      }
      const next = Math.min(hi[i], Math.max(lo[i], x[i] - num / den));
      moved = Math.max(moved, Math.abs(next - x[i]) / s);
      x[i] = next;
    }
    if (moved < 1e-6) break;
  }

  // round to practical amounts, then greedily nudge by one step where it helps
  let amounts = x.map((xi, i) => Math.max(stepFor(products[i], xi), roundStep(xi, stepFor(products[i], xi))));
  for (let pass = 0; pass < 30; pass++) {
    let improved = false;
    for (let i = 0; i < amounts.length; i++) {
      for (const dir of [-1, 1]) {
        const step = stepFor(products[i], amounts[i]);
        const cand = amounts[i] + dir * step;
        if (cand < Math.max(lo[i], step) || cand > hi[i]) continue;
        const trial = amounts.slice();
        trial[i] = cand;
        if (cost(trial) < cost(amounts) - 1e-12) {
          amounts = trial;
          improved = true;
        }
      }
    }
    if (!improved) break;
  }

  // drop items that are only there at their minimum and don't improve the fit
  const errCost = xs => goals.reduce((c, g) => c + g.weight * (totalOf(xs, g.key) - g.value) ** 2, 0);
  const dropped = [];
  for (let i = 0; i < amounts.length; i++) {
    const live = amounts.filter(a => a > 0).length;
    if (amounts[i] <= 0 || live <= 1 || amounts[i] > lo[i] * 1.5) continue;
    const without = amounts.slice();
    without[i] = 0;
    if (errCost(without) <= errCost(amounts) + 1e-4) {
      amounts = without;
      dropped.push(products[i].name);
    }
  }

  const items = products.map((product, i) => ({ product, amount: amounts[i] })).filter(it => it.amount > 0);
  const totals = sumItems(
    items.map(it => ({ productId: it.product.id, amount: it.amount })),
    new Map(products.map(p => [p.id, p]))
  );
  const deviation = {};
  for (const g of goals) deviation[g.key] = (totals[g.key] - g.value) / g.value;

  return {
    items,
    totals,
    deviation,
    ok: Object.values(deviation).every(d => Math.abs(d) <= OK_TOLERANCE),
    short: goals.filter(g => deviation[g.key] < -OK_TOLERANCE).map(g => g.key),
    over: goals.filter(g => deviation[g.key] > OK_TOLERANCE).map(g => g.key),
    dropped,
    maxed: items.filter(it => it.amount >= hi[products.indexOf(it.product)] * 0.95).map(it => it.product.name)
  };
}

