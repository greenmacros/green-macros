import DragGhost from "../components/DragGhost";
import Icon from "../components/Icon";
import { useI18n } from "../i18n/context";
import { formatAmount } from "../lib/macros";
import { useReorderDrag } from "../lib/useReorderDrag";

// data-drop keys: "meal:<mealId>" and "item:<itemId>:<mealId>"
const parseKey = key => {
  const [kind, a, b] = key.split(":");
  return kind === "meal" ? { mealId: a, itemId: null } : { mealId: b, itemId: a };
};

/**
 * Organize mode: compact view for reordering meals and items.
 * Drag the grip with a mouse or a finger, or use the arrows / "Move to…" menu.
 * Drop an item on another meal to move it there.
 */
export default function OrganizeView({ meals, productMap, onMoveMeal, onNudgeMeal, onMoveItem, onNudgeItem }) {
  const { t } = useI18n();

  const { gripProps, drag, over } = useReorderDrag((payload, key) => {
    const target = parseKey(key);
    if (payload.type === "meal") onMoveMeal(payload.id, target.mealId);
    else onMoveItem(payload.id, target.mealId, target.itemId);
  });

  const target = over ? parseKey(over) : null;
  const dragType = drag?.payload.type;

  return (
    <div className="organize">
      <p className="hint">{t("organize.help")}</p>

      {meals.map((meal, mi) => {
        const mealHot = target && ((dragType === "meal" && target.mealId === meal.id) || (dragType === "item" && !target.itemId && target.mealId === meal.id));
        return (
          <section key={meal.id} data-drop={`meal:${meal.id}`} className={`glass-card org-meal ${mealHot ? "drop-target" : ""}`}>
            <div className={`org-head ${drag?.payload.id === meal.id ? "dragging" : ""}`}>
              <span className="org-grip" title={t("organize.drag")} {...gripProps({ type: "meal", id: meal.id, label: meal.name })}>
                <Icon name="grip" size={18} />
              </span>
              <strong className="org-name">{meal.name}</strong>
              <span className="muted org-count">{t("organize.items", { n: meal.items.length })}</span>
              <button className="icon-btn" disabled={mi === 0} title={t("meal.moveUp")} aria-label={t("meal.moveUp")} onClick={() => onNudgeMeal(mi, -1)}>
                <Icon name="up" />
              </button>
              <button className="icon-btn" disabled={mi === meals.length - 1} title={t("meal.moveDown")} aria-label={t("meal.moveDown")} onClick={() => onNudgeMeal(mi, 1)}>
                <Icon name="down" />
              </button>
            </div>

            <ul className="org-items">
              {meal.items.map((it, ii) => {
                const p = productMap.get(it.productId);
                const hot = dragType === "item" && target?.itemId === it.id;
                return (
                  <li
                    key={it.id}
                    data-drop={`item:${it.id}:${meal.id}`}
                    className={`org-item ${drag?.payload.id === it.id ? "dragging" : ""} ${hot ? "drop-target" : ""}`}
                  >
                    <span className="org-grip" title={t("organize.drag")} {...gripProps({ type: "item", id: it.id, label: p?.name ?? "…" })}>
                      <Icon name="grip" size={18} />
                    </span>
                    <span className="org-name">{p ? p.name : t("picker.missing")}</span>
                    <span className="muted org-amount">{p ? `${formatAmount(it.amount)} ${t(`unit.${p.unit}`)}` : ""}</span>
                    {meals.length > 1 && (
                      <select
                        className="org-move"
                        aria-label={t("organize.moveTo")}
                        value=""
                        onChange={e => e.target.value && onMoveItem(it.id, e.target.value, null)}
                      >
                        <option value="">{t("organize.moveTo")}</option>
                        {meals.filter(m => m.id !== meal.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    )}
                    <button className="icon-btn" disabled={ii === 0} title={t("meal.moveUp")} aria-label={t("meal.moveUp")} onClick={() => onNudgeItem(meal.id, it.id, -1)}>
                      <Icon name="up" />
                    </button>
                    <button className="icon-btn" disabled={ii === meal.items.length - 1} title={t("meal.moveDown")} aria-label={t("meal.moveDown")} onClick={() => onNudgeItem(meal.id, it.id, 1)}>
                      <Icon name="down" />
                    </button>
                  </li>
                );
              })}
              {meal.items.length === 0 && <li className="org-empty muted">{t("organize.dropHere")}</li>}
            </ul>
          </section>
        );
      })}

      <DragGhost drag={drag} />
    </div>
  );
}
