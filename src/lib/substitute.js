import { GOAL_KEYS, MIN_SCALE, WEIGHT, perUnit, roundAmount } from "./amounts";
import { calcMacros } from "./macros";

/*
  "Fit this product into my plan": for every item in the plan, work out how much of the
  new product gives the same macros as that item (least squares on relative error), and how
  close that gets. Purely macro-based — taste, texture, allergens and micronutrients are not considered.
*/

const FIT_LEVELS = [
  [0.9, "great"],
  [0.75, "good"],
  [0.5, "rough"]
];
export const MIN_FIT = 0.4;

export function fitLabel(score) {
  return (FIT_LEVELS.find(([min]) => score >= min) ?? [0, "poor"])[1];
}

/**
 * @param candidate  product to try (need not be saved in the product list yet)
 * @param plans      plans to search
 * @param productMap Map id → product for existing items
 * @returns swaps sorted best-first: { planId, planName, mealId, mealName, itemId, oldProduct, oldAmount,
 *          newAmount, oldMacros, newMacros, delta, score, level }
 */
export function suggestSwaps(candidate, plans, productMap, { includeLocked = false, limit = 10 } = {}) {
  const a = perUnit(candidate);
  const swaps = [];

  for (const plan of plans) {
    for (const meal of plan.data.meals) {
      for (const it of meal.items) {
        const old = productMap.get(it.productId);
        if (!old || old.id === candidate.id || it.amount <= 0 || (it.locked && !includeLocked)) continue;

        const target = calcMacros(old, it.amount);
        // best scalar x minimising Σ w·((a_k·x − target_k)/scale_k)²
        let num = 0;
        let den = 0;
        for (const k of GOAL_KEYS) {
          const w = WEIGHT[k] / Math.max(target[k], MIN_SCALE[k]) ** 2;
          num += w * a[k] * target[k];
          den += w * a[k] * a[k];
        }
        if (den <= 0) continue;

        const x = Math.min(candidate.servingGrams * 6, Math.max(candidate.servingGrams * 0.1, num / den));
        const newAmount = roundAmount(candidate, x);
        const newMacros = calcMacros(candidate, newAmount);

        const delta = {};
        let wSum = 0;
        let err = 0;
        for (const k of GOAL_KEYS) {
          delta[k] = newMacros[k] - target[k];
          const w = WEIGHT[k];
          const rel = delta[k] / Math.max(target[k], MIN_SCALE[k]);
          err += w * rel * rel;
          wSum += w;
        }
        const score = Math.max(0, 1 - Math.sqrt(err / wSum));

        swaps.push({
          planId: plan.id,
          planName: plan.name,
          mealId: meal.id,
          mealName: meal.name,
          itemId: it.id,
          oldProduct: old,
          oldAmount: it.amount,
          newAmount,
          oldMacros: target,
          newMacros,
          delta,
          score,
          level: fitLabel(score)
        });
      }
    }
  }

  return swaps.filter(s => s.score >= MIN_FIT).sort((x, y) => y.score - x.score).slice(0, limit);
}
