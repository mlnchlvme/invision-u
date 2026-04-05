import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import en from './locales/en.json';
import kz from './locales/kz.json';

const savedLang = localStorage.getItem('app_lang') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      kz: { translation: kz },
    },
    lng: savedLang,
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en', 'kz'],
    interpolation: { escapeValue: false },
  });

export default i18n;