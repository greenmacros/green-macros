import { calcMacros, formatAmount, proximityClass, sumItems, sumMeals } from "./macros";
import { hasTarget } from "./plans";

// Always drawn on a clean light "card" so exported images look the same
// regardless of the app theme and read well when shared or printed.
const FONT = '"Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,system-ui,-apple-system,"Segoe UI",sans-serif';
const C = {
  bg: "#eef5f0", card: "#ffffff", ink: "#16241b", muted: "#5b6b61", line: "#e2ebe5",
  accent: "#1d5a24", cal: "#b03a97", protein: "#0c8a5c", carbs: "#2563c9", fat: "#a86400",
  hit: "#15803d", close: "#a16207", off: "#c62828"
};
const MACROS = ["cal", "protein", "carbs", "fat"];
const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };
const W = 900;
const PAD = 32;
const COL_RIGHT = { cal: 632, protein: 712, carbs: 782, fat: 852 };
const AMOUNT_RIGHT = 520;
const ROW_H = 30;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, { size = 15, weight = 400, color = C.ink, align = "left", maxWidth } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  let s = String(str);
  if (maxWidth && ctx.measureText(s).width > maxWidth) {
    while (s.length > 1 && ctx.measureText(`${s}…`).width > maxWidth) s = s.slice(0, -1);
    s += "…";
  }
  ctx.fillText(s, x, y);
}

const fmt = (k, v) => v.toFixed(k === "cal" ? 0 : 1);
const statusColor = cls => ({ hit: C.hit, close: C.close, off: C.off })[cls] ?? C.ink;

function heights(plan) {
  const meals = plan.data.meals.map(m => 56 + Math.max(1, m.items.length) * ROW_H + 14);
  const targeted = hasTarget(plan.data.profile);
  const summary = 52 + (targeted ? 3 : 1) * 30 + 16;
  return { meals, summary, total: 96 + meals.reduce((a, b) => a + b, 0) + summary + 52 };
}

/**
 * Draw a plan to a canvas. `t` and `lang` come from the i18n context.
 * Returns the canvas (call .toBlob to save).
 */
export function renderPlanCanvas(plan, productMap, { t, lang }, scale = 2) {
  const { meals: mealHeights, summary, total } = heights(plan);
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = total * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, total);

  // header
  text(ctx, plan.name, PAD, 50, { size: 30, weight: 700, color: C.accent, maxWidth: 600 });
  text(ctx, "GreenMacros 🌱", W - PAD, 42, { size: 15, weight: 600, color: C.muted, align: "right" });
  text(ctx, new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : undefined, { dateStyle: "long" }), W - PAD, 66, {
    size: 13, color: C.muted, align: "right"
  });

  let y = 96;
  plan.data.meals.forEach((meal, i) => {
    const h = mealHeights[i];
    ctx.fillStyle = C.card;
    roundRect(ctx, PAD, y, W - PAD * 2, h - 10, 14);
    ctx.fill();

    const totals = sumItems(meal.items, productMap);
    text(ctx, meal.name, PAD + 18, y + 26, { size: 18, weight: 700, maxWidth: 420 });
    MACROS.forEach(k => {
      const target = meal.target?.[PROFILE_KEY[k]];
      const label = target ? `${fmt(k, totals[k])}/${target}` : fmt(k, totals[k]);
      text(ctx, label, COL_RIGHT[k], y + 26, {
        size: 13, weight: 600, color: target ? statusColor(proximityClass(totals[k], target)) : C[k], align: "right"
      });
    });
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(PAD + 18, y + 44);
    ctx.lineTo(W - PAD - 18, y + 44);
    ctx.stroke();

    let ry = y + 44 + ROW_H / 2 + 2;
    if (!meal.items.length) text(ctx, "—", PAD + 18, ry, { color: C.muted });
    for (const it of meal.items) {
      const p = productMap.get(it.productId);
      const m = calcMacros(p, it.amount);
      text(ctx, p ? p.name : t("picker.missing"), PAD + 18, ry, { maxWidth: 360, color: p ? C.ink : C.off });
      if (p) text(ctx, `${formatAmount(it.amount)} ${t(`unit.${p.unit}`)}`, AMOUNT_RIGHT, ry, { color: C.muted, align: "right", size: 14 });
      MACROS.forEach(k => p && text(ctx, fmt(k, m[k]), COL_RIGHT[k], ry, { color: C[k], align: "right", size: 14 }));
      ry += ROW_H;
    }
    y += h;
  });

  // summary card
  const profile = plan.data.profile;
  const totals = sumMeals(plan.data.meals, productMap);
  ctx.fillStyle = C.card;
  roundRect(ctx, PAD, y, W - PAD * 2, summary - 10, 14);
  ctx.fill();
  text(ctx, t("summary.title"), PAD + 18, y + 26, { size: 18, weight: 700 });
  MACROS.forEach(k => text(ctx, t(`macro.${k === "cal" ? "calories" : k}`), COL_RIGHT[k], y + 26, { size: 13, weight: 600, color: C[k], align: "right" }));
  let sy = y + 62;
  const rows = [];
  if (hasTarget(profile)) rows.push("target");
  rows.push("actual");
  if (hasTarget(profile)) rows.push("remaining");
  for (const row of rows) {
    text(ctx, t(`summary.${row}`), PAD + 18, sy, { size: 14, color: C.muted });
    MACROS.forEach(k => {
      const target = profile[PROFILE_KEY[k]];
      if (row === "target") return text(ctx, target ? formatAmount(target) : "—", COL_RIGHT[k], sy, { align: "right", size: 14 });
      if (row === "actual")
        return text(ctx, fmt(k, totals[k]), COL_RIGHT[k], sy, {
          align: "right", size: 15, weight: 700, color: target ? statusColor(proximityClass(totals[k], target)) : C.ink
        });
      const left = target - totals[k];
      text(ctx, target ? (left < 0 ? `+${fmt(k, -left)}` : fmt(k, left)) : "—", COL_RIGHT[k], sy, {
        align: "right", size: 14, color: target && left < 0 ? C.off : C.muted
      });
    });
    sy += 30;
  }

  text(ctx, t("image.disclaimer"), W / 2, total - 24, { size: 12, color: C.muted, align: "center", maxWidth: W - PAD * 2 });
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}
