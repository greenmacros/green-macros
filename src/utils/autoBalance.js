import { calcMacros } from "./macros";

export function autoBalanceMeal(meal, targetMacros, products) {
  const locked = meal.items.filter(i => i.locked);
  const adjustable = meal.items.filter(i => !i.locked);

  if (!adjustable.length) return meal;

  // 1️⃣ current totals from locked items
  const lockedTotals = locked.reduce(
    (t, item) => {
      const p = products.find(p => p.id === item.productId);
      const m = calcMacros(p, item.amount);
      return {
        cal: t.cal + m.cal,
        protein: t.protein + m.protein,
        carbs: t.carbs + m.carbs,
        fat: t.fat + m.fat
      };
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 2️⃣ remaining macro gap
  const gap = {
    protein: targetMacros.protein - lockedTotals.protein,
    carbs: targetMacros.carbs - lockedTotals.carbs,
    fat: targetMacros.fat - lockedTotals.fat
  };

  // 3️⃣ distribute gap
  const priority = meal.priority;

  const totalDensity = adjustable.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId);
    return (
      sum +
      (priority === "protein"
        ? p.protein
        : priority === "carbs"
        ? p.carbs
        : p.fat)
    );
  }, 0);

  const newItems = adjustable.map(item => {
    const p = products.find(p => p.id === item.productId);
    const density =
      priority === "protein"
        ? p.protein
        : priority === "carbs"
        ? p.carbs
        : p.fat;

    if (density === 0) return item;

    const share = density / totalDensity;
    const macroPerUnit = density / p.servingGrams * p.gramsPerUnit;
    const targetAmount = (gap[priority] * share) / macroPerUnit;

    return {
      ...item,
      amount: Math.max(0, targetAmount)
    };
  });

  return {
    ...meal,
    items: [...locked, ...newItems]
  };
}
