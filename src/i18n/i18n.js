// src/i18n/i18n.js
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
// Assuming these paths are correct relative to this file
import translationEN from './locales/en/sidebar.json';
import translationKM from './locales/kh/sidebar.json';

// You might also need dashboard translations, example:
import dashboardEN from './locales/en/dashboard.json';
import dashboardKM from './locales/kh/dashboard.json';


const resources = {
  en: {
    translation: translationEN,
    dashboard: dashboardEN, // Add dashboard namespace
  },
  km: {
    translation: translationKM,
    dashboard: dashboardKM, // Add dashboard namespace
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    ns: ['translation', 'dashboard'], // Specify namespaces if you use them
    defaultNS: 'translation', // Default namespace
  });

export default i18n;