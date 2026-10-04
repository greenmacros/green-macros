import { useI18n } from "../i18n/context";

/** Warning label shown with every auto-generated suggestion. */
export default function AdviceNotice({ compact = false }) {
  const { t } = useI18n();
  return (
    <div className="advice" role="note">
      <strong>⚠ {t("advice.title")}</strong>
      <p>{t("advice.short")}</p>
      {!compact && <p>{t("advice.long")}</p>}
    </div>
  );
}
