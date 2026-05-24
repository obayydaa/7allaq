'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, TranslationKey } from './translations';
import type { Language } from '@/types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('al7allag-lang', newLang);
      document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', newLang);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('al7allag-lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLang(saved);
    }
  }, [setLang]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] || key;
    },
    [lang]
  );

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
