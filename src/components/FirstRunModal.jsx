import "./firstrun.css";
import { useI18n } from "../i18n/context";
import LangSwitch from "./LangSwitch";

export default function FirstRunModal({ onFresh, onPreset }) {
  const { t } = useI18n();
  return (
    <div className="gm-modal-backdrop">
      <div className="gm-modal" role="dialog" aria-modal="true">
        <div className="modal-lang"><LangSwitch /></div>
        <h2>{t("first.title")}</h2>
        <p>{t("first.tool")}</p>
        <p>{t("first.choose")}</p>

        <div className="gm-modal-actions">
          <button className="btn-secondary" onClick={onFresh}>{t("first.fresh")}</button>
          <button className="btn-primary" onClick={onPreset}>{t("first.preset")}</button>
        </div>

        <p className="gm-modal-note">{t("first.note")}</p>
      </div>
    </div>
  );
}
