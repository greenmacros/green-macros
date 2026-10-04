// @vitest-environment node
import { describe, expect, it } from "vitest";
import { plansToCSV } from "../exporters";
import { parseLabel } from "../labelParser";
import { buildProductMap, calcMacros, sumMeals } from "../macros";
import { createItem, createMeal, createPlan, normalizePlanner } from "../plans";
import { normalizeProducts } from "../products";
import { mergeShared } from "../share";

const rice = { id: "r", name: "Rice", unit: "g", servingGrams: 100, cal: 130, protein: 3, carbs: 28, fat: 0.3 };
const tofu = { id: "t", name: "Tofu", unit: "g", servingGrams: 100, cal: 76, protein: 8, carbs: 2, fat: 5 };
const map = buildProductMap([rice, tofu]);

describe("macros", () => {
  it("scales by amount / serving", () => {
    expect(calcMacros(rice, 200).protein).toBe(6);
  });
  it("is zero for missing products", () => {
    expect(calcMacros(undefined, 100).cal).toBe(0);
  });
});

describe("normalizers", () => {
  it("migrates legacy numeric ids and placeholder items", () => {
    const state = normalizePlanner({
      plans: [{ id: 5, name: "Old", data: { profile: {}, meals: [{ name: "M", items: [{ productId: "__EMPTY__", amount: 0, note: "Enter an item on the Products tab" }, { productId: 1, amount: 50 }] }] } }],
      activePlanId: 99
    });
    expect(state.activePlanId).toBe("5");
    const [empty, real] = state.plans[0].data.meals[0].items;
    expect(empty.productId).toBeNull();
    expect(empty.note).toBe("");
    expect(real.productId).toBe("1");
  });
  it("always yields at least one plan, and dedupes product ids", () => {
    expect(normalizePlanner(null).plans).toHaveLength(1);
    const ps = normalizeProducts([{ id: 1, name: "a" }, { id: 1, name: "b" }]);
    expect(new Set(ps.map(p => p.id)).size).toBe(2);
  });
});

describe("labelParser", () => {
  it("reads a US-style label, ignoring saturated fat", () => {
    const { product, missing } = parseLabel(
      "Seitan Strips\nServing size 85g\nCalories 120\nTotal Fat 2g\nSaturated Fat 0.5g\nTotal Carbohydrate 4g\nProtein 21g"
    );
    expect(product).toMatchObject({ name: "Seitan Strips", servingGrams: 85, cal: 120, fat: 2, carbs: 4, protein: 21 });
    expect(missing).toEqual([]);
  });
  it("handles kcal-after-number, kJ and comma decimals", () => {
    expect(parseLabel("Energy 1200 kJ / 290 kcal\nProtein 3,5 g").product).toMatchObject({ cal: 290, protein: 3.5 });
    expect(parseLabel("Energy 418 kJ").product.cal).toBe(100);
  });
  it("parses Japanese labels with full-width colons and spaces", () => {
    const { product, missing, assumedServing } = parseLabel(
      "【栄養成分表示（100gあたり）】\n熱量　　　　　：103kcal\nたんぱく質　　：20.0g\n脂質　　　　　：0.6g\nコレステロール：0mg\n炭水化物　　　：8.1g\n　ー食物繊維　：7.0g\n食塩相当量　　：0.6g"
    );
    expect(product).toMatchObject({ servingGrams: 100, cal: 103, protein: 20, fat: 0.6, carbs: 8.1 });
    expect(missing).toEqual([]);
    expect(assumedServing).toBe(false);
  });
  it("flags missing fields", () => {
    expect(parseLabel("hello").missing).toHaveLength(4);
  });
});

describe("mergeShared", () => {
  it("re-ids clashing products and re-points imported items", () => {
    const mine = createPlan("Mine");
    const shared = {
      products: [{ ...rice, protein: 99 }],
      plans: [{ ...createPlan("Theirs"), data: { profile: {}, meals: [createMeal("m", [createItem("r", 100)])] } }]
    };
    const out = mergeShared([rice], { plans: [mine], activePlanId: mine.id }, shared);
    expect(out.products).toHaveLength(2);
    const newId = out.products[1].id;
    expect(newId).not.toBe("r");
    expect(out.plannerState.plans[1].data.meals[0].items[0].productId).toBe(newId);
    expect(out.plannerState.plans).toHaveLength(2);
  });
});

describe("csv", () => {
  it("quotes fields and defuses formulas", () => {
    const plan = { name: "=cmd", data: { meals: [{ name: 'He said "hi"', items: [createItem("r", 100)] }] } };
    const csv = plansToCSV([plan], map);
    expect(csv).toContain(`"'=cmd"`);
    expect(csv).toContain('"He said ""hi"""');
  });
});

describe("food search", () => {
  it("finds Japanese foods by kanji, hiragana, katakana and English", async () => {
    const { searchFoods } = await import("../foods");
    const { FOODS } = await import("../../data/foods");
    expect(searchFoods(FOODS, "納豆")[0].en).toBe("Natto");
    expect(searchFoods(FOODS, "なっとう")[0].en).toBe("Natto");
    expect(searchFoods(FOODS, "ナットウ")[0].en).toBe("Natto");
    expect(searchFoods(FOODS, "tofu").length).toBeGreaterThan(2);
    expect(searchFoods(FOODS, "natto", "global")).toHaveLength(0);
  });
  it("bundled values are sane (calories roughly match macros)", async () => {
    const { FOODS } = await import("../../data/foods");
    const fibreHeavy = new Set(["Hijiki, dried", "Nori (roasted seaweed)", "Konnyaku", "Koya-dofu (freeze-dried tofu)"]);
    for (const f of FOODS) {
      if (fibreHeavy.has(f.en)) continue; // carbs by difference include a lot of fibre
      const est = 4 * f.protein + 4 * f.carbs + 9 * f.fat;
      expect(Math.abs(f.cal - est), f.en).toBeLessThan(Math.max(60, est * 0.4));
    }
  });
});

describe("food CSV import", () => {
  it("reads English headers", async () => {
    const { parseFoodsCsv } = await import("../foodCsv");
    const { products } = parseFoodsCsv('name,kcal,protein,carbs,fat\n"Tofu, firm",76,8,2,5\n');
    expect(products[0]).toMatchObject({ name: "Tofu, firm", cal: 76, protein: 8, servingGrams: 100 });
  });
  it("reads Japanese (MEXT-style) headers and tab separators", async () => {
    const { parseFoodsCsv } = await import("../foodCsv");
    const { products, skipped } = parseFoodsCsv("食品名\tエネルギー(kcal)\tたんぱく質\t脂質\t炭水化物\n納豆\t190\t16.5\t10\t12.1\n\t1\t1\t1\t1");
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({ name: "納豆", cal: 190, protein: 16.5, fat: 10, carbs: 12.1 });
    expect(skipped).toBe(1);
  });
  it("rejects files without a name column", async () => {
    const { parseFoodsCsv } = await import("../foodCsv");
    expect(() => parseFoodsCsv("a,b\n1,2")).toThrow();
  });
});

describe("planner migration", () => {
  it("adds week and meal targets to old saves", () => {
    const s = normalizePlanner({ plans: [{ id: 1, data: { meals: [{ items: [] }] } }] });
    expect(s.week).toHaveLength(7);
    expect(s.plans[0].data.meals[0].target).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
  it("uses localized default names", () => {
    expect(normalizePlanner(null, { plan: "プラン", meal: "食事" }).plans[0].name).toBe("プラン 1");
  });
});

describe("pickNotice (data-safety banners)", () => {
  const DAY = 86400000;
  const now = 100 * DAY;
  const base = { ios: false, standalone: false, hasData: true, lastBackup: null, firstUse: now - 10 * DAY, dismissed: {}, now };

  it("stays quiet with no data or on day one", async () => {
    const { pickNotice } = await import("../persistence");
    expect(pickNotice({ ...base, hasData: false })).toBeNull();
    expect(pickNotice({ ...base, firstUse: now - DAY })).toBeNull();
  });
  it("asks for a first backup, then again after 30 days", async () => {
    const { pickNotice } = await import("../persistence");
    expect(pickNotice(base)).toBe("backup");
    expect(pickNotice({ ...base, lastBackup: now - 5 * DAY })).toBeNull();
    expect(pickNotice({ ...base, lastBackup: now - 40 * DAY })).toBe("backup");
  });
  it("respects dismissals", async () => {
    const { pickNotice } = await import("../persistence");
    expect(pickNotice({ ...base, dismissed: { backup: now - 2 * DAY } })).toBeNull();
    expect(pickNotice({ ...base, dismissed: { backup: now - 9 * DAY } })).toBe("backup");
  });
  it("shows the home-screen tip on iOS browser tabs only, ahead of the backup banner", async () => {
    const { pickNotice } = await import("../persistence");
    expect(pickNotice({ ...base, ios: true })).toBe("ios");
    expect(pickNotice({ ...base, ios: true, standalone: true })).toBe("backup");
    expect(pickNotice({ ...base, ios: true, dismissed: { ios: now - DAY } })).toBe("backup");
  });
});

describe("archived plans", () => {
  it("keeps a visible active plan even if the saved data says otherwise", () => {
    const s = normalizePlanner({
      plans: [{ id: "a", archived: true, data: {} }, { id: "b", data: {} }],
      activePlanId: "a"
    });
    expect(s.activePlanId).toBe("b");
    expect(s.plans[0].archived).toBe(true);
  });
  it("never leaves every plan archived", () => {
    const s = normalizePlanner({ plans: [{ id: "a", archived: true, data: {} }, { id: "b", archived: true, data: {} }] });
    expect(s.plans.filter(p => !p.archived)).toHaveLength(1);
    expect(s.plans.find(p => p.id === s.activePlanId).archived).toBe(false);
  });
});

describe("full backup with dates", () => {
  const state = () => ({ products: [rice], plannerState: normalizePlanner({ plans: [{ id: "p", name: "A", data: {} }] }), recipes: [] });

  it("stamps the file and round-trips", async () => {
    const { buildBackup, parseBackup } = await import("../backup");
    const file = buildBackup(state(), new Date("2026-10-04T12:34:56Z"));
    expect(file).toMatchObject({ app: "GreenMacros", version: 2, exportedAt: "2026-10-04T12:34:56.000Z", counts: { plans: 1, products: 1, recipes: 0 } });
    const back = parseBackup(JSON.parse(JSON.stringify(file)));
    expect(back.exportedAt).toBe(Date.parse("2026-10-04T12:34:56Z"));
    expect(back.products[0].name).toBe("Rice");
    expect(back.counts.plans).toBe(1);
  });
  it("still reads old backups without a date", async () => {
    const { parseBackup } = await import("../backup");
    const old = { products: [rice], plannerState: { plans: [{ id: 1, name: "Old", data: {} }] } };
    const back = parseBackup(old);
    expect(back.exportedAt).toBeNull();
    expect(back.recipes).toEqual([]);
  });
  it("rejects files that aren't backups and names files by local date", async () => {
    const { parseBackup, backupFilename } = await import("../backup");
    expect(() => parseBackup({ foo: 1 })).toThrow();
    expect(backupFilename("green-macros-backup", new Date(2026, 9, 4, 13, 5, 9))).toBe("green-macros-backup-2026-10-04-130509.json");
  });
});

describe("suggestSwaps (fit a product into my plan)", () => {
  const mk = (id, name, cal, protein, carbs, fat, servingGrams = 100, unit = "g") => ({ id, name, cal, protein, carbs, fat, servingGrams, unit });
  const tofuP = mk("t", "Tofu", 76, 8, 2, 5);
  const riceP = mk("r", "Rice", 130, 2.7, 28, 0.3);
  const planOf = items => ({ id: "p", name: "Day", data: { profile: {}, meals: [createMeal("Lunch", items)] } });
  const pmap = new Map([tofuP, riceP].map(p => [p.id, p]));

  it("ranks the like-for-like swap first and sizes the amount to match macros", async () => {
    const { suggestSwaps } = await import("../substitute");
    const tempeh = mk("x", "Tempeh", 190, 20, 9, 11);
    const plan = planOf([createItem("t", 200), createItem("r", 150)]);
    const swaps = suggestSwaps(tempeh, [plan], pmap);
    expect(swaps[0].oldProduct.name).toBe("Tofu");
    expect(swaps[0].level).not.toBe("poor");
    expect(Math.abs(swaps[0].newMacros.protein - swaps[0].oldMacros.protein)).toBeLessThan(6);
    expect(swaps.length === 1 || swaps[0].score > swaps[1].score).toBe(true);
  });
  it("skips locked items, the same product, and hopeless swaps", async () => {
    const { suggestSwaps } = await import("../substitute");
    const oil2 = mk("o", "Oil", 884, 0, 0, 100);
    const plan = planOf([{ ...createItem("t", 200), locked: true }, createItem("r", 150)]);
    expect(suggestSwaps(tofuP, [plan], pmap)).toHaveLength(0);
    expect(suggestSwaps(oil2, [plan], pmap)).toHaveLength(0);
    expect(suggestSwaps(oil2, [plan], pmap, { includeLocked: true }).every(s => s.score >= 0.4)).toBe(true);
  });
});

describe("reorder helpers (organize mode)", () => {
  const ids = list => list.map(x => x.id).join("");
  const L = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

  it("moves entries and ignores no-ops", async () => {
    const { moveInList, nudgeInList } = await import("../reorder");
    expect(ids(moveInList(L, "a", "c"))).toBe("bcad");
    expect(ids(moveInList(L, "d", "a"))).toBe("dabc");
    expect(moveInList(L, "a", "a")).toBe(L);
    expect(moveInList(L, "x", "a")).toBe(L);
    expect(ids(nudgeInList(L, "b", 1))).toBe("acbd");
    expect(nudgeInList(L, "a", -1)).toBe(L);
    expect(nudgeInList(L, "d", 1)).toBe(L);
  });

  const meals = () => [
    { id: "m1", items: [{ id: "i1" }, { id: "i2" }, { id: "i3" }] },
    { id: "m2", items: [{ id: "j1" }] },
    { id: "m3", items: [] }
  ];
  const layout = ms => ms.map(m => m.items.map(i => i.id).join(",")).join("|");

  it("reorders items within a meal (down lands after the target, up before)", async () => {
    const { moveItemInMeals } = await import("../reorder");
    expect(layout(moveItemInMeals(meals(), "i1", "m1", "i3"))).toBe("i2,i3,i1|j1|");
    expect(layout(moveItemInMeals(meals(), "i3", "m1", "i1"))).toBe("i3,i1,i2|j1|");
    expect(layout(moveItemInMeals(meals(), "i1", "m1", null))).toBe("i2,i3,i1|j1|");
  });
  it("moves items across meals: before a target, to the end, and into an empty meal", async () => {
    const { moveItemInMeals } = await import("../reorder");
    expect(layout(moveItemInMeals(meals(), "i2", "m2", "j1"))).toBe("i1,i3|i2,j1|");
    expect(layout(moveItemInMeals(meals(), "i2", "m2", null))).toBe("i1,i3|j1,i2|");
    expect(layout(moveItemInMeals(meals(), "j1", "m3", null))).toBe("i1,i2,i3||j1");
  });
  it("never loses or duplicates an item, and ignores bad targets", async () => {
    const { moveItemInMeals } = await import("../reorder");
    const out = moveItemInMeals(meals(), "i2", "m3", "nope");
    expect(out.flatMap(m => m.items).map(i => i.id).sort().join("")).toBe("i1i2i3j1");
    const same = meals();
    expect(moveItemInMeals(same, "zzz", "m1")).toBe(same);
    expect(moveItemInMeals(same, "i1", "ghost")).toBe(same);
  });
});

describe("product categories", () => {
  const g = (name, extra = {}) => ({ name, unit: "g", servingGrams: 100, cal: 100, protein: 5, carbs: 15, fat: 2, ...extra });

  it("guesses sensible categories from names (English and Japanese)", async () => {
    const { guessCategory } = await import("../categories");
    expect(guessCategory(g("Tofu (firm)"))).toBe("protein");
    expect(guessCategory(g("納豆"))).toBe("protein");
    expect(guessCategory(g("Peanut Butter"))).toBe("fats");
    expect(guessCategory(g("Soy Milk (unsweetened)", { unit: "ml" }))).toBe("drinks");
    expect(guessCategory(g("豆乳(無調整)", { unit: "ml" }))).toBe("drinks");
    expect(guessCategory(g("White Rice (cooked)"))).toBe("grains");
    expect(guessCategory(g("さつまいも(蒸し)"))).toBe("grains");
    expect(guessCategory(g("Broccoli"))).toBe("veg");
    expect(guessCategory(g("Banana", { unit: "unit" }))).toBe("fruit");
    expect(guessCategory(g("Protein Shake (powder)", { unit: "scoop" }))).toBe("protein");
    expect(guessCategory(g("Olive oil", { unit: "ml" }))).toBe("fats");
  });
  it("falls back to the macro profile", async () => {
    const { guessCategory } = await import("../categories");
    expect(guessCategory(g("Mystery bar", { protein: 1, carbs: 2, fat: 40 }))).toBe("fats");
    expect(guessCategory(g("Mystery powder", { protein: 60, carbs: 5, fat: 3 }))).toBe("protein");
    expect(guessCategory(g("Mystery flour", { protein: 2, carbs: 80, fat: 1 }))).toBe("grains");
    expect(guessCategory(g("Mystery", { protein: 0, carbs: 0, fat: 0 }))).toBe("other");
  });
  it("adds a category to old products and keeps a chosen one", () => {
    const [a, b] = normalizeProducts([{ id: 1, name: "Tofu" }, { id: 2, name: "Tofu", category: "veg" }]);
    expect(a.category).toBe("protein");
    expect(b.category).toBe("veg");
    expect(normalizeProducts([{ id: 3, name: "x", category: "bogus" }])[0].category).toBe("other");
  });
  it("sorts by how often a product is used", async () => {
    const { sortProducts } = await import("../products");
    const ps = [{ id: "a", name: "A" }, { id: "b", name: "B" }, { id: "c", name: "C" }];
    const usage = new Map([["c", 5], ["b", 2]]);
    expect(sortProducts(ps, "used", usage).map(p => p.id).join("")).toBe("cba");
  });
});

describe("findDuplicateGroups", () => {
  const mk = (id, name, over = {}) => ({ id, name, unit: "g", servingGrams: 100, cal: 76, protein: 8, carbs: 2, fat: 5, ...over });
  it("groups by normalized name, then by identical nutrition, never twice", async () => {
    const { findDuplicateGroups } = await import("../duplicates");
    const groups = findDuplicateGroups([
      mk("1", "Tofu (firm)"),
      mk("2", "tofu  firm"),
      mk("3", "Kinugoshi", { cal: 56, protein: 5.3 }),
      mk("4", "Silken tofu X", { cal: 56, protein: 5.3 }),
      mk("5", "Unique", { cal: 999 })
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].reason).toBe("name");
    expect(groups[0].items.map(p => p.id)).toEqual(["1", "2"]);
    expect(groups[1].reason).toBe("nutrition");
    expect(groups[1].items.map(p => p.id)).toEqual(["3", "4"]);
  });
  it("finds nothing when everything is distinct", async () => {
    const { findDuplicateGroups } = await import("../duplicates");
    expect(findDuplicateGroups([mk("1", "A"), mk("2", "B", { cal: 1 })])).toEqual([]);
  });
});
