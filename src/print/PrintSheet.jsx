import { useI18n } from "../i18n/context";
import { MACRO_KEYS, MACRO_LABEL_KEYS, calcMacros, emptyTotals, formatAmount, sumItems, sumMeals } from "../lib/macros";
import { hasTarget } from "../lib/plans";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };
const f = (k, v) => v.toFixed(k === "cal" ? 0 : 1);

function PlanSheet({ plan, productMap }) {
  const { t } = useI18n();
  const { profile, meals } = plan.data;
  const totals = sumMeals(meals, productMap);
  const targeted = hasTarget(profile);
  return (
    <section className="print-plan">
      <h2>{plan.name}</h2>
      {meals.map(meal => {
        const mt = sumItems(meal.items, productMap);
        return (
          <table key={meal.id} className="print-table">
            <thead>
              <tr>
                <th colSpan={2}>{meal.name}</th>
                {MACRO_KEYS.map(k => <th key={k}>{t(`macro.${k === "cal" ? "cal" : k[0]}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {meal.items.map(it => {
                const p = productMap.get(it.productId);
                const m = calcMacros(p, it.amount);
                return (
                  <tr key={it.id}>
                    <td>{p ? p.name : t("picker.missing")}</td>
                    <td>{p ? `${formatAmount(it.amount)} ${t(`unit.${p.unit}`)}` : ""}</td>
                    {MACRO_KEYS.map(k => <td key={k}>{p ? f(k, m[k]) : ""}</td>)}
                  </tr>
                );
              })}
              <tr className="sum">
                <td colSpan={2}>{t("week.total")}</td>
                {MACRO_KEYS.map(k => <td key={k}>{f(k, mt[k])}</td>)}
              </tr>
            </tbody>
          </table>
        );
      })}
      <table className="print-table print-summary">
        <thead>
          <tr><th colSpan={2}>{t("summary.title")}</th>{MACRO_KEYS.map(k => <th key={k}>{t(MACRO_LABEL_KEYS[k])}</th>)}</tr>
        </thead>
        <tbody>
          {targeted && (
            <tr><td colSpan={2}>{t("summary.target")}</td>{MACRO_KEYS.map(k => <td key={k}>{profile[PROFILE_KEY[k]] || "—"}</td>)}</tr>
          )}
          <tr className="sum"><td colSpan={2}>{t("summary.actual")}</td>{MACRO_KEYS.map(k => <td key={k}>{f(k, totals[k])}</td>)}</tr>
        </tbody>
      </table>
    </section>
  );
}

function WeekSheet({ plannerState, productMap }) {
  const { t } = useI18n();
  const planById = new Map(plannerState.plans.map(p => [p.id, p]));
  const sum = emptyTotals();
  let n = 0;
  const rows = plannerState.week.map((id, i) => {
    const plan = planById.get(id);
    const tot = plan ? sumMeals(plan.data.meals, productMap) : null;
    if (tot) {
      n++;
      MACRO_KEYS.forEach(k => (sum[k] += tot[k]));
    }
    return (
      <tr key={i}>
        <td>{t(`day.${i}`)}</td>
        <td>{plan ? plan.name : "—"}</td>
        {MACRO_KEYS.map(k => <td key={k}>{tot ? f(k, tot[k]) : ""}</td>)}
      </tr>
    );
  });
  return (
    <section className="print-plan">
      <h2>{t("week.title")}</h2>
      <table className="print-table">
        <thead>
          <tr><th /><th />{MACRO_KEYS.map(k => <th key={k}>{t(MACRO_LABEL_KEYS[k])}</th>)}</tr>
        </thead>
        <tbody>
          {rows}
          {n > 0 && (
            <>
              <tr className="sum"><td colSpan={2}>{t("week.total")}</td>{MACRO_KEYS.map(k => <td key={k}>{f(k, sum[k])}</td>)}</tr>
              <tr className="sum"><td colSpan={2}>{t("week.avg", { n })}</td>{MACRO_KEYS.map(k => <td key={k}>{f(k, sum[k] / n)}</td>)}</tr>
            </>
          )}
        </tbody>
      </table>
    </section>
  );
}

/** Hidden on screen; the only thing visible when printing. */
export default function PrintSheet({ job, plannerState, productMap }) {
  const { t, lang } = useI18n();
  if (!job) return null;
  const plan = job.kind === "plan" ? plannerState.plans.find(p => p.id === job.id) : null;
  return (
    <div className="print-sheet">
      <header>
        <strong>GreenMacros 🌱</strong>
        <span>{new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : undefined, { dateStyle: "long" })}</span>
      </header>
      {job.kind === "week" ? (
        <WeekSheet plannerState={plannerState} productMap={productMap} />
      ) : (
        plan && <PlanSheet plan={plan} productMap={productMap} />
      )}
      <footer>{t("image.disclaimer")}</footer>
    </div>
  );
}
