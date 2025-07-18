import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import zhTWTranslations from './locales/zh-TW.json';
import zhCNTranslations from './locales/zh-CN.json';
import jaTranslations from './locales/ja.json';
import koTranslations from './locales/ko.json';

const resources = {
  en: {
    translation: enTranslations
  },
  'zh-TW': {
    translation: zhTWTranslations
  },
  'zh-CN': {
    translation: zhCNTranslations
  },
  ja: {
    translation: jaTranslations
  },
  ko: {
    translation: koTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;