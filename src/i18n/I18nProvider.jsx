import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nContext } from "./context";
import { detectLang, translate } from "./translate";
import { loadString, saveString } from "../lib/storage";

export default function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => detectLang(loadString("gm_lang")));

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(l => {
    setLangState(l);
    saveString("gm_lang", l);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
