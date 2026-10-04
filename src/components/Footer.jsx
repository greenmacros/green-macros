import { useI18n } from "../i18n/context";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="app-footer">
      {t("footer.line")} · <a href="mailto:greenmacrosinfo@gmail.com">greenmacrosinfo@gmail.com</a>
    </footer>
  );
}
