import { useI18n } from "../i18n/context";

/** Shown when a newer build has been deployed. Reloading fetches it (the service worker is network-first for pages). */
export default function UpdateBanner({ onReload, onLater }) {
  const { t } = useI18n();
  return (
    <div className="storage-notice update-banner" role="status">
      <span className="storage-notice-text">{t("update.available")}</span>
      <span className="storage-notice-actions">
        <button className="primary-btn" onClick={onReload}>{t("update.reload")}</button>
        <button className="btn-ghost" onClick={onLater}>{t("notice.later")}</button>
      </span>
    </div>
  );
}
