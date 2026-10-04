// Approximate values — users are told to verify against real labels.
export const starterProducts = lang =>
  STARTER_PRODUCTS.map(({ ja, ...p }) => (lang === "ja" ? { ...p, name: ja } : p));

export const STARTER_PRODUCTS = [
  { name: "White Rice (cooked)", ja: "白米(炊飯)", servingGrams: 100, unit: "g", cal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Tofu (firm)", ja: "木綿豆腐", servingGrams: 100, unit: "g", cal: 76, protein: 8, carbs: 2, fat: 5 },
  { name: "Broccoli", ja: "ブロッコリー", servingGrams: 150, unit: "g", cal: 51, protein: 4.2, carbs: 10, fat: 0.6 },
  { name: "Potatoes (boiled)", ja: "じゃがいも(ゆで)", servingGrams: 100, unit: "g", cal: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "Lentils (cooked)", ja: "レンズ豆(ゆで)", servingGrams: 100, unit: "g", cal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Chickpeas (cooked)", ja: "ひよこ豆(ゆで)", servingGrams: 100, unit: "g", cal: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: "Soy Milk (unsweetened)", ja: "豆乳(無調整)", servingGrams: 200, unit: "ml", cal: 66, protein: 7, carbs: 1, fat: 3.6 },
  { name: "Oats (dry)", ja: "オートミール", servingGrams: 50, unit: "g", cal: 190, protein: 6.5, carbs: 33, fat: 3.5 },
  { name: "Banana", ja: "バナナ", servingGrams: 1, unit: "unit", cal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Peanut Butter", ja: "ピーナッツバター", servingGrams: 30, unit: "g", cal: 188, protein: 8, carbs: 6, fat: 16 },
  { name: "Protein Shake (powder)", ja: "プロテイン(粉末)", servingGrams: 1, unit: "scoop", cal: 120, protein: 24, carbs: 3, fat: 1.5 }
];
