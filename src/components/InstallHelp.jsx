import "./firstrun.css";
import { useI18n } from "../i18n/context";

/** Manual "add to home screen" steps for iPhone / iPad, where there is no install prompt. */
export default function InstallHelp({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="gm-modal-backdrop" onClick={onClose}>
      <div className="gm-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <h2>{t("install.title")}</h2>
        <ol>
          <li>{t("install.step1")}</li>
          <li>{t("install.step2")}</li>
          <li>{t("install.step3")}</li>
        </ol>
        <p className="hint">{t("install.why")}</p>
        <div className="gm-modal-actions">
          <button className="btn-primary" onClick={onClose}>{t("common.close")}</button>
        </div>
      </div>
    </div>
  );
}
