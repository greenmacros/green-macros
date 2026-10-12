import { useI18n } from "../i18n/context";

const SOURCES = [
  { key: "mext", href: "https://www.mext.go.jp/a_menu/syokuhinseibun/mext_01110.html" },
  { key: "usda", href: "https://fdc.nal.usda.gov/" },
  { key: "off", href: "https://world.openfoodfacts.org/" }
];

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="app-footer">
      {t("footer.line")} · <a href="mailto:greenmacrosinfo@gmail.com">greenmacrosinfo@gmail.com</a>
      <details className="data-sources">
        <summary>{t("sources.title")}</summary>
        <ul>
          {SOURCES.map(s => (
            <li key={s.key}>
              <a href={s.href} target="_blank" rel="noreferrer noopener">{t(`sources.${s.key}.name`)}</a>
              {" — "}
              {t(`sources.${s.key}.note`)}
            </li>
          ))}
        </ul>
        <p>{t("sources.verify")}</p>
      </details>
    </footer>
  );
}
