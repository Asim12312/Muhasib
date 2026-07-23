"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { STRINGS, StringKey, Lang } from "./strings";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => STRINGS[k].en,
});

export function LangProvider({ children, initial }: { children: ReactNode; initial: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    document.cookie = `mohasib_lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: (k) => STRINGS[k][lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
