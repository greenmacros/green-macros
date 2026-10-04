import { loadJSON, loadString, saveJSON, saveString } from "./storage";

const KEYS = {
  lastBackup: "gm_lastBackup",
  firstUse: "gm_firstUse",
  dismissed: "gm_noticeDismissed"
};
const DAY = 24 * 60 * 60 * 1000;

/** Ask the browser not to evict our data under storage pressure. Returns true/false, or null if unsupported. */
export async function requestPersistence() {
  try {
    if (!navigator.storage?.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

export function isIos() {
  const ua = navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isStandalone() {
  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone);
}

const readTime = key => {
  const n = Number(loadString(key));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const getLastBackup = () => readTime(KEYS.lastBackup);

export function markBackup(now = Date.now()) {
  saveString(KEYS.lastBackup, String(now));
  return now;
}

/** Remember when the user first had data, so we don't nag on day one. */
export function getFirstUse(now = Date.now()) {
  const saved = readTime(KEYS.firstUse);
  if (saved) return saved;
  saveString(KEYS.firstUse, String(now));
  return now;
}

export function dismissNotice(kind, now = Date.now()) {
  saveJSON(KEYS.dismissed, { ...loadJSON(KEYS.dismissed, {}), [kind]: now });
}

export const getDismissed = () => loadJSON(KEYS.dismissed, {});

/**
 * Decide which (single) notice to show.
 *  - "ios":    iPhone/iPad Safari tab (not installed): data can be wiped after ~7 idle days
 *  - "backup": no backup yet (after 3 days of use) or last backup older than 30 days
 */
export function pickNotice({ ios, standalone, hasData, lastBackup, firstUse, dismissed = {}, now = Date.now() }) {
  if (!hasData) return null;
  const quiet = (kind, days) => !dismissed[kind] || now - dismissed[kind] > days * DAY;

  if (ios && !standalone && quiet("ios", 30)) return "ios";

  const stale = lastBackup ? now - lastBackup > 30 * DAY : now - firstUse > 3 * DAY;
  if (stale && quiet("backup", 7)) return "backup";
  return null;
}

export const daysSince = (time, now = Date.now()) => Math.floor((now - time) / DAY);
