import "./firstrun.css";
import { useI18n } from "../i18n/context";

export default function ShareImportModal({ shared, onMerge, onReplace, onCancel }) {
  const { t } = useI18n();
  return (
    <div className="gm-modal-backdrop">
      <div className="gm-modal" role="dialog" aria-modal="true">
        <h2>{t("share.title")}</h2>
        <p>
          {t("share.body", {
            plans: shared.plans.length,
            names: shared.plans.map(p => p.name).join(", "),
            products: shared.products.length
          })}
        </p>
        <div className="gm-modal-actions column">
          <button className="btn-primary" onClick={onMerge}>{t("share.merge")}</button>
          <button className="btn-secondary" onClick={onReplace}>{t("share.replace")}</button>
          <button className="btn-secondary" onClick={onCancel}>{t("share.ignore")}</button>
        </div>
        <p className="gm-modal-note">{t("share.note")}</p>
      </div>
    </div>
  );
}
