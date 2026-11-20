import { create } from 'zustand'
import { translations, SupportedLanguage } from './translations'

interface I18nState {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string, defaultText?: string) => string
}

export const useI18nStore = create<I18nState>((set, get) => {
  const savedLang = (localStorage.getItem('shikhar_language') as SupportedLanguage) || 'en'
  const validLang: SupportedLanguage = ['en', 'hi', 'ta'].includes(savedLang) ? savedLang : 'en'

  return {
    language: validLang,
    setLanguage: (lang: SupportedLanguage) => {
      localStorage.setItem('shikhar_language', lang)
      set({ language: lang })
    },
    t: (key: string, defaultText?: string) => {
      const currentLang = get().language
      const item = translations[key]
      if (item && item[currentLang]) {
        return item[currentLang]
      }
      return defaultText || item?.en || key
    }
  }
})
