import { useState } from "react";
import NumInput from "../components/NumInput";
import { useI18n } from "../i18n/context";
import { MACRO_KEYS, MACRO_LABEL_KEYS, progressClass } from "../lib/macros";
import { hasTarget } from "../lib/plans";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };

export default function SummaryCard({ id, profile, totals, onProfile, onAutoFill, suggestOpen, onToggleSuggest, children }) {
  const { t } = useI18n();
  const [macro, setMacro] = useState("protein");

  return (
    <section id={id} className="glass-card daily-summary">
      <h3>{t("summary.title")}</h3>

      <div className="summary-grid">
        <div />
        {MACRO_KEYS.map(k => (
          <div key={k} className={`col-${k === "cal" ? "cal" : k}`}>{t(MACRO_LABEL_KEYS[k])}</div>
        ))}

        <div className="row-label">{t("summary.target")}</div>
        {MACRO_KEYS.map(k => (
          <NumInput
            key={k}
            blankZero
            placeholder="—"
            aria-label={`${t(MACRO_LABEL_KEYS[k])} ${t("summary.target")}`}
            value={profile[PROFILE_KEY[k]]}
            onCommit={v => onProfile({ [PROFILE_KEY[k]]: v })}
          />
        ))}

        <div className="row-label">{t("summary.actual")}</div>
        {MACRO_KEYS.map(k => {
          const target = profile[PROFILE_KEY[k]];
          return (
            <div key={k} className="actual-cell">
              <span className={progressClass(totals[k], target)}>
                {totals[k].toFixed(k === "cal" ? 0 : 1)}
              </span>
              {target > 0 && (
                <div className="bar" aria-hidden="true">
                  <div
                    className={`bar-fill ${progressClass(totals[k], target)}`}
                    style={{ width: `${Math.min(100, (totals[k] / target) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="row-label">{t("summary.remaining")}</div>
        {MACRO_KEYS.map(k => {
          const target = profile[PROFILE_KEY[k]];
          const left = target - totals[k];
          const digits = k === "cal" ? 0 : 1;
          return (
            <div key={k} className={`remaining-row ${target && left < 0 ? "off" : ""}`}>
              {target ? (left < 0 ? t("summary.over", { n: (-left).toFixed(digits) }) : left.toFixed(digits)) : "—"}
            </div>
          );
        })}
      </div>

      <div className="autofill-row">
        <span className="muted">{t("summary.autofill")}</span>
        <select value={macro} onChange={e => setMacro(e.target.value)} aria-label={t("summary.macroToHit")}>
          {MACRO_KEYS.map(k => <option key={k} value={k}>{t(MACRO_LABEL_KEYS[k])}</option>)}
        </select>
        <button className="primary-btn" disabled={!hasTarget(profile)} onClick={() => onAutoFill(macro)}>
          {t("summary.scale")}
        </button>
        <span className="hint">{t("summary.lockedStay")}</span>
        <button className="btn-ghost suggest-toggle" aria-expanded={suggestOpen} onClick={onToggleSuggest}>
          {suggestOpen ? t("balance.hide") : t("balance.show")}
        </button>
      </div>
      {children}
    </section>
  );
}
