import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { sk } from '../i18n/sk';
import { en } from '../i18n/en';
import type { Translations } from '../i18n/sk';

export type Language = 'sk' | 'en';

const STORAGE_KEY = 'de-demo-language';
const TRANSLATIONS: Record<Language, Translations> = { sk, en };

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Resolve a dot-notation key against translations.
 * Falls back to SK if EN value missing, then to the key itself.
 */
function resolveKey(translations: Translations, key: string): string {
  const parts = key.split('.');
  let current: any = translations;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = current[p];
    } else {
      return key; // not found — return key as fallback
    }
  }
  return typeof current === 'string' ? current : key;
}

/** Replace {placeholders} in a string with values from `vars` */
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'sk';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'sk' || saved === 'en') return saved;
    return 'sk'; // default Slovak
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => setLangState(newLang);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const translations = TRANSLATIONS[lang];
    let resolved = resolveKey(translations, key);
    // Fallback to SK if EN value === key (i.e. missing in EN)
    if (lang !== 'sk' && resolved === key) {
      resolved = resolveKey(TRANSLATIONS.sk, key);
    }
    return interpolate(resolved, vars);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if used outside provider — return SK
    return {
      lang: 'sk',
      setLang: () => {},
      t: (key: string, vars?: Record<string, string | number>) => {
        const resolved = resolveKey(sk, key);
        return interpolate(resolved, vars);
      },
    };
  }
  return ctx;
}
