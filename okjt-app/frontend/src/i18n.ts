import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        portfolio: 'Portfolio',
        contact: 'Contact',
        getInTouch: 'Get In Touch',
      },
      hero: {
        title: 'Design-led web engineering.',
        subtitle: 'Design-centered, user-first web experiences.',
      },
    },
  },
  sw: {
    translation: {
      nav: {
        home: 'Nyumbani',
        portfolio: 'Kazi Zetu',
        contact: 'Wasiliana',
        getInTouch: 'Wasiliana Nasi',
      },
      hero: {
        title: 'Uhandisi wa mtandao unaoongozwa na usanifu.',
        subtitle: 'Tovuti zinazoelekezwa kwa mtumiaji na matokeo.',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
