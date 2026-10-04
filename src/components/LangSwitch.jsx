import { useI18n } from "../i18n/context";

export default function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label="Language / 言語">
      <button className={lang === "en" ? "on" : ""} aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
      <button className={lang === "ja" ? "on" : ""} aria-pressed={lang === "ja"} onClick={() => setLang("ja")}>日本語</button>
    </div>
  );
}
