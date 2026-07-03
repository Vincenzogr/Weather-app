import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationIT from './locales/it.json';
import translationEN from './locales/en.json';
import translationJA from './locales/ja.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';
import translationES from './locales/es.json';

const resources = {
  it: { translation: translationIT },
  en: { translation: translationEN },
  ja: { translation: translationJA },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  es: { translation: translationES },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
