import Icon from "../components/Icon";
import NumInput from "../components/NumInput";
import { useI18n } from "../i18n/context";
import { CATEGORIES } from "../lib/categories";
import { caloriesLookOff, formatAmount, kcalFromMacros } from "../lib/macros";
import { UNITS } from "../lib/products";

/** One product: a compact line, plus an editor that opens when you click it. */
export default function ProductRow({
  p, used, expanded, onToggle, onUpdate, onDuplicate, onFit, onRemove,
  selectMode, selected, onSelect,
  organize, onNudge, gripProps, dragging, hot
}) {
  const { t } = useI18n();
  const off = caloriesLookOff(p);
  const fixKcal = () => onUpdate({ cal: kcalFromMacros(p.protein, p.carbs, p.fat) });

  return (
    <div
      className={`prow ${expanded ? "open" : ""} ${dragging ? "dragging" : ""} ${hot ? "drop-target" : ""}`}
      data-drop={organize ? `product:${p.id}` : undefined}
    >
      <div className="prow-line">
        <div className="prow-lead">
          {organize ? (
            <span className="org-grip" title={t("organize.drag")} {...gripProps({ type: "product", id: p.id, label: p.name })}>
              <Icon name="grip" size={18} />
            </span>
          ) : selectMode ? (
            <input type="checkbox" checked={selected} aria-label={p.name} onChange={e => onSelect(e.target.checked)} />
          ) : (
            <button
              className={`icon-btn fav ${p.fav ? "on" : ""}`}
              aria-pressed={p.fav}
              title={t("products.favHint")}
              onClick={() => onUpdate({ fav: !p.fav })}
            >
              <Icon name="star" filled={p.fav} />
            </button>
          )}
        </div>

        <button
          className="prow-main"
          aria-expanded={expanded}
          disabled={organize}
          onClick={selectMode ? () => onSelect(!selected) : onToggle}
        >
          <span className="prow-name">
            <span className={`cat-dot cat-${p.category}`} title={t(`cat.${p.category}`)} />
            <span className="prow-title">{p.name}</span>
            {used > 0 && <small className="muted">{t("products.usedIn", { n: used })}</small>}
            {off && <span className="warn" title={t("products.kcalOff", { n: kcalFromMacros(p.protein, p.carbs, p.fat) })}>⚠</span>}
          </span>
          <span className="prow-serving">{formatAmount(p.servingGrams)} {t(`unit.${p.unit}`)}</span>
          <span className="prow-macros">
            <span className="m-cal" data-label={t("macro.cal")}>{Math.round(p.cal)}</span>
            <span className="m-p" data-label={t("macro.p")}>{p.protein}</span>
            <span className="m-c" data-label={t("macro.c")}>{p.carbs}</span>
            <span className="m-f" data-label={t("macro.f")}>{p.fat}</span>
          </span>
        </button>

        <div className="prow-end">
          {organize ? (
            <>
              <button className="icon-btn" title={t("meal.moveUp")} aria-label={t("meal.moveUp")} onClick={() => onNudge(-1)}><Icon name="up" /></button>
              <button className="icon-btn" title={t("meal.moveDown")} aria-label={t("meal.moveDown")} onClick={() => onNudge(1)}><Icon name="down" /></button>
            </>
          ) : (
            !selectMode && <span className="prow-chevron" aria-hidden="true"><Icon name={expanded ? "up" : "down"} /></span>
          )}
        </div>
      </div>

      {expanded && !organize && !selectMode && (
        <div className="pedit">
          <label className="field pedit-name">
            {t("form.name")}
            <input value={p.name} onChange={e => onUpdate({ name: e.target.value })} />
          </label>
          <label className="field">
            {t("form.category")}
            <select value={p.category} onChange={e => onUpdate({ category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
            </select>
          </label>
          <label className="field">
            {t("form.serving")}
            <NumInput value={p.servingGrams} onCommit={v => onUpdate({ servingGrams: v || 1 })} />
          </label>
          <label className="field">
            {t("form.unit")}
            <select value={p.unit} onChange={e => onUpdate({ unit: e.target.value })}>
              {UNITS.map(u => <option key={u} value={u}>{t(`unit.${u}`)}</option>)}
            </select>
          </label>
          <label className="field">
            {t("macro.calories")}
            <NumInput value={p.cal} onCommit={v => onUpdate({ cal: v })} />
          </label>
          <label className="field">
            {t("macro.protein")}
            <NumInput value={p.protein} onCommit={v => onUpdate({ protein: v })} />
          </label>
          <label className="field">
            {t("macro.carbs")}
            <NumInput value={p.carbs} onCommit={v => onUpdate({ carbs: v })} />
          </label>
          <label className="field">
            {t("macro.fat")}
            <NumInput value={p.fat} onCommit={v => onUpdate({ fat: v })} />
          </label>
          <div className="pedit-actions">
            {off && (
              <button className="btn-ghost warn" onClick={fixKcal}>
                {t("products.kcalOff", { n: kcalFromMacros(p.protein, p.carbs, p.fat) })}
              </button>
            )}
            <button className="btn-ghost" onClick={onFit}><Icon name="swap" size={14} /> {t("fit.rowHint")}</button>
            <button className="btn-ghost" onClick={onDuplicate}><Icon name="copy" size={14} /> {t("common.duplicate")}</button>
            <button className="btn-ghost danger" onClick={onRemove}><Icon name="close" size={14} /> {t("common.delete")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
