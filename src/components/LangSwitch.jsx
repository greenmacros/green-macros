import Flag from "./Flag";
import { useI18n } from "../i18n/context";

const LANGS = [
  ["en", "English"],
  ["ja", "日本語"]
];

/** Two flag buttons; the current language is highlighted. */
export default function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="seg lang-switch" role="group" aria-label="Language / 言語">
      {LANGS.map(([code, name]) => (
        <button
          key={code}
          className={lang === code ? "on" : ""}
          aria-pressed={lang === code}
          title={name}
          aria-label={name}
          onClick={() => setLang(code)}
        >
          <Flag lang={code} />
        </button>
      ))}
    </div>
  );
}
