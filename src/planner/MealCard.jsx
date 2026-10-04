import { useState } from "react";
import Icon from "../components/Icon";
import Menu from "../components/Menu";
import NumInput from "../components/NumInput";
import ProductPicker from "../components/ProductPicker";
import { useI18n } from "../i18n/context";
import { MACRO_KEYS, MACRO_LABEL_KEYS, calcMacros, progressClass, sumItems } from "../lib/macros";
import { hasTarget } from "../lib/plans";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };

export default function MealCard({
  meal,
  index,
  count,
  products,
  productMap,
  recipes,
  onRename,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddMeal,
  onDuplicate,
  onMove,
  onClear,
  onRemove,
  onTarget,
  onSaveRecipe,
  onBuild,
  onAddRecipe,
  onCreateProduct
}) {
  const { t } = useI18n();
  const totals = sumItems(meal.items, productMap);
  const targeted = hasTarget(meal.target);
  const [showTarget, setShowTarget] = useState(targeted);
  const targetVisible = showTarget || targeted;

  return (
    <section className="glass-card meal-card">
      <div className="meal-header-row">
        <input
          className="meal-name-input"
          aria-label={t("meal.name")}
          value={meal.name}
          onChange={e => onRename(e.target.value)}
        />
        <span className="meal-summary">
          {totals.cal.toFixed(0)} {t("unit.kcal")} · {t("macro.p")} {totals.protein.toFixed(1)}
        </span>
        <Menu title={t("meal.actions")}>
          <button onClick={onAddMeal}>{t("meal.addBelow")}</button>
          <button onClick={onDuplicate}>{t("common.duplicate")}</button>
          <button disabled={index === 0} onClick={() => onMove(-1)}>{t("meal.moveUp")}</button>
          <button disabled={index === count - 1} onClick={() => onMove(1)}>{t("meal.moveDown")}</button>
          <button onClick={() => setShowTarget(s => !s)} disabled={targeted}>
            {targetVisible ? t("meal.hideTarget") : t("meal.setTarget")}
          </button>
          <button disabled={!meal.items.length} onClick={onSaveRecipe}>{t("meal.saveRecipe")}</button>
          <button disabled={!meal.items.length} onClick={onClear}>{t("meal.clear")}</button>
          <hr />
          <button className="danger" disabled={count <= 1} onClick={onRemove}>{t("meal.remove")}</button>
        </Menu>
      </div>

      {targetVisible && (
        <div className="meal-targets">
          <span className="muted">{t("meal.target")}</span>
          {MACRO_KEYS.map(k => {
            const target = meal.target[PROFILE_KEY[k]];
            return (
              <label key={k} className="meal-target-field">
                <span className={`col-${k === "cal" ? "cal" : k}`}>{t(MACRO_LABEL_KEYS[k])}</span>
                <NumInput
                  blankZero
                  placeholder="—"
                  value={target}
                  onCommit={v => onTarget({ [PROFILE_KEY[k]]: v })}
                />
                {target > 0 && (
                  <small className={progressClass(totals[k], target)}>
                    {totals[k].toFixed(k === "cal" ? 0 : 1)} / {target}
                  </small>
                )}
              </label>
            );
          })}
        </div>
      )}

      {meal.items.length > 0 && (
        <div className="meal-grid meal-header" aria-hidden="true">
          <div>{t("meal.item")}</div><div>{t("meal.amount")}</div>
          <div>{t("macro.cal")}</div><div>{t("macro.p")}</div><div>{t("macro.c")}</div><div>{t("macro.f")}</div>
          <div /><div />
        </div>
      )}

      {meal.items.map(it => {
        const product = productMap.get(it.productId);
        const m = calcMacros(product, it.amount);
        return (
          <div key={it.id} className={`meal-grid meal-row ${it.locked ? "locked" : ""}`}>
            <ProductPicker
              className="cell-item"
              products={products}
              selected={product}
              missing={!product}
              onSelect={p =>
                onUpdateItem(it.id, {
                  productId: p.id,
                  amount: it.amount > 0 ? it.amount : p.servingGrams
                })
              }
              onCreate={onCreateProduct}
            />
            <div className="cell-amount">
              <NumInput
                aria-label={t("meal.amount")}
                value={it.amount}
                onCommit={v => onUpdateItem(it.id, { amount: v })}
              />
              <span className="unit">{product ? t(`unit.${product.unit}`) : ""}</span>
            </div>
            <div className="row-macros">
              <div data-label={t("macro.cal")}>{m.cal.toFixed(0)}</div>
              <div data-label={t("macro.p")}>{m.protein.toFixed(1)}</div>
              <div data-label={t("macro.c")}>{m.carbs.toFixed(1)}</div>
              <div data-label={t("macro.f")}>{m.fat.toFixed(1)}</div>
            </div>
            <button
              className={`icon-btn row-action lock ${it.locked ? "on" : ""}`}
              title={it.locked ? t("meal.lockedHint") : t("meal.lockHint")}
              aria-pressed={it.locked}
              onClick={() => onUpdateItem(it.id, { locked: !it.locked })}
            >
              <Icon name={it.locked ? "lock" : "unlock"} />
            </button>
            <button className="icon-btn row-action remove" title={t("meal.removeItem")} aria-label={t("meal.removeItem")} onClick={() => onRemoveItem(it.id)}>
              <Icon name="close" />
            </button>
          </div>
        );
      })}

      <div className="meal-footer">
        <ProductPicker
          className="add-item"
          products={products}
          placeholder={t("meal.addItem")}
          onSelect={p => onAddItem(p)}
          onCreate={onCreateProduct}
        />
        <button className="link-btn" onClick={onBuild}>{t("builder.button")}</button>
        {recipes.length > 0 && (
          <Menu label={t("meal.addRecipe")} title={t("meal.addRecipe")} className="link-btn" align="left">
            {recipes.map(r => (
              <button key={r.id} onClick={() => onAddRecipe(r)}>
                {r.name} <small className="muted">({r.items.length})</small>
              </button>
            ))}
          </Menu>
        )}
      </div>
    </section>
  );
}
