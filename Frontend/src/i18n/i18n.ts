import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import si from './locales/si';
import ta from './locales/ta';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    fallbackLng: 'si', // Default to Sinhala
    lng: localStorage.getItem('i18nextLng') || 'si', // Prefer saved language, otherwise Sinhala
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
