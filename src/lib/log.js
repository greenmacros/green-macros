import { uid } from "./id";
import { emptyTotals } from "./macros";

/** Meal groups offered when logging by hand. Entries copied from a plan keep that plan meal's own name instead. */
export const LOG_MEALS = ["breakfast", "lunch", "dinner", "snack"];

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(date = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Shift a YYYY-MM-DD key by whole days. */
export function shiftDay(key, delta) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + delta));
}

export const emptyLog = () => ({ days: {} });

/**
 * A log entry is a snapshot of what was eaten: the product's macros per serving are copied in,
 * so later edits to (or deletion of) the product never rewrite history.
 */
export function createEntry(product, amount, meal) {
  return {
    id: uid(),
    name: product.name,
    unit: product.unit,
    servingGrams: product.servingGrams,
    cal: product.cal,
    protein: product.protein,
    carbs: product.carbs,
    fat: product.fat,
    amount,
    meal
  };
}

function normalizeEntry(e) {
  if (!e || typeof e !== "object") return null;
  return {
    id: e.id == null ? uid() : String(e.id),
    name: String(e.name ?? "").trim() || "?",
    unit: ["g", "ml", "unit", "scoop"].includes(e.unit) ? e.unit : "g",
    servingGrams: num(e.servingGrams, 100) || 100,
    cal: num(e.cal),
    protein: num(e.protein),
    carbs: num(e.carbs),
    fat: num(e.fat),
    amount: num(e.amount),
    meal: typeof e.meal === "string" && e.meal ? e.meal : "snack"
  };
}

/** Coerce anything (old saves, backups) into a valid log. Days with no entries are dropped. */
export function normalizeLog(raw) {
  const days = {};
  const source = raw && typeof raw === "object" && raw.days && typeof raw.days === "object" ? raw.days : {};
  for (const [key, list] of Object.entries(source)) {
    if (!DAY.test(key) || !Array.isArray(list)) continue;
    const entries = list.map(normalizeEntry).filter(Boolean);
    if (entries.length) days[key] = entries;
  }
  return { days };
}

export function entryMacros(e) {
  const f = e.amount / e.servingGrams;
  return { cal: e.cal * f, protein: e.protein * f, carbs: e.carbs * f, fat: e.fat * f };
}

export function dayTotals(entries = []) {
  const t = emptyTotals();
  for (const e of entries) {
    const m = entryMacros(e);
    t.cal += m.cal;
    t.protein += m.protein;
    t.carbs += m.carbs;
    t.fat += m.fat;
  }
  return t;
}

/** Newest first: [{ date, count, totals }]. */
export function logSummaries(log) {
  return Object.keys(log.days)
    .sort()
    .reverse()
    .map(date => ({ date, count: log.days[date].length, totals: dayTotals(log.days[date]) }));
}

/** Immutable day update; an emptied day is removed. */
export function withDay(log, key, fn) {
  const next = fn(log.days[key] ?? []);
  const days = { ...log.days };
  if (next.length) days[key] = next;
  else delete days[key];
  return { ...log, days };
}
