import { useMemo } from "react";
import { useI18n } from "../i18n/context";
import { MACRO_KEYS, MACRO_LABEL_KEYS, buildProductMap, emptyTotals, proximityClass, sumMeals } from "../lib/macros";
import { WEEK_DAYS, hasTarget } from "../lib/plans";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };

export default function WeekTab({ products, plannerState, setPlannerState, onOpenPlan, onPrint }) {
  const { t } = useI18n();
  const { plans, week } = plannerState;
  const productMap = useMemo(() => buildProductMap(products), [products]);
  const planById = useMemo(() => new Map(plans.map(p => [p.id, p])), [plans]);
  const totals = useMemo(
    () => new Map(plans.map(p => [p.id, sumMeals(p.data.meals, productMap)])),
    [plans, productMap]
  );

  const setDay = (i, id) =>
    setPlannerState(s => {
      const next = [...s.week];
      next[i] = id || null;
      return { ...s, week: next };
    });

  const assigned = week.map(id => planById.get(id)).filter(Boolean);
  const weekTotal = emptyTotals();
  assigned.forEach(p => MACRO_KEYS.forEach(k => (weekTotal[k] += totals.get(p.id)[k])));
  const n = assigned.length;

  return (
    <div className="week-tab">
      <div className="tab-heading">
        <h2>{t("week.title")}</h2>
        <div className="heading-actions">
          <button disabled={!n} onClick={onPrint}>{t("week.print")}</button>
          <button className="danger-btn" disabled={!n} onClick={() => setPlannerState(s => ({ ...s, week: Array(WEEK_DAYS).fill(null) }))}>
            {t("week.clear")}
          </button>
        </div>
      </div>
      <p className="muted week-help">{t("week.help")}</p>

      <div className="week-grid">
        {Array.from({ length: WEEK_DAYS }, (_, i) => {
          const plan = planById.get(week[i]);
          const tot = plan ? totals.get(plan.id) : null;
          return (
            <section key={i} className={`glass-card week-day ${plan ? "" : "empty"}`}>
              <h3>{t(`day.${i}`)}</h3>
              <select value={plan?.id ?? ""} onChange={e => setDay(i, e.target.value)} aria-label={t(`day.${i}`)}>
                <option value="">{t("week.rest")}</option>
                {plans
                  .filter(p => !p.archived || p.id === plan?.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.archived ? ` ${t("week.archivedSuffix")}` : ""}
                    </option>
                  ))}
              </select>
              {plan && (
                <>
                  <ul className="week-macros">
                    {MACRO_KEYS.map(k => {
                      const target = plan.data.profile[PROFILE_KEY[k]];
                      return (
                        <li key={k} className={`col-${k === "cal" ? "cal" : k}`}>
                          <span>{t(`macro.${k === "cal" ? "cal" : k[0]}`)}</span>
                          <b className={hasTarget(plan.data.profile) ? proximityClass(tot[k], target) : ""}>
                            {tot[k].toFixed(k === "cal" ? 0 : 1)}
                          </b>
                          {target > 0 && <small className="muted">/ {target}</small>}
                        </li>
                      );
                    })}
                  </ul>
                  <button className="btn-ghost" onClick={() => onOpenPlan(plan.id)}>{t("week.open")} →</button>
                </>
              )}
            </section>
          );
        })}
      </div>

      <section className="glass-card week-summary">
        <h3>{t("week.summary")}</h3>
        {n === 0 ? (
          <p className="muted">{t("week.none")}</p>
        ) : (
          <div className="summary-grid week-summary-grid">
            <div />
            {MACRO_KEYS.map(k => <div key={k} className={`col-${k === "cal" ? "cal" : k}`}>{t(MACRO_LABEL_KEYS[k])}</div>)}
            <div className="row-label">{t("week.total")}</div>
            {MACRO_KEYS.map(k => <div key={k}>{weekTotal[k].toFixed(k === "cal" ? 0 : 1)}</div>)}
            <div className="row-label">{t("week.avg", { n })}</div>
            {MACRO_KEYS.map(k => <div key={k}>{(weekTotal[k] / n).toFixed(k === "cal" ? 0 : 1)}</div>)}
          </div>
        )}
      </section>
    </div>
  );
}
