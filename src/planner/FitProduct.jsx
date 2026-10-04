import { useMemo, useState } from "react";
import AdviceNotice from "../components/AdviceNotice";
import ProductForm from "../components/ProductForm";
import ProductPicker from "../components/ProductPicker";
import FoodSearch from "../products/FoodSearch";
import LabelImport from "../products/LabelImport";
import { useI18n } from "../i18n/context";
import { formatAmount } from "../lib/macros";
import { suggestSwaps } from "../lib/substitute";
import "../components/firstrun.css";

const KEYS = ["cal", "protein", "carbs", "fat"];
const signed = (k, v) => {
  const n = k === "cal" ? Math.round(v) : Math.round(v * 10) / 10;
  return `${n > 0 ? "+" : ""}${n}`;
};

/** "Fit this product into my plan": pick or enter a product, see what it could replace and how much. */
export default function FitProduct({ products, plannerState, initialProduct, onApply, onClose }) {
  const { t } = useI18n();
  const plans = plannerState.plans.filter(p => !p.archived);
  const [candidate, setCandidate] = useState(initialProduct ?? null);
  const [source, setSource] = useState("mine");
  const [scope, setScope] = useState(plannerState.activePlanId);
  const [includeLocked, setIncludeLocked] = useState(false);

  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const swaps = useMemo(() => {
    if (!candidate) return [];
    const searched = scope === "all" ? plans : plans.filter(p => p.id === scope);
    return suggestSwaps(candidate, searched, productMap, { includeLocked });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `plans` is derived from plannerState
  }, [candidate, scope, includeLocked, plannerState.plans, productMap]);

  const isSaved = candidate && products.some(p => p.id === candidate.id);
  const sources = [
    ["mine", t("fit.srcMine")],
    ["foods", t("panel.foods")],
    ["label", t("panel.label")],
    ["manual", t("fit.srcManual")]
  ];

  return (
    <div className="gm-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="gm-modal wide" role="dialog" aria-modal="true" aria-label={t("fit.title")}>
        <div className="modal-head">
          <h2>{t("fit.title")}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label={t("common.close")}>✕</button>
        </div>
        <p className="muted">{t("fit.intro")}</p>
        <AdviceNotice compact />
        <p className="hint">{t("fit.macroOnly")}</p>

        <h3>1. {t("fit.product")}</h3>
        {candidate ? (
          <div className="fit-candidate">
            <div>
              <strong>{candidate.name}</strong>
              <div className="muted">
                {t("fit.per", { amount: candidate.servingGrams, unit: t(`unit.${candidate.unit}`) })} · 
                {Math.round(candidate.cal)} {t("unit.kcal")} · {t("macro.p")} {candidate.protein} · {t("macro.c")} {candidate.carbs} · {t("macro.f")} {candidate.fat}
              </div>
              {!isSaved && <div className="hint">{t("fit.notSaved")}</div>}
            </div>
            <button className="btn-ghost" onClick={() => setCandidate(null)}>{t("fit.change")}</button>
          </div>
        ) : (
          <>
            <div className="panel-tabs" role="tablist">
              {sources.map(([id, label]) => (
                <button key={id} role="tab" aria-selected={source === id} className={source === id ? "active" : ""} onClick={() => setSource(id)}>
                  {label}
                </button>
              ))}
            </div>
            {source === "mine" && (
              <ProductPicker products={products} placeholder={t("fit.pickMine")} onSelect={setCandidate} />
            )}
            {source === "foods" && <FoodSearch pick onAdd={setCandidate} notify={() => {}} />}
            {source === "label" && <LabelImport existingNames={[]} submitLabel={t("fit.use")} onAdd={setCandidate} />}
            {source === "manual" && <ProductForm submitLabel={t("fit.use")} onSubmit={setCandidate} />}
          </>
        )}

        {candidate && (
          <>
            <h3>2. {t("fit.results")}</h3>
            <div className="builder-tools">
              <label className="field-inline">
                {t("fit.lookIn")}
                <select value={scope} onChange={e => setScope(e.target.value)}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  {plans.length > 1 && <option value="all">{t("fit.allPlans")}</option>}
                </select>
              </label>
              <label className="toolbar-check">
                <input type="checkbox" checked={includeLocked} onChange={e => setIncludeLocked(e.target.checked)} />
                {t("fit.includeLocked")}
              </label>
            </div>

            {swaps.length === 0 ? (
              <p className="muted">{t("fit.none")}</p>
            ) : (
              <div className="swap-list">
                {swaps.map(s => (
                  <div key={s.itemId} className="swap-row">
                    <div className="swap-main">
                      <div className="hint">
                        {scope === "all" ? `${s.planName} · ` : ""}{s.mealName}
                      </div>
                      <div>
                        {s.oldProduct.name} {formatAmount(s.oldAmount)} {t(`unit.${s.oldProduct.unit}`)}
                        {" → "}
                        <strong>{candidate.name} {formatAmount(s.newAmount)} {t(`unit.${candidate.unit}`)}</strong>
                      </div>
                      <div className="swap-delta">
                        {KEYS.map(k => (
                          <span key={k}>{t(`macro.${k === "cal" ? "cal" : k[0]}`)} {signed(k, s.delta[k])}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`fit-badge ${s.level}`}>
                      {t(`fit.${s.level}`)} · {Math.round(s.score * 100)}%
                    </span>
                    <button className="primary-btn" onClick={() => onApply(candidate, s)}>{t("fit.swap")}</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
