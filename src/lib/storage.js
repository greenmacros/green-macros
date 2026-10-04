export const STORAGE_KEYS = {
  products: "greenMacros_products",
  planner: "greenMacros_planner",
  recipes: "greenMacros_recipes",
  visited: "gm_hasVisited",
  tab: "gm_tab",
  productSort: "productSort"
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the browser refuses (private mode, quota, blocked storage). */
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadString(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveString(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* non-essential preference */
  }
}
