import { createProduct } from "./products";

// Header synonyms (English + Japanese, incl. MEXT food-composition table wording).
const COLUMNS = {
  name: ["name", "food", "product", "食品名", "名前", "品名"],
  serving: ["serving", "serving size", "per", "分量", "1回量", "serving_g"],
  unit: ["unit", "単位"],
  cal: ["cal", "calories", "kcal", "energy", "エネルギー", "熱量"],
  protein: ["protein", "たんぱく質", "タンパク質", "蛋白質"],
  carbs: ["carbs", "carbohydrate", "carbohydrates", "炭水化物"],
  fat: ["fat", "total fat", "脂質"]
};

export function splitCsvLine(line, delim) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(c => c.trim());
}

function matchColumn(header) {
  const h = header.toLowerCase().replace(/\(.*?\)|（.*?）/g, "").replace(/[\s_]+/g, " ").trim();
  return Object.keys(COLUMNS).find(k => COLUMNS[k].some(alias => h === alias || h.startsWith(alias)));
}

/**
 * Parse a CSV/TSV of foods. Values are per `serving` (default 100 g).
 * Returns { products, skipped } or throws if no name column is found.
 */
export function parseFoodsCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error("empty");
  const delim = [",", "\t", ";"].reduce((best, d) => (lines[0].split(d).length > lines[0].split(best).length ? d : best), ",");
  const cols = splitCsvLine(lines[0], delim).map(matchColumn);
  if (!cols.includes("name")) throw new Error("no name column");

  const products = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const row = {};
    splitCsvLine(line, delim).forEach((cell, i) => {
      if (cols[i]) row[cols[i]] = cell;
    });
    const n = k => {
      const v = parseFloat(String(row[k] ?? "").replace(",", ".").replace(/[()（）]/g, ""));
      return Number.isFinite(v) && v >= 0 ? v : 0;
    };
    if (!row.name) { skipped++; continue; }
    products.push(
      createProduct({
        name: row.name,
        servingGrams: n("serving") || 100,
        unit: ["g", "ml", "unit", "scoop"].includes(row.unit) ? row.unit : "g",
        cal: n("cal"),
        protein: n("protein"),
        carbs: n("carbs"),
        fat: n("fat")
      })
    );
  }
  return { products, skipped };
}
