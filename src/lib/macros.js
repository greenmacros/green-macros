export const MACRO_KEYS = ["cal", "protein", "carbs", "fat"];

export const MACRO_LABEL_KEYS = {
  cal: "macro.calories",
  protein: "macro.protein",
  carbs: "macro.carbs",
  fat: "macro.fat"
};

export const emptyTotals = () => ({ cal: 0, protein: 0, carbs: 0, fat: 0 });

export function buildProductMap(products) {
  return new Map(products.map(p => [p.id, p]));
}

/** Macros for `amount` of a product (amount is in the product's own unit). */
export function calcMacros(product, amount) {
  if (!product || !amount || !product.servingGrams) return emptyTotals();
  const factor = amount / product.servingGrams;
  return {
    cal: (product.cal || 0) * factor,
    protein: (product.protein || 0) * factor,
    carbs: (product.carbs || 0) * factor,
    fat: (product.fat || 0) * factor
  };
}

export function sumItems(items, productMap) {
  const t = emptyTotals();
  for (const it of items) {
    const m = calcMacros(productMap.get(it.productId), it.amount);
    for (const k of MACRO_KEYS) t[k] += m[k];
  }
  return t;
}

export function sumMeals(meals, productMap) {
  const t = emptyTotals();
  for (const meal of meals) {
    const m = sumItems(meal.items, productMap);
    for (const k of MACRO_KEYS) t[k] += m[k];
  }
  return t;
}

/** Atwater estimate: 4 kcal/g protein & carbs, 9 kcal/g fat. */
export function kcalFromMacros(protein, carbs, fat) {
  return Math.round(4 * protein + 4 * carbs + 9 * fat);
}

/** True when the stated calories differ a lot from what the macros imply (fibre/alcohol excluded). */
export function caloriesLookOff(p) {
  const est = kcalFromMacros(p.protein, p.carbs, p.fat);
  if (!est && !p.cal) return false;
  return Math.abs(p.cal - est) > Math.max(30, est * 0.3);
}

export function proximityClass(actual, target) {
  if (!target) return "";
  const ratio = actual / target;
  if (ratio >= 0.95 && ratio <= 1.05) return "hit";
  if (ratio >= 0.85 && ratio <= 1.15) return "close";
  return "off";
}

/** Like proximityClass, but "still under target" isn't an error while you're planning: only hit / close / over are flagged. */
export function progressClass(actual, target) {
  if (!target || actual / target < 0.85) return "";
  return proximityClass(actual, target);
}

export function formatAmount(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}
