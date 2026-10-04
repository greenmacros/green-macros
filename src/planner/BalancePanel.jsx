import { useMemo, useState } from "react";
import AdviceNotice from "../components/AdviceNotice";
import { useI18n } from "../i18n/context";
import { PROFILE_KEY, goalsFrom } from "../lib/amounts";
import { suggestBalance } from "../lib/balance";
import { formatAmount, sumItems } from "../lib/macros";

/** Optional: nothing here runs until the user opens the panel, and nothing is applied without a click. */
export default function BalancePanel({ planData, productMap, products, onApply }) {
  const { t } = useI18n();
  const lightest = useMemo(() => {
    const cals = planData.meals.map(m => [m.id, sumItems(m.items, productMap).cal]);
    return cals.sort((a, b) => a[1] - b[1])[0][0];
  }, [planData.meals, productMap]);
  const [addTo, setAddTo] = useState(null);
  const mealId = planData.meals.some(m => m.id === addTo) ? addTo : lightest;

  const result = useMemo(
    () => suggestBalance(planData, productMap, products, { addToMealId: mealId }),
    [planData, productMap, products, mealId]
  );
  const goals = goalsFrom(planData.profile);
  const mealName = id => planData.meals.find(m => m.id === id)?.name ?? "";

  return (
    <div className="balance-panel">
      <AdviceNotice compact />
      <p className="hint">{t("balance.optional")}</p>

      {result.status === "noTarget" && <p className="muted">{t("balance.noTarget")}</p>}
      {result.status === "balanced" && <p className="ok-note">{t("balance.balanced")}</p>}

      {result.status === "ok" && (
        <>
          <label className="field-inline">
            {t("balance.addTo")}
            <select value={mealId} onChange={e => setAddTo(e.target.value)}>
              {planData.meals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>

          {result.actions.length === 0 ? (
            <p className="muted">{t("balance.none")}</p>
          ) : (
            <div className="swap-list">
              {result.actions.map((a, i) => {
                const unit = t(`unit.${a.product.unit}`);
                return (
                  <div key={`${a.type}-${a.itemId ?? a.product.id}-${i}`} className="swap-row">
                    <div className="swap-main">
                      <div>
                        {a.type === "add" && t("balance.add", { name: a.product.name, amount: `${formatAmount(a.newAmount)} ${unit}`, meal: mealName(a.mealId) })}
                        {a.type === "scale" && t("balance.scale", { name: a.product.name, from: formatAmount(a.oldAmount), to: `${formatAmount(a.newAmount)} ${unit}` })}
                        {a.type === "remove" && t("balance.remove", { name: a.product.name, amount: `${formatAmount(a.oldAmount)} ${unit}`, meal: mealName(a.mealId) })}
                      </div>
                      <div className="swap-delta">
                        {goals.map(g => (
                          <span key={g.key}>
                            {t(`macro.${g.key === "cal" ? "cal" : g.key[0]}`)} {a.before[g.key].toFixed(0)} → <b>{a.after[g.key].toFixed(0)}</b> / {planData.profile[PROFILE_KEY[g.key]]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => onApply(a)}>{t("balance.apply")}</button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
