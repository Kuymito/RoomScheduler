'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '/public/locales/en/en.json';
import kmTranslations from '/public/locales/km/km.json';

const translations = {
  en: enTranslations,
  km: kmTranslations,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && translations[storedLanguage]) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key, options) => {
    const keys = key.split('.');
    let currentTranslationSource = translations[language] || translations['en'];
    let current = currentTranslationSource;

    for (let k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = translations['en']; // Fallback to English
        for (let k_en of keys) {
          if (current && typeof current === 'object' && k_en in current) {
            current = current[k_en];
          } else {
            return key; 
          }
        }
        break; 
      }
    }
    
    if (typeof current === 'string' && options) {
        return current.replace(/\{(\w+)\}/g, (match, p1) => options[p1] !== undefined ? options[p1] : match);
    }
    return typeof current === 'string' ? current : key;
  };
  

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};