// @vitest-environment node
import { describe, expect, it } from "vitest";
import { scaleToTarget } from "../autoBalance";
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

describe("scaleToTarget", () => {
  const data = {
    profile: {},
    meals: [createMeal("m", [createItem("t", 100), { ...createItem("r", 100), locked: true }])]
  };
  it("hits the target while leaving locked items alone", () => {
    const { data: out } = scaleToTarget(data, map, "protein", 19);
    const [t, r] = out.meals[0].items;
    expect(r.amount).toBe(100);
    expect(sumMeals(out.meals, map).protein).toBeCloseTo(19, 0);
    expect(t.amount).toBe(200);
  });
  it("reports impossible targets", () => {
    expect(scaleToTarget(data, map, "protein", 1).error).toBe("lockedExceed");
    expect(scaleToTarget(data, map, "protein", 0).error).toBeTruthy();
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

describe("buildMeal (smart meal builder)", () => {
  const prod = (id, name, cal, protein, carbs, fat, servingGrams = 100, unit = "g") => ({ id, name, cal, protein, carbs, fat, servingGrams, unit });
  const rice2 = prod("r", "Rice", 130, 2.7, 28, 0.3);
  const tofu2 = prod("t", "Tofu", 76, 8, 2, 5);
  const oil = prod("o", "Oil", 884, 0, 0, 100);
  const lentil = prod("l", "Lentils", 116, 9, 20, 0.4);

  it("lands within 10% of a reachable target", async () => {
    const { buildMeal } = await import("../mealBuilder");
    const r = buildMeal([rice2, tofu2, lentil, oil], { calories: 0, protein: 35, carbs: 70, fat: 14 });
    expect(r.ok).toBe(true);
    expect(r.items.every(i => i.amount > 0)).toBe(true);
    expect(Math.abs(r.totals.protein - 35) / 35).toBeLessThan(0.1);
  });
  it("reports what is short when the products can't get there", async () => {
    const { buildMeal } = await import("../mealBuilder");
    const r = buildMeal([rice2], { calories: 0, protein: 80, carbs: 0, fat: 0 });
    expect(r.ok).toBe(false);
    expect(r.short).toContain("protein");
    expect(r.maxed).toContain("Rice");
  });
  it("respects unit steps and returns null with nothing to solve", async () => {
    const { buildMeal } = await import("../mealBuilder");
    const banana = prod("b", "Banana", 105, 1.3, 27, 0.4, 1, "unit");
    const r = buildMeal([banana], { calories: 0, protein: 0, carbs: 54, fat: 0 });
    expect(r.items[0].amount % 0.5).toBe(0);
    expect(buildMeal([], { carbs: 50 })).toBeNull();
    expect(buildMeal([banana], { calories: 0, protein: 0, carbs: 0, fat: 0 })).toBeNull();
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
    expect(backupFilename("green-macros-backup", new Date(2026, 9, 4))).toBe("green-macros-backup-2026-10-04.json");
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

describe("suggestBalance (optional)", () => {
  const mk = (id, name, cal, protein, carbs, fat) => ({ id, name, cal, protein, carbs, fat, servingGrams: 100, unit: "g" });
  const rice3 = mk("r", "Rice", 130, 2.7, 28, 0.3);
  const lentil3 = mk("l", "Lentils", 116, 9, 20, 0.4);
  const tofu3 = mk("t", "Tofu", 76, 8, 2, 5);
  const pm = new Map([rice3, lentil3, tofu3].map(p => [p.id, p]));
  const day = (items, profile) => ({ profile: { calories: 0, protein: 0, carbs: 0, fat: 0, ...profile }, meals: [createMeal("All", items)] });

  it("needs targets, and says so when the day is already balanced", async () => {
    const { suggestBalance } = await import("../balance");
    expect(suggestBalance(day([createItem("r", 100)], {}), pm, [rice3]).status).toBe("noTarget");
    const d = day([createItem("r", 100)], { carbs: 28 });
    expect(suggestBalance(d, pm, [rice3]).status).toBe("balanced");
  });
  it("suggests a protein source when protein is short, and every action improves the fit", async () => {
    const { suggestBalance } = await import("../balance");
    const d = day([createItem("r", 200)], { protein: 40, carbs: 56 });
    const r = suggestBalance(d, pm, [rice3, lentil3, tofu3]);
    expect(r.status).toBe("ok");
    const adds = r.actions.filter(a => a.type === "add");
    expect(adds.length).toBeGreaterThan(0);
    expect(adds[0].after.protein).toBeGreaterThan(adds[0].before.protein);
    expect(r.actions.every(a => a.gain > 0)).toBe(true);
  });
  it("never touches locked items", async () => {
    const { suggestBalance } = await import("../balance");
    const d = day([{ ...createItem("r", 300), locked: true }], { carbs: 56 });
    const r = suggestBalance(d, pm, []);
    expect(r.actions.filter(a => a.itemId)).toHaveLength(0);
  });
});
