import { calcMacros } from "./macros";

export function exportPlanToCSV(meals, products) {
  const headers = [
    "Meal",
    "Product",
    "Amount",
    "Unit",
    "Calories",
    "Protein",
    "Carbs",
    "Fat",
    "Locked"
  ];

  const rows = [];

  meals.forEach((meal, mealIndex) => {
    meal.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const m = calcMacros(product, item.amount);

      rows.push([
        ["Breakfast", "Lunch", "Dinner"][mealIndex],
        product.name,
        item.amount,
        product.unit,
        m.cal.toFixed(1),
        m.protein.toFixed(1),
        m.carbs.toFixed(1),
        m.fat.toFixed(1),
        item.locked ? "YES" : "NO"
      ]);
    });
  });

  const csv =
    headers.join(",") +
    "\n" +
    rows.map(r => r.join(",")).join("\n");

  download(csv, "meal-plan.csv");
}

function download(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
