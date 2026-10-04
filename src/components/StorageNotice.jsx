import { useI18n } from "../i18n/context";

/** One gentle banner: either "add to home screen" (iPhone) or "back up your data". */
export default function StorageNotice({ kind, daysSinceBackup, onBackup, onDismiss }) {
  const { t } = useI18n();
  if (!kind) return null;

  return (
    <div className="storage-notice" role="note">
      <span className="storage-notice-text">
        {kind === "ios" ? (
          t("notice.ios")
        ) : (
          <>
            {daysSinceBackup == null ? t("notice.backupNever") : t("notice.backupOld", { n: daysSinceBackup })}{" "}
            {t("notice.backupWhy")}
          </>
        )}
      </span>
      <span className="storage-notice-actions">
        {kind === "backup" && (
          <button className="primary-btn" onClick={onBackup}>{t("notice.backupNow")}</button>
        )}
        <button className="btn-ghost" onClick={onDismiss}>
          {kind === "ios" ? t("notice.gotIt") : t("notice.later")}
        </button>
      </span>
    </div>
  );
}
