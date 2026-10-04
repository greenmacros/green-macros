import { createContext, useContext } from "react";
import { translate } from "./translate";

export const I18nContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key, vars) => translate("en", key, vars)
});

export const useI18n = () => useContext(I18nContext);
