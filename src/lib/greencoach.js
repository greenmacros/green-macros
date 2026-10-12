import { buildProductMap, sumMeals } from "./macros";
import { WEEK_DAYS } from "./plans";

/** Where GreenCoach (the training companion app) lives. */
export const GREENCOACH_URL = "https://greenmacros.github.io/greencoach/";

const r1 = n => Math.round(n * 10) / 10;

/**
 * The planned week for GreenCoach: per weekday (Mon..Sun) the planned kcal / protein / carbs / fat of the plan
 * assigned to that day (null = no plan), plus that plan's own targets. Only totals travel: no foods or plan names.
 */
export function weekNutrition(plannerState, products, now = new Date()) {
  const productMap = buildProductMap(products);
  const byId = new Map(plannerState.plans.map(p => [p.id, p]));
  const days = [], targets = [];
  for (let i = 0; i < WEEK_DAYS; i++) {
    const plan = byId.get(plannerState.week[i]);
    if (!plan) { days.push(null); targets.push(null); continue; }
    const t = sumMeals(plan.data.meals, productMap);
    days.push([Math.round(t.cal), r1(t.protein), r1(t.carbs), r1(t.fat)]);
    const p = plan.data.profile;
    targets.push(p.calories || p.protein || p.carbs || p.fat ? [p.calories, p.protein, p.carbs, p.fat] : null);
  }
  return { v: 1, src: "greenmacros", at: now.toISOString(), days, targets };
}

/** base64url of UTF-8 JSON (no compression needed: the payload is tiny). */
export function encodeNutrition(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const greenCoachLink = obj => `${GREENCOACH_URL}#nutrition=${encodeNutrition(obj)}`;
