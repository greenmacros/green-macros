import { calcMacros, sumMeals } from "./macros";

const STEP = { g: 1, ml: 1, unit: 0.25, scoop: 0.25 };

function roundTo(value, step) {
  return Math.max(0, Math.round(value / step) * step);
}

/**
 * Scale every unlocked item by one common factor so the day hits `target`
 * for `macro`. Locked items are left alone. Returns { data, factor } or { error: "noTarget" | "noContribution" | "lockedExceed" }.
 */
export function scaleToTarget(planData, productMap, macro, target) {
  if (!target) return { error: "noTarget" };

  const lockedMeals = planData.meals.map(m => ({ ...m, items: m.items.filter(i => i.locked) }));
  const free = planData.meals.map(m => ({ ...m, items: m.items.filter(i => !i.locked) }));
  const locked = sumMeals(lockedMeals, productMap);
  const freeTotal = sumMeals(free, productMap)[macro];

  if (freeTotal <= 0) return { error: "noContribution" };
  const factor = (target - locked[macro]) / freeTotal;
  if (factor <= 0) return { error: "lockedExceed" };

  const meals = planData.meals.map(meal => ({
    ...meal,
    items: meal.items.map(it => {
      const p = productMap.get(it.productId);
      if (it.locked || !p || !calcMacros(p, it.amount)[macro]) return it;
      return { ...it, amount: roundTo(it.amount * factor, STEP[p.unit] ?? 1) };
    })
  }));
  return { data: { ...planData, meals }, factor };
}
