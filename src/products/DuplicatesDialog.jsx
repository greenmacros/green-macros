import { useMemo, useState } from "react";
import { useI18n } from "../i18n/context";
import { findDuplicateGroups } from "../lib/duplicates";
import { formatAmount } from "../lib/macros";
import "../components/firstrun.css";

/** Finds probable duplicate products and merges them (plans and recipes are re-pointed to the one you keep). */
export default function DuplicatesDialog({ products, usage, onMerge, onClose }) {
  const { t } = useI18n();
  const groups = useMemo(() => findDuplicateGroups(products), [products]);
  const [keep, setKeep] = useState({}); // group index → product id
  const [ignored, setIgnored] = useState(() => new Set());

  const shown = groups.map((g, i) => ({ g, i })).filter(({ g }) => !ignored.has(g.items.map(p => p.id).join()));
  const keepOf = (g, i) =>
    keep[i] && g.items.some(p => p.id === keep[i])
      ? keep[i]
      : [...g.items].sort((a, b) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0))[0].id;

  return (
    <div className="gm-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal wide" role="dialog" aria-modal="true" aria-label={t("dup.title")}>
        <div className="modal-head">
          <h2>{t("dup.title")}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label={t("common.close")}>✕</button>
        </div>
        <p className="muted">{t("dup.intro")}</p>

        {shown.length === 0 && <p className="ok-note">{t("dup.none")}</p>}

        {shown.map(({ g, i }) => {
          const keepId = keepOf(g, i);
          const removeIds = g.items.filter(p => p.id !== keepId).map(p => p.id);
          return (
            <div key={g.items.map(p => p.id).join()} className="dup-group">
              <div className="hint">{g.reason === "name" ? t("dup.byName") : t("dup.byNutrition")}</div>
              {g.items.map(p => (
                <label key={p.id} className={`dup-item ${p.id === keepId ? "keep" : ""}`}>
                  <input type="radio" name={`keep-${i}`} checked={p.id === keepId} onChange={() => setKeep(k => ({ ...k, [i]: p.id }))} />
                  <span className="dup-name">{p.name}</span>
                  <small className="muted">
                    {formatAmount(p.servingGrams)} {t(`unit.${p.unit}`)} · {Math.round(p.cal)} {t("unit.kcal")} · {t("macro.p")} {p.protein} · {t("macro.c")} {p.carbs} · {t("macro.f")} {p.fat}
                    {usage.get(p.id) ? ` · ${t("products.usedIn", { n: usage.get(p.id) })}` : ""}
                  </small>
                  {p.id === keepId && <span className="fit-badge good">{t("dup.keep")}</span>}
                </label>
              ))}
              <div className="builder-actions">
                <button className="btn-ghost" onClick={() => setIgnored(s => new Set(s).add(g.items.map(p => p.id).join()))}>{t("dup.ignore")}</button>
                <button className="primary-btn" onClick={() => onMerge(keepId, removeIds)}>
                  {t("dup.merge", { n: removeIds.length })}
                </button>
              </div>
            </div>
          );
        })}
        {shown.length > 0 && <p className="hint warn">{t("dup.warn")}</p>}
      </div>
    </div>
  );
}
