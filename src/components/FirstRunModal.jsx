import "./firstrun.css";
import { useI18n } from "../i18n/context";
import LangSwitch from "./LangSwitch";

export default function FirstRunModal({ onStart }) {
  const { t } = useI18n();
  return (
    <div className="gm-modal-backdrop">
      <div className="gm-modal" role="dialog" aria-modal="true">
        <div className="modal-lang"><LangSwitch /></div>
        <h2>{t("first.title")}</h2>
        <p>{t("first.tool")}</p>

        <div className="gm-modal-actions">
          <button className="btn-primary" onClick={onStart}>{t("first.start")}</button>
        </div>
      </div>
    </div>
  );
}
