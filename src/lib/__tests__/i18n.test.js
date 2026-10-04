// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "../../i18n/messages";
import { translate } from "../../i18n/translate";

function sourceFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === "__tests__" ? [] : sourceFiles(p);
    return /\.jsx?$/.test(name) && name !== "messages.js" ? [p] : [];
  });
}

const src = sourceFiles("src").map(f => readFileSync(f, "utf8")).join("\n");
const used = new Set([...src.matchAll(/\bt\(\s*"([\w.]+)"/g)].map(m => m[1]));
// keys built dynamically, e.g. t(`unit.${u}`)
const dynamic = [
  ...["g", "ml", "unit", "scoop"].map(u => `unit.${u}`),
  ...[0, 1, 2, 3, 4, 5, 6].map(i => `day.${i}`),
  ...["planner", "week", "products"].map(i => `tab.${i}`),
  ...["products", "plans", "all"].map(i => `kind.${i}`),
  ...["name", "recent", "protein", "carbs", "fat", "cal"].map(i => `sort.${i}`),
  ...["meal", "remaining", "none"].map(i => `builder.source.${i}`),
  ...["noTarget", "noContribution", "lockedExceed"].map(i => `auto.${i}`),
  ...["cal", "p", "c", "f", "calories", "protein", "carbs", "fat"].map(i => `macro.${i}`)
];

describe("i18n", () => {
  it("has English and Japanese text for every key used in the source", () => {
    for (const key of [...used, ...dynamic]) {
      expect(MESSAGES[key], `missing key ${key}`).toBeTruthy();
      expect(MESSAGES[key].en, `${key} en`).toBeTruthy();
      expect(MESSAGES[key].ja, `${key} ja`).toBeTruthy();
    }
  });

  it("uses the same {variables} in both languages", () => {
    const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
    for (const [key, v] of Object.entries(MESSAGES)) expect(vars(v.ja), key).toBe(vars(v.en));
  });

  it("interpolates and falls back", () => {
    expect(translate("ja", "toast.planDeleted", { name: "A" })).toBe("「A」を削除しました");
    expect(translate("en", "nope.key")).toBe("nope.key");
  });
});
