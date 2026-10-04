import { calcMacros, formatAmount, sumItems, sumMeals } from "./macros";

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Non-secure contexts / denied permission: fall back to a temporary textarea.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function downloadJSON(data, filename) {
  downloadFile(JSON.stringify(data, null, 2), filename, "application/json");
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Quote fields, and defuse spreadsheet formulas (=, +, -, @) in user-entered text.
function csvCell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function plansToCSV(plans, productMap) {
  const header = ["Plan", "Meal", "Product", "Amount", "Unit", "Calories", "Protein", "Carbs", "Fat", "Locked"];
  const rows = [];
  for (const plan of plans) {
    for (const meal of plan.data.meals) {
      for (const it of meal.items) {
        const product = productMap.get(it.productId);
        if (!product) continue;
        const m = calcMacros(product, it.amount);
        rows.push([
          plan.name, meal.name, product.name, it.amount, product.unit,
          m.cal.toFixed(1), m.protein.toFixed(1), m.carbs.toFixed(1), m.fat.toFixed(1),
          it.locked ? "YES" : "NO"
        ]);
      }
    }
  }
  return "﻿" + [header, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n");
}

export function planToText(plan, productMap) {
  const { profile, meals } = plan.data;
  const line = t =>
    `${t.cal.toFixed(0)} kcal · P ${t.protein.toFixed(1)} · C ${t.carbs.toFixed(1)} · F ${t.fat.toFixed(1)}`;
  const out = [plan.name];
  for (const meal of meals) {
    out.push("", `${meal.name} — ${line(sumItems(meal.items, productMap))}`);
    for (const it of meal.items) {
      const p = productMap.get(it.productId);
      if (p) out.push(`  • ${p.name}: ${formatAmount(it.amount)} ${p.unit}`);
    }
  }
  out.push("", `Total — ${line(sumMeals(meals, productMap))}`);
  if (profile.calories || profile.protein || profile.carbs || profile.fat) {
    out.push(`Target — ${profile.calories} kcal · P ${profile.protein} · C ${profile.carbs} · F ${profile.fat}`);
  }
  return out.join("\n");
}
