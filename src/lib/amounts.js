import { emptyTotals } from "./macros";

// Shared helpers for product swaps ("fit a product").
export const STEP = { g: 5, ml: 5, unit: 0.5, scoop: 0.5 };
export const WEIGHT = { protein: 1, carbs: 1, fat: 1, cal: 0.5 };
export const MIN_SCALE = { protein: 10, carbs: 10, fat: 10, cal: 100 };
export const GOAL_KEYS = ["protein", "carbs", "fat", "cal"];
export const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };

/** Practical rounding step: 1 for small g/ml amounts, 5 for larger, 0.5 for units/scoops. */
export function stepFor(product, amount) {
  if (product.unit === "g" || product.unit === "ml") return amount < 40 ? 1 : STEP[product.unit];
  return STEP[product.unit] ?? 1;
}

/** Round to a practical amount, never below one step. */
export function roundAmount(product, value) {
  const step = stepFor(product, value);
  return Math.max(step, Math.round(value / step) * step);
}

/** Macros per single unit (1 g / 1 ml / 1 unit) of a product. */
export function perUnit(product) {
  return {
    cal: (product.cal || 0) / product.servingGrams,
    protein: (product.protein || 0) / product.servingGrams,
    carbs: (product.carbs || 0) / product.servingGrams,
    fat: (product.fat || 0) / product.servingGrams
  };
}

/** Targets in profile form ({calories, protein, ...}) → weighted goals; blank targets are ignored. */
export function goalsFrom(profile) {
  return GOAL_KEYS.filter(k => profile[PROFILE_KEY[k]] > 0).map(k => {
    const value = profile[PROFILE_KEY[k]];
    return { key: k, value, weight: WEIGHT[k] / Math.max(value, MIN_SCALE[k]) ** 2 };
  });
}

/** Weighted squared relative distance of `totals` from the goals (0 = perfect). */
export function costOf(totals, goals) {
  return goals.reduce((c, g) => c + g.weight * (totals[g.key] - g.value) ** 2, 0);
}

export const addTotals = (a, b, sign = 1) => {
  const out = emptyTotals();
  for (const k of Object.keys(out)) out[k] = a[k] + sign * b[k];
  return out;
};
