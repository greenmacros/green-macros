export function calcMacros(product, grams) {
  if (!product || !grams || !product.servingGrams) {
    return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const factor = grams / product.servingGrams;

  return {
    cal: (product.cal || 0) * factor,
    protein: (product.protein || 0) * factor,
    carbs: (product.carbs || 0) * factor,
    fat: (product.fat || 0) * factor
  };
}
