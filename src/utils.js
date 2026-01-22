export function calcMacros(product, amount) {
  const grams = amount * product.gramsPerUnit;
  const factor = grams / product.servingGrams;

  return {
    cal: product.cal * factor,
    protein: product.protein * factor,
    carbs: product.carbs * factor,
    fat: product.fat * factor
  };
}

export function autoBalanceItem(product, targetMacro, macroType) {
  const macroPerGram =
    macroType === "protein"
      ? product.protein / product.servingGrams
      : macroType === "carbs"
      ? product.carbs / product.servingGrams
      : product.fat / product.servingGrams;

  return targetMacro / macroPerGram;
}
