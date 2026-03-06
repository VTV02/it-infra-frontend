import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import km from './locales/km.json';
import en from './locales/en.json';

// Get saved language or default to Vietnamese
const savedLang = localStorage.getItem('lang') || 'vi';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    km: { translation: km },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
