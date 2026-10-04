// Parses pasted nutrition labels (EN / JP, per-serving or per-100g).

const NUM = "(\\d+(?:[.,]\\d+)?)";
const toNum = s => parseFloat(s.replace(",", "."));

function first(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return toNum(m[1]);
  }
  return null;
}

function fatValue(t) {
  const total = first(t, [new RegExp(`total\\s+fat[ \\t:]*${NUM}`), new RegExp(`脂質[ \\t:]*${NUM}`)]);
  if (total != null) return total;
  for (const m of t.matchAll(new RegExp(`fat[s]?[ \\t:]*${NUM}`, "g"))) {
    const before = t.slice(Math.max(0, m.index - 12), m.index);
    if (/(saturated|trans|mono|poly|unsat\w*|sat\.?)\s*$/.test(before)) continue;
    return toNum(m[1]);
  }
  return null;
}

export function parseLabel(raw) {
  // NFKC folds full-width colons/spaces/digits (：　１) to their ASCII forms
  const t = raw.normalize("NFKC").toLowerCase().replace(/[ \t]+/g, " ");

  let cal = first(t, [
    new RegExp(`${NUM}\\s*kcal`),
    new RegExp(`(?:calories|energy|エネルギー|熱量)[ \\t:]*${NUM}(?![\\d.,]*\\s*kj)`),
    new RegExp(`\\bcal[ \\t:]*${NUM}`)
  ]);
  if (cal == null) {
    const kj = first(t, [new RegExp(`${NUM}\\s*kj`)]);
    cal = kj != null ? Math.round(kj / 4.184) : null;
  }

  const protein = first(t, [
    new RegExp(`proteins?[ \\t:]*${NUM}`),
    new RegExp(`(?:たんぱく質|タンパク質|蛋白質)[ \\t:]*${NUM}`)
  ]);
  const carbs = first(t, [
    new RegExp(`total\\s+carbohydrates?[ \\t:]*${NUM}`),
    new RegExp(`carbohydrates?[ \\t:]*${NUM}`),
    new RegExp(`carbs?[ \\t:]*${NUM}`),
    new RegExp(`炭水化物[ \\t:]*${NUM}`)
  ]);
  const fat = fatValue(t);

  const servingMatch =
    t.match(new RegExp(`(?:serving size|per serving|serving|1食|1回分|内容量|per)[^\\d\\n]{0,15}${NUM}\\s*(g|ml)\\b`)) ||
    t.match(new RegExp(`${NUM}\\s*(g|ml)\\s*(?:あたり|当たり|当り)`));
  const servingGrams = servingMatch ? toNum(servingMatch[1]) : 100;
  const unit = servingMatch ? servingMatch[2] : /\d\s*ml\b/.test(t) ? "ml" : "g";

  const name =
    raw
      .split("\n")
      .map(l => l.trim())
      .find(l => l && !/\d/.test(l) && !/nutrition|facts|calories|energy|serving|protein|carb|fat|per /i.test(l)) ||
    "Imported product";

  const missing = Object.entries({ calories: cal, protein, carbs, fat })
    .filter(([, v]) => v == null)
    .map(([k]) => k);

  return {
    product: {
      name,
      unit,
      servingGrams,
      cal: cal ?? 0,
      protein: protein ?? 0,
      carbs: carbs ?? 0,
      fat: fat ?? 0
    },
    missing,
    assumedServing: !servingMatch
  };
}
