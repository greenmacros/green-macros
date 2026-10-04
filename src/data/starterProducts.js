// Approximate values (USDA FoodData Central / MEXT food tables, rounded) — users are told to verify against real labels.
// All plant-based. Values are for `servingGrams` of the product in its `unit`.
export const starterProducts = lang =>
  STARTER_PRODUCTS.map(({ ja, ...p }) => (lang === "ja" ? { ...p, name: ja } : p));

export const STARTER_PRODUCTS = [
  // protein
  { name: "Tofu (firm)", ja: "木綿豆腐", servingGrams: 100, unit: "g", cal: 73, protein: 7, carbs: 1.5, fat: 4.9 },
  { name: "Tempeh", ja: "テンペ", servingGrams: 100, unit: "g", cal: 192, protein: 20.3, carbs: 7.6, fat: 10.8 },
  { name: "Edamame (shelled)", ja: "枝豆(むき)", servingGrams: 100, unit: "g", cal: 121, protein: 11.9, carbs: 8.9, fat: 5.2 },
  { name: "Lentils (cooked)", ja: "レンズ豆(ゆで)", servingGrams: 100, unit: "g", cal: 116, protein: 9, carbs: 20.1, fat: 0.4 },
  { name: "Chickpeas (cooked)", ja: "ひよこ豆(ゆで)", servingGrams: 100, unit: "g", cal: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
  { name: "Black Beans (cooked)", ja: "黒豆(ゆで)", servingGrams: 100, unit: "g", cal: 132, protein: 8.9, carbs: 23.7, fat: 0.5 },
  { name: "Natto", ja: "納豆", servingGrams: 50, unit: "g", cal: 95, protein: 8.3, carbs: 6.1, fat: 5 },
  { name: "Protein Shake (powder)", ja: "プロテイン(粉末)", servingGrams: 1, unit: "scoop", cal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: "Hummus", ja: "ホムス", servingGrams: 30, unit: "g", cal: 50, protein: 2.4, carbs: 4.3, fat: 2.9 },
  // grains & starches
  { name: "White Rice (cooked)", ja: "白米(炊飯)", servingGrams: 100, unit: "g", cal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  { name: "Brown Rice (cooked)", ja: "玄米(炊飯)", servingGrams: 100, unit: "g", cal: 123, protein: 2.7, carbs: 25.6, fat: 1 },
  { name: "Oats (dry)", ja: "オートミール", servingGrams: 50, unit: "g", cal: 195, protein: 8.5, carbs: 33.2, fat: 3.5 },
  { name: "Whole Wheat Pasta (cooked)", ja: "全粒粉パスタ(ゆで)", servingGrams: 100, unit: "g", cal: 124, protein: 5.3, carbs: 26.5, fat: 0.5 },
  { name: "Quinoa (cooked)", ja: "キヌア(ゆで)", servingGrams: 100, unit: "g", cal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  { name: "Whole Wheat Bread", ja: "全粒粉パン", servingGrams: 1, unit: "unit", cal: 79, protein: 4.2, carbs: 13.1, fat: 1.1 },
  { name: "Sweet Potato (baked)", ja: "さつまいも(焼き)", servingGrams: 100, unit: "g", cal: 90, protein: 2, carbs: 20.7, fat: 0.2 },
  { name: "Potatoes (boiled)", ja: "じゃがいも(ゆで)", servingGrams: 100, unit: "g", cal: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
  // vegetables
  { name: "Broccoli", ja: "ブロッコリー", servingGrams: 150, unit: "g", cal: 51, protein: 4.2, carbs: 9.9, fat: 0.6 },
  { name: "Spinach", ja: "ほうれん草", servingGrams: 100, unit: "g", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Tomato", ja: "トマト", servingGrams: 100, unit: "g", cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: "Carrot", ja: "にんじん", servingGrams: 100, unit: "g", cal: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  { name: "Mushrooms", ja: "マッシュルーム", servingGrams: 100, unit: "g", cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  // fruit
  { name: "Banana", ja: "バナナ", servingGrams: 1, unit: "unit", cal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Apple", ja: "りんご", servingGrams: 1, unit: "unit", cal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Blueberries", ja: "ブルーベリー", servingGrams: 100, unit: "g", cal: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
  // fats
  { name: "Peanut Butter", ja: "ピーナッツバター", servingGrams: 30, unit: "g", cal: 176, protein: 7.5, carbs: 6, fat: 15 },
  { name: "Almonds", ja: "アーモンド", servingGrams: 30, unit: "g", cal: 174, protein: 6.4, carbs: 6.5, fat: 15 },
  { name: "Chia Seeds", ja: "チアシード", servingGrams: 15, unit: "g", cal: 73, protein: 2.5, carbs: 6.3, fat: 4.6 },
  { name: "Avocado", ja: "アボカド", servingGrams: 100, unit: "g", cal: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { name: "Olive Oil", ja: "オリーブオイル", servingGrams: 10, unit: "g", cal: 88, protein: 0, carbs: 0, fat: 10 },
  // drinks
  { name: "Soy Milk (unsweetened)", ja: "豆乳(無調整)", servingGrams: 200, unit: "ml", cal: 88, protein: 7.2, carbs: 6.2, fat: 4 }
];
