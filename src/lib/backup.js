import { normalizePlanner } from "./plans";
import { normalizeProducts } from "./products";
import { normalizeRecipes } from "./recipes";

export const BACKUP_VERSION = 2;

/** Local calendar date as YYYY-MM-DD (for file names). */
export function isoDay(date = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Local time as HHMMSS (for file names). */
export function isoTime(date = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
}

export const backupFilename = (kind = "green-macros-backup", date = new Date()) => `${kind}-${isoDay(date)}-${isoTime(date)}.json`;

export function formatDateTime(time, lang) {
  return new Date(time).toLocaleString(lang === "ja" ? "ja-JP" : undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** The file written by "Export full backup". */
export function buildBackup({ products, plannerState, recipes }, now = new Date()) {
  return {
    app: "GreenMacros",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    counts: {
      plans: plannerState.plans.length,
      products: products.length,
      recipes: recipes.length
    },
    products,
    plannerState,
    recipes
  };
}

/**
 * Read a backup file's contents (current or older format).
 * Returns normalized data plus `exportedAt` (ms, or null for old backups). Throws if it isn't a backup.
 */
export function parseBackup(data, labels) {
  if (!Array.isArray(data?.products) || !Array.isArray(data?.plannerState?.plans)) throw new Error("not a backup");
  const stamp = Date.parse(data.exportedAt);
  const products = normalizeProducts(data.products);
  const plannerState = normalizePlanner(data.plannerState, labels);
  const recipes = normalizeRecipes(data.recipes);
  return {
    products,
    plannerState,
    recipes,
    exportedAt: Number.isFinite(stamp) ? stamp : null,
    counts: { plans: plannerState.plans.length, products: products.length, recipes: recipes.length }
  };
}
