import { uid } from "./id";

export const PLAN_COLORS = ["", "#3ddc97", "#60a5fa", "#fbbf24", "#f87171", "#c084fc", "#fb923c"];

const LEGACY_PLACEHOLDER = "__EMPTY__";
const LEGACY_NOTE = "Enter an item on the Products tab";

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export const emptyProfile = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });

export const hasTarget = profile =>
  Boolean(profile && (profile.calories || profile.protein || profile.carbs || profile.fat));

export const WEEK_DAYS = 7;
export const emptyWeek = () => Array(WEEK_DAYS).fill(null);

export function createItem(productId = null, amount = 0) {
  return { id: uid(), productId, amount, locked: false, note: "" };
}

export function createMeal(name = "Meal", items = []) {
  return { id: uid(), name, items, target: emptyProfile() };
}

export function createPlan(name = "Plan", { profile, meals } = {}) {
  return {
    id: uid(),
    name,
    color: "",
    archived: false,
    data: {
      profile: { ...emptyProfile(), ...profile },
      meals: meals ?? [createMeal("Meal 1")]
    }
  };
}

/** Same plan, but every id regenerated so it can live next to the original. */
export function clonePlan(plan, name) {
  return {
    ...structuredClone(plan),
    id: uid(),
    name,
    archived: false,
    data: {
      ...structuredClone(plan.data),
      meals: plan.data.meals.map(cloneMeal)
    }
  };
}

export function cloneMeal(meal) {
  return {
    ...structuredClone(meal),
    id: uid(),
    items: meal.items.map(it => ({ ...it, id: uid() }))
  };
}

function normalizeItem(it) {
  if (!it || typeof it !== "object") return null;
  const empty = it.productId == null || it.productId === LEGACY_PLACEHOLDER || it.productId === "";
  return {
    id: it.id == null ? uid() : String(it.id),
    productId: empty ? null : String(it.productId),
    amount: num(it.amount),
    locked: Boolean(it.locked),
    note: it.note && it.note !== LEGACY_NOTE ? String(it.note) : ""
  };
}

export function normalizeProfile(t = {}) {
  return {
    calories: num(t?.calories),
    protein: num(t?.protein),
    carbs: num(t?.carbs),
    fat: num(t?.fat)
  };
}

function normalizeMeal(m, index, labels) {
  const items = (Array.isArray(m?.items) ? m.items : []).map(normalizeItem).filter(Boolean);
  return {
    id: m?.id == null ? uid() : String(m.id),
    name: typeof m?.name === "string" ? m.name : `${labels.meal} ${index + 1}`,
    items,
    target: normalizeProfile(m?.target)
  };
}

function normalizePlan(p, index, labels) {
  if (!p || typeof p !== "object") return null;
  const profile = p.data?.profile ?? {};
  const meals = (Array.isArray(p.data?.meals) ? p.data.meals : []).map((m, i) => normalizeMeal(m, i, labels));
  return {
    id: p.id == null ? uid() : String(p.id),
    name: typeof p.name === "string" && p.name.trim() ? p.name : `${labels.plan} ${index + 1}`,
    color: PLAN_COLORS.includes(p.color) ? p.color : "",
    archived: Boolean(p.archived),
    data: {
      profile: {
        calories: num(profile.calories),
        protein: num(profile.protein),
        carbs: num(profile.carbs),
        fat: num(profile.fat)
      },
      meals: meals.length ? meals : [createMeal(`${labels.meal} 1`)]
    }
  };
}

/**
 * Accepts anything (old saves, imports) and returns a valid
 * { plans, activePlanId, week }. `labels` are the default names for new plans/meals.
 */
export function normalizePlanner(state, labels = { plan: "Plan", meal: "Meal" }) {
  const seen = new Set();
  const plans = (Array.isArray(state?.plans) ? state.plans : [])
    .map((p, i) => normalizePlan(p, i, labels))
    .filter(Boolean)
    .map(p => {
      if (seen.has(p.id)) p.id = uid();
      seen.add(p.id);
      return p;
    });
  if (!plans.length) plans.push(createPlan(`${labels.plan} 1`, { meals: [createMeal(`${labels.meal} 1`)] }));
  // there must always be at least one visible plan, and the active plan must be visible
  if (plans.every(p => p.archived)) plans[0].archived = false;
  const wanted = state?.activePlanId == null ? null : String(state.activePlanId);
  const week = emptyWeek().map((_, i) => {
    const id = state?.week?.[i];
    return id == null ? null : String(id);
  });
  return {
    plans,
    activePlanId: plans.some(p => p.id === wanted && !p.archived) ? wanted : plans.find(p => !p.archived).id,
    week
  };
}

/** Product ids referenced by a plan. */
export function productIdsInPlan(plan) {
  const ids = new Set();
  for (const meal of plan.data.meals)
    for (const it of meal.items) if (it.productId) ids.add(it.productId);
  return ids;
}
