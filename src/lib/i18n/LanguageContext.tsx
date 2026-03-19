"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import th, { type Translations } from "./th";
import en from "./en";

export type Language = "th" | "en";

const translations: Record<Language, Translations> = { th, en };

const STORAGE_KEY = "admin-lang";

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Translations>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "th") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const parts = key.split(".");
      let result: unknown = translations[language];
      for (const part of parts) {
        result = (result as Record<string, unknown>)[part];
      }
      return (result as string) ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
