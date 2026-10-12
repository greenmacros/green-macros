import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import Menu from "../components/Menu";
import NumInput from "../components/NumInput";
import ProductPicker from "../components/ProductPicker";
import { useI18n } from "../i18n/context";
import { MESSAGES } from "../i18n/messages";
import { LOG_MEALS, createEntry, dayKey, dayTotals, entryMacros, logSummaries, shiftDay, withDay } from "../lib/log";
import { formatAmount } from "../lib/macros";
import { STORAGE_KEYS, loadString, saveString } from "../lib/storage";

const HISTORY_DAYS = 14;

/** A plain diary of what was actually eaten. Targets are shown for reference only — no scoring. */
export default function LogTab({ products, plannerState, log, setLog, notify, onCreateProduct }) {
  const { t, lang } = useI18n();
  const [date, setDate] = useState(() => dayKey());
  const [meal, setMeal] = useState("breakfast");
  const [planId, setPlanId] = useState(() => loadString(STORAGE_KEYS.logPlan));

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const plans = plannerState.plans.filter(p => !p.archived);
  const plan = plans.find(p => p.id === planId);
  const entries = log.days[date] ?? [];
  const totals = dayTotals(entries);
  const history = useMemo(() => logSummaries(log).slice(0, HISTORY_DAYS), [log]);
  const target = plan?.data.profile;

  const dayLabel = key =>
    new Date(`${key}T00:00:00`).toLocaleDateString(lang === "ja" ? "ja-JP" : undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  const mealLabel = key => (LOG_MEALS.includes(key) ? t(`log.meal.${key}`) : key);

  const update = fn => setLog(l => withDay(l, date, fn));

  function addProduct(p) {
    update(list => [...list, createEntry(p, p.servingGrams, meal)]);
  }

  // a plan meal called "Lunch" / "昼食" lands in the Lunch group; anything else keeps its own name
  function groupFor(name) {
    const lower = name.trim().toLowerCase();
    return LOG_MEALS.find(k => Object.values(MESSAGES[`log.meal.${k}`]).some(v => v.toLowerCase() === lower)) ?? name;
  }

  function copyMeal(source, planMeal) {
    const group = groupFor(planMeal.name);
    const added = [];
    for (const it of planMeal.items) {
      const p = productMap.get(it.productId);
      if (p && it.amount > 0) added.push(createEntry(p, it.amount, group));
    }
    if (!added.length) return notify(t("log.planEmpty"));
    update(list => [...list, ...added]);
    notify(t("log.copied", { n: added.length, name: planMeal.name, plan: source.name }));
  }

  function choosePlan(id) {
    setPlanId(id);
    saveString(STORAGE_KEYS.logPlan, id);
  }

  function clearDay() {
    if (!entries.length || !window.confirm(t("log.confirmClear"))) return;
    const prev = entries;
    update(() => []);
    notify(t("log.cleared"), { label: t("common.undo"), run: () => setLog(l => withDay(l, date, () => prev)) });
  }

  // keep first-seen order of groups (hand-logged meals and copied plan meals can mix)
  const groups = [...new Set(entries.map(e => e.meal))];
  const cells = [
    ["cal", t("macro.calories"), 0, target?.calories],
    ["protein", t("macro.protein"), 1, target?.protein],
    ["carbs", t("macro.carbs"), 1, target?.carbs],
    ["fat", t("macro.fat"), 1, target?.fat]
  ];

  return (
    <div className="log-tab">
      <div className="tab-heading">
        <h2>{t("log.title")}</h2>
        <div className="heading-actions log-date">
          <button className="icon-btn" aria-label={t("log.prev")} title={t("log.prev")} onClick={() => setDate(shiftDay(date, -1))}>‹</button>
          <input
            type="date"
            value={date}
            aria-label={t("log.date")}
            onChange={e => e.target.value && setDate(e.target.value)}
          />
          <button className="icon-btn" aria-label={t("log.next")} title={t("log.next")} onClick={() => setDate(shiftDay(date, 1))}>›</button>
          <button className="btn-ghost" disabled={date === dayKey()} onClick={() => setDate(dayKey())}>{t("log.today")}</button>
        </div>
      </div>
      <p className="muted week-help">{t("log.help")}</p>

      <section className="glass-card log-add">
        <div className="log-add-row">
          <select value={meal} onChange={e => setMeal(e.target.value)} aria-label={t("log.mealLabel")}>
            {LOG_MEALS.map(k => <option key={k} value={k}>{t(`log.meal.${k}`)}</option>)}
          </select>
          <ProductPicker
            className="add-item"
            products={products}
            placeholder={t("log.addItem")}
            onSelect={addProduct}
            onCreate={onCreateProduct}
          />
          <Menu label={t("log.copyPlan")} title={t("log.copyPlan")} className="link-btn" align="right">
            {plans.map((p, i) => {
              const meals = p.data.meals.filter(m => m.items.length > 0);
              return (
                <div key={p.id}>
                  {i > 0 && <hr />}
                  <div className="menu-note">{p.name}</div>
                  {meals.map(m => (
                    <button key={m.id} onClick={() => copyMeal(p, m)}>
                      {m.name} <small className="muted">({m.items.length})</small>
                    </button>
                  ))}
                  {!meals.length && <div className="menu-note">{t("log.planEmpty")}</div>}
                </div>
              );
            })}
          </Menu>
        </div>
      </section>

      {entries.length === 0 && <p className="muted log-empty">{t("log.empty")}</p>}

      {groups.map(group => (
        <section key={group} className="glass-card log-group">
          <h3>{mealLabel(group)}</h3>
          {entries
            .filter(e => e.meal === group)
            .map(e => {
              const m = entryMacros(e);
              return (
                <div key={e.id} className="log-row">
                  <div className="log-name">{e.name}</div>
                  <div className="log-amount">
                    <NumInput
                      value={e.amount}
                      aria-label={e.name}
                      onCommit={amount => update(list => list.map(x => (x.id === e.id ? { ...x, amount } : x)))}
                    />
                    <span className="unit">{t(`unit.${e.unit}`)}</span>
                  </div>
                  <div className="log-macros muted">
                    {formatAmount(Math.round(m.cal))} {t("unit.kcal")} · {t("macro.p")} {m.protein.toFixed(1)} · {t("macro.c")} {m.carbs.toFixed(1)} · {t("macro.f")} {m.fat.toFixed(1)}
                  </div>
                  <button
                    className="icon-btn"
                    title={t("common.delete")}
                    aria-label={t("common.delete")}
                    onClick={() => update(list => list.filter(x => x.id !== e.id))}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              );
            })}
        </section>
      ))}

      <section className="glass-card log-totals">
        <div className="log-totals-head">
          <h3>{t("log.totals")}</h3>
          <label className="muted">
            {t("log.compare")}{" "}
            <select value={plan?.id ?? ""} onChange={e => choosePlan(e.target.value)}>
              <option value="">{t("log.noCompare")}</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="log-totals-grid">
          <div />
          {cells.map(([k, label]) => <div key={k} className={`col-${k}`}>{label}</div>)}
          <div className="row-label">{t("log.actual")}</div>
          {cells.map(([k, , digits]) => <div key={k}><strong>{totals[k].toFixed(digits)}</strong></div>)}
          {plan && <div className="row-label muted">{t("log.target")}</div>}
          {plan && cells.map(([k, , , goal]) => <div key={k} className="muted">{goal ? goal : "—"}</div>)}
        </div>
        {entries.length > 0 && (
          <div><button className="danger" onClick={clearDay}>{t("log.clearDay")}</button></div>
        )}
      </section>

      <section className="glass-card log-history">
        <h3>{t("log.history")}</h3>
        {history.length === 0 && <p className="muted">{t("log.noHistory")}</p>}
        {history.map(h => (
          <button key={h.date} className={`log-hist-row ${h.date === date ? "on" : ""}`} onClick={() => setDate(h.date)}>
            <span>{dayLabel(h.date)}</span>
            <span className="muted">
              {Math.round(h.totals.cal)} {t("unit.kcal")} · {t("macro.p")} {h.totals.protein.toFixed(0)} · {t("macro.c")} {h.totals.carbs.toFixed(0)} · {t("macro.f")} {h.totals.fat.toFixed(0)}
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}
