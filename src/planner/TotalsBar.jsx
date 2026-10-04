import { useI18n } from "../i18n/context";
import { MACRO_KEYS, progressClass } from "../lib/macros";
import { hasTarget } from "../lib/plans";

const PROFILE_KEY = { cal: "calories", protein: "protein", carbs: "carbs", fat: "fat" };

/** Slim sticky summary: always visible while you build the day. */
export default function TotalsBar({ profile, totals, hidden, onDetails }) {
  const { t } = useI18n();
  const targeted = hasTarget(profile);
  if (!targeted && totals.cal <= 0) return null;

  return (
    <div className={`totals-bar ${hidden ? "is-hidden" : ""}`} role="status" aria-hidden={hidden}>
      {MACRO_KEYS.map(k => {
        const target = profile[PROFILE_KEY[k]];
        const cls = progressClass(totals[k], target);
        return (
          <div key={k} className="totals-cell">
            <span className="totals-label">{t(`macro.${k}`)}</span>
            <span className={`totals-value ${cls}`}>
              {totals[k].toFixed(0)}
              {target > 0 && <small> / {target}</small>}
            </span>
            {target > 0 && (
              <span className="totals-track" aria-hidden="true">
                <span className={`totals-fill ${cls}`} style={{ width: `${Math.min(100, (totals[k] / target) * 100)}%` }} />
              </span>
            )}
          </div>
        );
      })}
      <button className="btn-ghost totals-details" tabIndex={hidden ? -1 : 0} onClick={onDetails}>{t("summary.details")}</button>
    </div>
  );
}
