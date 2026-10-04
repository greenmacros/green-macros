export const CATEGORIES = ["protein", "grains", "veg", "fruit", "fats", "drinks", "other"];

// Keyword rules (English + Japanese), checked in this order: the first match wins.
// "Peanut Butter" must hit `fats` before `protein`, and "Soy Milk" must hit `drinks` first.
const RULES = [
  ["drinks", /\b(milk|juice|tea|coffee|water|drink|smoothie|soda|beer|wine)\b|豆乳|牛乳|ミルク|ジュース|茶|コーヒー|飲料|スムージー/i],
  ["fats", /\b(nuts?|almonds?|peanuts?|cashews?|walnuts?|seeds?|oil|tahini|chia|flax(seed)?|hemp|pistachios?|avocado)\b|ナッツ|アーモンド|落花生|ピーナッツ|くるみ|カシュー|ごま|胡麻|油|アボカド|タヒニ|チア|アマニ|亜麻仁|ヘンプ/i],
  ["fruit", /\b(banana|apple|oranges?|berry|berries|mikan|strawberr(y|ies)|grapes?|mango|pineapple|kiwi|peach|pear|dates?|melon|lemon)\b|バナナ|りんご|リンゴ|みかん|オレンジ|いちご|イチゴ|ベリー|ぶどう|ブドウ|マンゴー|パイナップル|キウイ|もも|なし|デーツ|メロン/i],
  ["veg", /\b(broccoli|spinach|cabbage|carrots?|tomato(es)?|cucumber|mushrooms?|kale|onions?|daikon|zucchini|cauliflower|pumpkin|kabocha|eggplant|lettuce|seaweed|nori|wakame|hijiki|konnyaku|komatsuna|burdock|renkon|lotus|celery|pepper|vegetables?|veg)\b|ブロッコリー|ほうれん|小松菜|キャベツ|にんじん|人参|トマト|きゅうり|キュウリ|なす|ナス|大根|玉ねぎ|たまねぎ|かぼちゃ|カボチャ|きのこ|キノコ|しいたけ|えのき|しめじ|マッシュルーム|海苔|のり|わかめ|ひじき|こんにゃく|ごぼう|れんこん|ケール|ズッキーニ|カリフラワー|野菜/i],
  ["grains", /\b(rice|bread|pasta|noodles?|oats?|oatmeal|quinoa|udon|soba|somen|mochi|potatoes?|potato|tortillas?|cereal|bagel|flour|couscous|toast|wheat|shokupan)\b|米|ご飯|ごはん|パン|パスタ|うどん|そば|そうめん|もち|餅|オート|オーツ|キヌア|じゃがいも|ジャガイモ|さつまいも|サツマイモ|里芋|シリアル/i],
  ["protein", /\b(tofu|tempeh|seitan|natto|lentils?|beans?|chickpeas?|edamame|soy|soya|protein|peas?|okara|kinako|hummus|gluten)\b|豆腐|納豆|大豆|豆|プロテイン|おから|高野|油揚げ|厚揚げ|きな粉|テンペ|セイタン|ミート|ひよこ|レンズ|枝豆/i]
];

/** Best guess of a product's category from its name, unit and macros. Users can always change it. */
export function guessCategory(p) {
  const name = String(p.name ?? "");
  if (p.unit === "ml" && !/oil|油/i.test(name)) return "drinks";
  for (const [cat, re] of RULES) if (re.test(name)) return cat;

  const kcal = (p.protein || 0) * 4 + (p.carbs || 0) * 4 + (p.fat || 0) * 9;
  if (kcal <= 0) return "other";
  if (((p.fat || 0) * 9) / kcal > 0.6) return "fats";
  if (((p.protein || 0) * 4) / kcal > 0.4) return "protein";
  if (((p.carbs || 0) * 4) / kcal > 0.7) return "grains";
  return "other";
}

export function countByCategory(products) {
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, 0]));
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
}
