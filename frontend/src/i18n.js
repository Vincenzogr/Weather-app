import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from './utils/storage';

import it from './locales/it.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

const LANGUAGE_KEY = 'meteo.language';
const SUPPORTED = ['it', 'en', 'fr', 'de', 'es', 'ja'];

/** Lingua salvata, altrimenti quella del browser se supportata, altrimenti italiano. */
function initialLanguage() {
  const saved = storage.get(LANGUAGE_KEY, null);
  if (SUPPORTED.includes(saved)) return saved;
  const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : 'it';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
      ja: { translation: ja },
    },
    lng: initialLanguage(),
    fallbackLng: 'en',
    supportedLngs: SUPPORTED,
    interpolation: { escapeValue: false },
  });

const syncDocumentLanguage = (lng) => {
  document.documentElement.lang = lng;
  storage.set(LANGUAGE_KEY, lng);
};
syncDocumentLanguage(i18n.resolvedLanguage);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
