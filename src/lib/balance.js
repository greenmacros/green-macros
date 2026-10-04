import { addTotals, costOf, goalsFrom, perUnit, roundAmount, stepFor } from "./amounts";
import { calcMacros, sumMeals } from "./macros";

/*
  Optional "suggest ways to balance my day". Looks at how far the day's totals are from the
  targets and proposes a few small edits — scale an existing item, remove one, or add one of
  your products — ranked by how much closer each gets you. Nothing is applied automatically.
*/

export const BALANCED_TOLERANCE = 0.05;
const MIN_GAIN = 0.1; // an edit must remove at least 10% of the current error to be worth suggesting

/** Best amount x ≥ 0 for a product so that (others + x·per-unit) is closest to the goals. */
function bestAmount(a, others, goals) {
  let num = 0;
  let den = 0;
  for (const g of goals) {
    num += g.weight * a[g.key] * (g.value - others[g.key]);
    den += g.weight * a[g.key] * a[g.key];
  }
  return den > 0 ? num / den : 0;
}

/**
 * @returns { status: "noTarget" | "balanced" | "ok", totals, deviation, actions }
 * action: { type: "scale"|"remove"|"add", mealId, itemId?, product, oldAmount?, newAmount, before, after, gain }
 */
export function suggestBalance(planData, productMap, products, { addToMealId, limit = 5, maxAdds = 3 } = {}) {
  const goals = goalsFrom(planData.profile);
  if (!goals.length) return { status: "noTarget" };

  const totals = sumMeals(planData.meals, productMap);
  const deviation = Object.fromEntries(goals.map(g => [g.key, (totals[g.key] - g.value) / g.value]));
  if (Object.values(deviation).every(d => Math.abs(d) <= BALANCED_TOLERANCE)) {
    return { status: "balanced", totals, deviation, actions: [] };
  }

  const cost0 = costOf(totals, goals);
  const actions = [];

  // 1) change or remove something already in the plan
  for (const meal of planData.meals) {
    for (const it of meal.items) {
      const product = productMap.get(it.productId);
      if (!product || it.locked || it.amount <= 0) continue;
      const current = calcMacros(product, it.amount);
      const others = addTotals(totals, current, -1);
      const x = Math.min(it.amount * 2, bestAmount(perUnit(product), others, goals));
      const step = stepFor(product, it.amount);
      const newAmount = x < step / 2 ? 0 : roundAmount(product, x);
      if (newAmount === it.amount) continue;

      const after = addTotals(others, calcMacros(product, newAmount));
      actions.push({
        type: newAmount === 0 ? "remove" : "scale",
        mealId: meal.id,
        itemId: it.id,
        product,
        oldAmount: it.amount,
        newAmount,
        before: totals,
        after,
        gain: cost0 - costOf(after, goals)
      });
    }
  }

  // 2) add one of the user's products to a meal
  const targetMeal = planData.meals.find(m => m.id === addToMealId) ?? planData.meals[0];
  // products already in the plan show up as "change amount" suggestions, so only offer new ones here
  const alreadyThere = new Set(planData.meals.flatMap(m => m.items.map(i => i.productId)));
  for (const product of products) {
    if (alreadyThere.has(product.id)) continue;
    const x = Math.min(product.servingGrams * 2, Math.max(product.servingGrams * 0.25, bestAmount(perUnit(product), totals, goals)));
    const newAmount = roundAmount(product, x);
    const after = addTotals(totals, calcMacros(product, newAmount));
    actions.push({
      type: "add",
      mealId: targetMeal.id,
      product,
      newAmount,
      before: totals,
      after,
      gain: cost0 - costOf(after, goals)
    });
  }

  const useful = actions.filter(a => a.gain >= cost0 * MIN_GAIN).sort((x, y) => y.gain - x.gain);
  const picked = [];
  let adds = 0;
  for (const a of useful) {
    if (a.type === "add") {
      if (adds >= maxAdds) continue;
      adds++;
    }
    picked.push(a);
    if (picked.length >= limit) break;
  }
  return { status: "ok", totals, deviation, actions: picked };
}
