'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { en, type Translations } from '@/lib/locales/en'
import { sw } from '@/lib/locales/sw'

export type Language = 'en' | 'sw'

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: en,
})

const translations: Record<Language, Translations> = { en, sw }

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('mfp_lang')
  if (stored === 'en' || stored === 'sw') return stored
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const stored = getStoredLanguage()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguageState(stored)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('mfp_lang', lang)
  }, [])

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
