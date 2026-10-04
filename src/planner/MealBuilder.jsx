import { useMemo, useState } from "react";
import AdviceNotice from "../components/AdviceNotice";
import NumInput from "../components/NumInput";
import { useI18n } from "../i18n/context";
import { fold } from "../lib/foods";
import { MACRO_KEYS, MACRO_LABEL_KEYS, formatAmount, proximityClass } from "../lib/macros";
import { buildMeal } from "../lib/mealBuilder";
import { loadString, saveString } from "../lib/storage";
import "../components/firstrun.css";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };
const ACK_KEY = "gm_ackBuilder";

function pct(d) {
  const n = Math.round(d * 100);
  return `${n > 0 ? "+" : ""}${n}%`;
}

/** "Make a meal with these products" dialog. */
export default function MealBuilder({ products, mealName, defaultTarget, targetSource, onAdd, onClose, onCreateProduct }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(() => new Set(products.filter(p => p.fav).map(p => p.id)));
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(defaultTarget);
  const [maxServings, setMaxServings] = useState(4);
  const [result, setResult] = useState(null);
  const [replace, setReplace] = useState(false);
  const [ack, setAck] = useState(() => loadString(ACK_KEY) === "1");

  const shown = useMemo(() => {
    const q = fold(query);
    return products
      .filter(p => !q || fold(p.name).includes(q))
      .sort((a, b) => Number(b.fav) - Number(a.fav) || a.name.localeCompare(b.name));
  }, [products, query]);

  const toggle = id =>
    setSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const hasTarget = MACRO_KEYS.some(k => target[PROFILE_KEY[k]] > 0);
  const canGenerate = selected.size > 0 && hasTarget;

  function generate() {
    setResult(buildMeal(products.filter(p => selected.has(p.id)), target, { maxServings }));
  }

  function setAcknowledged(v) {
    setAck(v);
    saveString(ACK_KEY, v ? "1" : "0");
  }

  const macroName = k => t(MACRO_LABEL_KEYS[k]);

  return (
    <div className="gm-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal wide" role="dialog" aria-modal="true" aria-label={t("builder.title")}>
        <div className="modal-head">
          <h2>{t("builder.title")}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label={t("common.close")}>✕</button>
        </div>
        <p className="muted">{t("builder.intro", { meal: mealName })}</p>

        <AdviceNotice />

        <h3>1. {t("builder.pick")}</h3>
        {products.length === 0 ? (
          <p className="muted">
            {t("planner.noProducts")}{" "}
            <button className="btn-ghost" onClick={() => onCreateProduct("")}>{t("planner.addProducts")}</button>
          </p>
        ) : (
          <>
            <div className="builder-tools">
              <input type="search" placeholder={t("picker.search")} value={query} onChange={e => setQuery(e.target.value)} />
              <button className="btn-ghost" onClick={() => setSelected(new Set(products.filter(p => p.fav).map(p => p.id)))}>
                ★ {t("builder.favs")}
              </button>
              <button className="btn-ghost" onClick={() => setSelected(new Set())}>{t("builder.none")}</button>
            </div>
            <div className="builder-list">
              {shown.map(p => (
                <label key={p.id} className={`builder-item ${selected.has(p.id) ? "on" : ""}`}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                  <span>{p.fav ? "★ " : ""}{p.name}</span>
                  <small>{Math.round(p.cal)} {t("unit.kcal")} · {t("macro.p")} {p.protein}</small>
                </label>
              ))}
            </div>
            <div className="hint">{t("builder.selected", { n: selected.size })}</div>
          </>
        )}

        <h3>2. {t("builder.targets")}</h3>
        <div className="hint">{targetSource ? t(`builder.source.${targetSource}`) : t("builder.source.none")}</div>
        <div className="builder-targets">
          {MACRO_KEYS.map(k => (
            <label key={k} className="field">
              <span className={`col-${k === "cal" ? "cal" : k}`}>{macroName(k)}</span>
              <NumInput
                blankZero
                placeholder="—"
                value={target[PROFILE_KEY[k]]}
                onCommit={v => {
                  setTarget(tg => ({ ...tg, [PROFILE_KEY[k]]: v }));
                  setResult(null);
                }}
              />
            </label>
          ))}
          <label className="field">
            {t("builder.maxServings")}
            <select value={maxServings} onChange={e => { setMaxServings(Number(e.target.value)); setResult(null); }}>
              {[2, 3, 4, 6].map(n => <option key={n} value={n}>×{n}</option>)}
            </select>
          </label>
        </div>

        <label className="ack">
          <input type="checkbox" checked={ack} onChange={e => setAcknowledged(e.target.checked)} />
          {t("advice.ack")}
        </label>

        <div className="builder-actions">
          <button className="primary-btn" disabled={!canGenerate || !ack} onClick={generate}>
            {result ? t("builder.regenerate") : t("builder.generate")}
          </button>
          {!ack && <span className="hint warn">{t("advice.needAck")}</span>}
          {ack && !canGenerate && <span className="hint">{t("builder.needInput")}</span>}
        </div>

        {result && (
          <div className="builder-result">
            <h3>3. {t("builder.result")}</h3>
            <AdviceNotice compact />
            <table className="builder-table">
              <thead>
                <tr>
                  <th>{t("meal.item")}</th><th>{t("meal.amount")}</th>
                  {MACRO_KEYS.map(k => <th key={k}>{t(`macro.${k === "cal" ? "cal" : k[0]}`)}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.items.map(({ product: p, amount }) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{formatAmount(amount)} {t(`unit.${p.unit}`)}</td>
                    {MACRO_KEYS.map(k => (
                      <td key={k} className={`col-${k === "cal" ? "cal" : k}`}>
                        {((p[k] * amount) / p.servingGrams).toFixed(k === "cal" ? 0 : 1)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="total">
                  <td colSpan={2}>{t("week.total")}</td>
                  {MACRO_KEYS.map(k => <td key={k}>{result.totals[k].toFixed(k === "cal" ? 0 : 1)}</td>)}
                </tr>
                <tr className="total">
                  <td colSpan={2}>{t("summary.target")}</td>
                  {MACRO_KEYS.map(k => {
                    const v = target[PROFILE_KEY[k]];
                    return <td key={k}>{v > 0 ? v : "—"}</td>;
                  })}
                </tr>
              </tbody>
            </table>

            <div className="builder-fit">
              {MACRO_KEYS.filter(k => k in result.deviation).map(k => (
                <span key={k} className={proximityClass(1 + result.deviation[k], 1)}>
                  {macroName(k)} {pct(result.deviation[k])}
                </span>
              ))}
            </div>

            {result.ok ? (
              <p className="hint ok-note">✓ {t("builder.close")}</p>
            ) : (
              <p className="hint warn">
                {result.short.length > 0 && <>{t("builder.short", { macros: result.short.map(macroName).join(", ") })} </>}
                {result.over.length > 0 && <>{t("builder.over", { macros: result.over.map(macroName).join(", ") })}</>}
              </p>
            )}
            {result.maxed.length > 0 && <p className="hint warn">{t("builder.maxed", { names: result.maxed.join(", ") })}</p>}
            {result.dropped.length > 0 && <p className="hint">{t("builder.dropped", { names: result.dropped.join(", ") })}</p>}

            <div className="builder-actions">
              <label className="toolbar-check">
                <input type="checkbox" checked={replace} onChange={e => setReplace(e.target.checked)} />
                {t("builder.replace")}
              </label>
              <button
                className="primary-btn"
                onClick={() => onAdd(result.items.map(it => ({ productId: it.product.id, amount: it.amount })), { replace })}
              >
                {t("builder.add", { meal: mealName })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
