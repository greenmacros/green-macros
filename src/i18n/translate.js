import { MESSAGES } from "./messages";

export const LANGS = ["en", "ja"];

export function detectLang(stored) {
  if (LANGS.includes(stored)) return stored;
  const nav = typeof navigator !== "undefined" ? navigator.language || "" : "";
  return nav.toLowerCase().startsWith("ja") ? "ja" : "en";
}

/** translate(lang, KEY, { n: 3 }) — falls back to English, then to the key itself. */
export function translate(lang, key, vars) {
  const entry = MESSAGES[key];
  let text = entry?.[lang] ?? entry?.en ?? key;
  if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return text;
}
