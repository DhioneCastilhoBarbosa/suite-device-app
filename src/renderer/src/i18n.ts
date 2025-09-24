// src/renderer/src/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from '../../locales/en/translation.json'
import es from '../../locales/es/translation.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, es: { translation: es } },
      supportedLngs: ['pt', 'en', 'es'],
      fallbackLng: 'pt',
      nonExplicitSupportedLngs: true, // pt-BR -> pt
      load: 'currentOnly',
      keySeparator: false,
      nsSeparator: false,
      interpolation: { escapeValue: false },
      detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
      react: { useSuspense: false, bindI18n: 'languageChanged' }
    })
}

export default i18n
